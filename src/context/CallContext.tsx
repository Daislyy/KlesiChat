import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import type { CurrentUser, OnlineUser } from "../types/chat";
import { playNotificationSound } from "../lib/audioNotification";

export type CallStatus =
  | "idle"
  | "calling"
  | "incoming"
  | "connecting"
  | "connected"
  | "ended"
  | "rejected";

export interface CallUser {
  id: string;
  username: string;
  avatar_url: string;
}

interface CallContextType {
  callStatus: CallStatus;
  isMuted: boolean;
  callDuration: number;
  activeOtherUser: CallUser | null;
  incomingCaller: CallUser | null;
  remoteAudioRef: React.RefObject<HTMLAudioElement | null>;
  startCall: (targetUser: CallUser) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  onlineUsers: OnlineUser[];
}

const CallContext = createContext<CallContextType | null>(null);

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stun.cloudflare.com:3478" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ],
  iceCandidatePoolSize: 10,
};

function getCallRoomId(userA: string, userB: string) {
  return [userA, userB].sort().join("-");
}

export function CallProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [activeOtherUser, setActiveOtherUser] = useState<CallUser | null>(null);
  const [incomingCaller, setIncomingCaller] = useState<CallUser | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  // Channels
  const personalChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const roomChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const currentRoomIdRef = useRef<string | null>(null);

  // Timers & Queues
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  // Stable references for async callbacks
  const currentUserRef = useRef<CurrentUser | null>(null);
  currentUserRef.current = currentUser;
  const activeOtherUserRef = useRef<CallUser | null>(null);
  activeOtherUserRef.current = activeOtherUser;
  const incomingCallerRef = useRef<CallUser | null>(null);
  incomingCallerRef.current = incomingCaller;
  const callStatusRef = useRef<CallStatus>(callStatus);
  callStatusRef.current = callStatus;

  // ── 1. User Authentication Tracking ──
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("profiles")
          .select("username,avatar_url")
          .eq("id", user.id)
          .single()
          .then(({ data }) => {
            setCurrentUser({
              id: user.id,
              username: data?.username || "",
              avatar_url: data?.avatar_url || "",
            });
          });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        supabase
          .from("profiles")
          .select("username,avatar_url")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            setCurrentUser({
              id: session.user.id,
              username: data?.username || "",
              avatar_url: data?.avatar_url || "",
            });
          });
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── 1b. Global Presence Tracking ──
  useEffect(() => {
    if (!currentUser?.id || !currentUser?.username) {
      setOnlineUsers([]);
      return;
    }

    const presenceChan = supabase.channel("global-presence", {
      config: { presence: { key: currentUser.id } },
    });

    const syncPresence = () => {
      const state = presenceChan.presenceState();
      const all = Object.values(state).flat() as any[];
      const userMap = new Map<string, OnlineUser>();

      all.forEach((u) => {
        if (u.username && !userMap.has(u.username)) {
          userMap.set(u.username, {
            username: u.username,
            avatar_url: u.avatar_url || "",
          });
        }
      });

      // Ensure active current user is always included in online list
      if (currentUser.username && !userMap.has(currentUser.username)) {
        userMap.set(currentUser.username, {
          username: currentUser.username,
          avatar_url: currentUser.avatar_url || "",
        });
      }

      setOnlineUsers(Array.from(userMap.values()));
    };

    presenceChan
      .on("presence", { event: "sync" }, syncPresence)
      .on("presence", { event: "join" }, syncPresence)
      .on("presence", { event: "leave" }, syncPresence)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChan.track({
            username: currentUser.username,
            avatar_url: currentUser.avatar_url,
          });
        }
      });

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        presenceChan.track({
          username: currentUser.username,
          avatar_url: currentUser.avatar_url,
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      supabase.removeChannel(presenceChan);
    };
  }, [currentUser?.id, currentUser?.username, currentUser?.avatar_url]);

  // ── 2. WebRTC & Resources Cleanup ──
  const cleanupWebRTC = useCallback(() => {
    if (connectingTimeoutRef.current) {
      clearTimeout(connectingTimeoutRef.current);
      connectingTimeoutRef.current = null;
    }
    if (callingTimeoutRef.current) {
      clearTimeout(callingTimeoutRef.current);
      callingTimeoutRef.current = null;
    }
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.oniceconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
    if (roomChannelRef.current) {
      supabase.removeChannel(roomChannelRef.current);
      roomChannelRef.current = null;
    }
    currentRoomIdRef.current = null;
    pendingIceCandidatesRef.current = [];
    setCallDuration(0);
    setIsMuted(false);
  }, []);

  // Clean up on tab close / reload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (callStatusRef.current !== "idle") {
        if (roomChannelRef.current) {
          roomChannelRef.current.send({
            type: "broadcast",
            event: "call:end",
            payload: { senderId: currentUserRef.current?.id },
          });
        }
        cleanupWebRTC();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [cleanupWebRTC]);

  // ── 3. Microphone Access ──
  const getMicrophoneStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      localStreamRef.current = stream;
      return stream;
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("Izin mikrofon diperlukan untuk melakukan panggilan suara.");
      throw err;
    }
  }, []);

  // ── 4. Process Queued ICE Candidates ──
  const processPendingIce = useCallback(async (pc: RTCPeerConnection) => {
    if (!pc.remoteDescription) return;
    while (pendingIceCandidatesRef.current.length > 0) {
      const candidate = pendingIceCandidatesRef.current.shift();
      if (candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.warn("Error adding queued ICE candidate:", e);
        }
      }
    }
  }, []);

  // ── 5. Setup RTCPeerConnection ──
  const setupPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) return peerConnectionRef.current;

    const pc = new RTCPeerConnection(RTC_CONFIG);

    // Send local ICE candidates to active call room
    pc.onicecandidate = (event) => {
      if (event.candidate && roomChannelRef.current) {
        roomChannelRef.current.send({
          type: "broadcast",
          event: "call:ice-candidate",
          payload: {
            senderId: currentUserRef.current?.id,
            candidate: event.candidate.toJSON(),
          },
        });
      }
    };

    // Receive remote audio track
    pc.ontrack = (event) => {
      console.log("Remote track received:", event);
      const stream =
        event.streams && event.streams[0]
          ? event.streams[0]
          : new MediaStream([event.track]);

      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
        remoteAudioRef.current
          .play()
          .catch((err) => console.warn("Audio autoplay blocked:", err));
      }
    };

    // Helper when call successfully connects
    const onConnected = () => {
      if (connectingTimeoutRef.current) {
        clearTimeout(connectingTimeoutRef.current);
        connectingTimeoutRef.current = null;
      }
      if (callingTimeoutRef.current) {
        clearTimeout(callingTimeoutRef.current);
        callingTimeoutRef.current = null;
      }
      setCallStatus("connected");
      if (!durationTimerRef.current) {
        durationTimerRef.current = setInterval(() => {
          setCallDuration((prev) => prev + 1);
        }, 1000);
      }
    };

    // Monitor connection states
    pc.onconnectionstatechange = () => {
      console.log("WebRTC connectionState:", pc.connectionState);
      if (pc.connectionState === "connected") {
        onConnected();
      } else if (pc.connectionState === "failed") {
        console.warn("WebRTC connection failed");
        handleCallTermination();
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("ICE connectionState:", pc.iceConnectionState);
      if (
        pc.iceConnectionState === "connected" ||
        pc.iceConnectionState === "completed"
      ) {
        onConnected();
      } else if (pc.iceConnectionState === "failed") {
        console.warn("ICE connection failed");
        handleCallTermination();
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, []);

  const handleCallTermination = useCallback(() => {
    cleanupWebRTC();
    setCallStatus("ended");
    setActiveOtherUser(null);
    setIncomingCaller(null);
    setTimeout(() => setCallStatus("idle"), 2000);
  }, [cleanupWebRTC]);

  // Timeout guard: if stuck in connecting for > 25 seconds
  const startConnectingTimeout = useCallback(() => {
    if (connectingTimeoutRef.current) {
      clearTimeout(connectingTimeoutRef.current);
    }
    connectingTimeoutRef.current = setTimeout(() => {
      if (
        callStatusRef.current === "connecting" ||
        callStatusRef.current === "calling"
      ) {
        console.warn("Call connecting timed out");
        handleCallTermination();
      }
    }, 25000);
  }, [handleCallTermination]);

  // ── 6. Setup Shared Call Room (Signaling) ──
  const joinCallRoom = useCallback(
    async (roomId: string, isCaller: boolean) => {
      // Clean up previous room if any
      if (roomChannelRef.current) {
        supabase.removeChannel(roomChannelRef.current);
        roomChannelRef.current = null;
      }

      currentRoomIdRef.current = roomId;
      const channel = supabase.channel(`call-room-${roomId}`);

      channel
        .on("broadcast", { event: "call:accept" }, async ({ payload }) => {
          if (payload.senderId !== currentUserRef.current?.id && isCaller) {
            console.log("Receiver accepted, caller creating offer...");
            setCallStatus("connecting");
            startConnectingTimeout();

            const pc = setupPeerConnection();
            if (localStreamRef.current) {
              localStreamRef.current.getTracks().forEach((track) => {
                if (!pc.getSenders().some((s) => s.track === track)) {
                  pc.addTrack(track, localStreamRef.current!);
                }
              });
            }
            try {
              const offer = await pc.createOffer({ offerToReceiveAudio: true });
              await pc.setLocalDescription(offer);
              channel.send({
                type: "broadcast",
                event: "call:offer",
                payload: {
                  senderId: currentUserRef.current?.id,
                  sdp: offer,
                },
              });
            } catch (err) {
              console.error("Offer creation failed:", err);
              handleCallTermination();
            }
          }
        })
        .on("broadcast", { event: "call:offer" }, async ({ payload }) => {
          if (payload.senderId !== currentUserRef.current?.id && !isCaller) {
            console.log("Offer received, receiver creating answer...");
            setCallStatus("connecting");
            startConnectingTimeout();

            const pc = setupPeerConnection();
            if (localStreamRef.current) {
              localStreamRef.current.getTracks().forEach((track) => {
                if (!pc.getSenders().some((s) => s.track === track)) {
                  pc.addTrack(track, localStreamRef.current!);
                }
              });
            }
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
              await processPendingIce(pc);
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              channel.send({
                type: "broadcast",
                event: "call:answer",
                payload: {
                  senderId: currentUserRef.current?.id,
                  sdp: answer,
                },
              });
            } catch (err) {
              console.error("Answer creation failed:", err);
              handleCallTermination();
            }
          }
        })
        .on("broadcast", { event: "call:answer" }, async ({ payload }) => {
          if (payload.senderId !== currentUserRef.current?.id && isCaller) {
            console.log("Answer received by caller");
            const pc = peerConnectionRef.current;
            if (pc) {
              try {
                await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
                await processPendingIce(pc);
              } catch (err) {
                console.error("Error setting remote description (answer):", err);
              }
            }
          }
        })
        .on("broadcast", { event: "call:ice-candidate" }, async ({ payload }) => {
          if (payload.senderId !== currentUserRef.current?.id) {
            const pc = peerConnectionRef.current;
            if (pc && pc.remoteDescription) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
              } catch (err) {
                console.warn("ICE candidate add failed:", err);
              }
            } else {
              pendingIceCandidatesRef.current.push(payload.candidate);
            }
          }
        })
        .on("broadcast", { event: "call:reject" }, () => {
          setCallStatus("rejected");
          cleanupWebRTC();
          setActiveOtherUser(null);
          setIncomingCaller(null);
          setTimeout(() => setCallStatus("idle"), 2500);
        })
        .on("broadcast", { event: "call:end" }, () => {
          handleCallTermination();
        });

      roomChannelRef.current = channel;

      return new Promise<void>((resolve) => {
        channel.subscribe((status) => {
          if (status === "SUBSCRIBED") {
            resolve();
          }
        });
      });
    },
    [
      setupPeerConnection,
      processPendingIce,
      startConnectingTimeout,
      handleCallTermination,
      cleanupWebRTC,
    ]
  );

  // ── 7. Personal Channel Subscription (Incoming Invites) ──
  useEffect(() => {
    if (!currentUser?.id) return;

    const myChannel = supabase.channel(`user-calls-${currentUser.id}`);

    myChannel
      .on("broadcast", { event: "call:invite" }, ({ payload }) => {
        if (payload.callerId !== currentUserRef.current?.id) {
          // If already on a call, immediately reply busy
          if (callStatusRef.current !== "idle") {
            const busyChan = supabase.channel(`user-calls-${payload.callerId}`);
            busyChan.subscribe((s) => {
              if (s === "SUBSCRIBED") {
                busyChan
                  .send({
                    type: "broadcast",
                    event: "call:busy",
                    payload: { receiverId: currentUserRef.current?.id },
                  })
                  .finally(() => supabase.removeChannel(busyChan));
              }
            });
            return;
          }

          const caller: CallUser = {
            id: payload.callerId,
            username: payload.callerUsername,
            avatar_url: payload.callerAvatar,
          };
          currentRoomIdRef.current = payload.roomId;
          setIncomingCaller(caller);
          setActiveOtherUser(caller);
          setCallStatus("incoming");
          playNotificationSound();

          // Auto-cancel incoming call if no response in 45s
          if (callingTimeoutRef.current) clearTimeout(callingTimeoutRef.current);
          callingTimeoutRef.current = setTimeout(() => {
            if (callStatusRef.current === "incoming") {
              setCallStatus("idle");
              setActiveOtherUser(null);
              setIncomingCaller(null);
              cleanupWebRTC();
            }
          }, 45000);
        }
      })
      .on("broadcast", { event: "call:cancel" }, () => {
        if (callStatusRef.current === "incoming") {
          setCallStatus("ended");
          cleanupWebRTC();
          setActiveOtherUser(null);
          setIncomingCaller(null);
          setTimeout(() => setCallStatus("idle"), 1500);
        }
      })
      .on("broadcast", { event: "call:reject" }, () => {
        setCallStatus("rejected");
        cleanupWebRTC();
        setActiveOtherUser(null);
        setIncomingCaller(null);
        setTimeout(() => setCallStatus("idle"), 2500);
      })
      .on("broadcast", { event: "call:busy" }, () => {
        setCallStatus("rejected");
        cleanupWebRTC();
        setActiveOtherUser(null);
        setIncomingCaller(null);
        setTimeout(() => setCallStatus("idle"), 2500);
      })
      .subscribe();

    personalChannelRef.current = myChannel;

    return () => {
      cleanupWebRTC();
      supabase.removeChannel(myChannel);
      personalChannelRef.current = null;
    };
  }, [currentUser?.id, cleanupWebRTC]);

  // ── 8. Public Call Actions ──

  const startCall = async (targetUser: CallUser) => {
    if (!currentUser) return;

    const roomId = getCallRoomId(currentUser.id, targetUser.id);
    setActiveOtherUser(targetUser);

    try {
      await getMicrophoneStream();
      setCallStatus("calling");

      // Join shared call room
      await joinCallRoom(roomId, true);

      // Send invite to target user's personal channel
      const inviteChannel = supabase.channel(`user-calls-${targetUser.id}`);
      inviteChannel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          inviteChannel
            .send({
              type: "broadcast",
              event: "call:invite",
              payload: {
                callerId: currentUser.id,
                callerUsername: currentUser.username,
                callerAvatar: currentUser.avatar_url,
                roomId,
              },
            })
            .finally(() => {
              supabase.removeChannel(inviteChannel);
            });
        }
      });

      // Calling timeout: 45 seconds if target doesn't pick up
      if (callingTimeoutRef.current) clearTimeout(callingTimeoutRef.current);
      callingTimeoutRef.current = setTimeout(() => {
        if (callStatusRef.current === "calling") {
          // Send cancel message
          const cancelChan = supabase.channel(`user-calls-${targetUser.id}`);
          cancelChan.subscribe((s) => {
            if (s === "SUBSCRIBED") {
              cancelChan
                .send({
                  type: "broadcast",
                  event: "call:cancel",
                  payload: { callerId: currentUser.id },
                })
                .finally(() => supabase.removeChannel(cancelChan));
            }
          });
          setCallStatus("ended");
          cleanupWebRTC();
          setActiveOtherUser(null);
          setTimeout(() => setCallStatus("idle"), 2000);
        }
      }, 45000);
    } catch (e) {
      console.error("Failed to start call", e);
      setCallStatus("idle");
      setActiveOtherUser(null);
      cleanupWebRTC();
    }
  };

  const acceptCall = async () => {
    const me = currentUser;
    const caller = incomingCaller;
    const roomId = currentRoomIdRef.current;
    if (!me || !caller || !roomId) return;

    if (callingTimeoutRef.current) {
      clearTimeout(callingTimeoutRef.current);
      callingTimeoutRef.current = null;
    }

    try {
      await getMicrophoneStream();
      setCallStatus("connecting");
      startConnectingTimeout();

      // Join shared call room
      await joinCallRoom(roomId, false);

      // Notify caller that receiver accepted
      if (roomChannelRef.current) {
        await roomChannelRef.current.send({
          type: "broadcast",
          event: "call:accept",
          payload: { senderId: me.id },
        });
      }
    } catch (e) {
      console.error("Failed to accept call", e);
      setCallStatus("idle");
      cleanupWebRTC();
    }
  };

  const rejectCall = async () => {
    const me = currentUser;
    const caller = incomingCaller;
    const roomId = currentRoomIdRef.current;

    if (callingTimeoutRef.current) {
      clearTimeout(callingTimeoutRef.current);
      callingTimeoutRef.current = null;
    }

    if (caller && me) {
      const rejectChan = supabase.channel(`user-calls-${caller.id}`);
      rejectChan.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          rejectChan
            .send({
              type: "broadcast",
              event: "call:reject",
              payload: { senderId: me.id },
            })
            .finally(() => supabase.removeChannel(rejectChan));
        }
      });

      if (roomId && roomChannelRef.current) {
        roomChannelRef.current.send({
          type: "broadcast",
          event: "call:reject",
          payload: { senderId: me.id },
        });
      }
    }

    setCallStatus("rejected");
    cleanupWebRTC();
    setActiveOtherUser(null);
    setIncomingCaller(null);
    setTimeout(() => setCallStatus("idle"), 2000);
  };

  const endCall = async () => {
    const me = currentUser;
    const target = activeOtherUser;
    const currentDur = callDuration;
    const wasConnected = callStatusRef.current === "connected";

    if (callingTimeoutRef.current) {
      clearTimeout(callingTimeoutRef.current);
      callingTimeoutRef.current = null;
    }

    // Broadcast end to shared room
    if (roomChannelRef.current && me) {
      roomChannelRef.current.send({
        type: "broadcast",
        event: "call:end",
        payload: { senderId: me.id },
      });
    }

    // If canceled while still calling, inform target's personal channel
    if (callStatusRef.current === "calling" && target && me) {
      const cancelChan = supabase.channel(`user-calls-${target.id}`);
      cancelChan.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          cancelChan
            .send({
              type: "broadcast",
              event: "call:cancel",
              payload: { callerId: me.id },
            })
            .finally(() => supabase.removeChannel(cancelChan));
        }
      });
    }

    // Insert call log into direct_messages
    if (wasConnected && me && target && currentDur > 0) {
      const minutes = Math.floor(currentDur / 60);
      const seconds = currentDur % 60;
      const durationStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

      supabase
        .from("direct_messages")
        .insert({
          content: `Panggilan suara selesai (${durationStr})`,
          type: "call_log",
          sender_id: me.id,
          receiver_id: target.id,
        })
        .then();
    }

    setCallStatus("ended");
    cleanupWebRTC();
    setActiveOtherUser(null);
    setIncomingCaller(null);
    setTimeout(() => setCallStatus("idle"), 1500);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  return (
    <CallContext.Provider
      value={{
        callStatus,
        isMuted,
        callDuration,
        activeOtherUser,
        incomingCaller,
        remoteAudioRef,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        onlineUsers,
      }}
    >
      {children}
      {/* Permanent hidden audio element for remote stream playback */}
      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
        style={{ display: "none" }}
      />
    </CallContext.Provider>
  );
}

export function useCall() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
}
