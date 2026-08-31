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
import type { CurrentUser } from "../types/chat";

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
}

const CallContext = createContext<CallContextType | null>(null);

const STUN_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stun.services.mozilla.com" },
  ],
};

export function CallProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [activeOtherUser, setActiveOtherUser] = useState<CallUser | null>(null);
  const [incomingCaller, setIncomingCaller] = useState<CallUser | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const myChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const targetChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  // Refs for stable access in channel callbacks (avoid re-subscription)
  const currentUserRef = useRef<CurrentUser | null>(null);
  currentUserRef.current = currentUser;
  const activeOtherUserRef = useRef<CallUser | null>(null);
  activeOtherUserRef.current = activeOtherUser;
  const incomingCallerRef = useRef<CallUser | null>(null);
  incomingCallerRef.current = incomingCaller;
  const callStatusRef = useRef<CallStatus>(callStatus);
  callStatusRef.current = callStatus;

  // Fetch current user on mount & auth changes
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

  // Initialize hidden audio element
  useEffect(() => {
    const audio = new Audio();
    audio.autoplay = true;
    remoteAudioRef.current = audio;
    return () => {
      audio.pause();
      audio.srcObject = null;
    };
  }, []);

  // Cleanup WebRTC only
  const cleanupWebRTC = useCallback(() => {
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
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
    pendingIceCandidatesRef.current = [];
    setCallDuration(0);
    setIsMuted(false);
  }, []);

  // Get microphone
  const getMicrophoneStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      localStreamRef.current = stream;
      return stream;
    } catch {
      alert("Izin mikrofon ditolak.");
      throw new Error("Microphone permission denied");
    }
  }, []);

  // ── WebRTC setup (uses refs, no stale closures) ──────────────
  const setupPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) return peerConnectionRef.current;

    const pc = new RTCPeerConnection(STUN_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const target = activeOtherUserRef.current;
        if (target) {
          const chan =
            targetChannelRef.current ||
            supabase.channel(`user-calls-${target.id}`);
          chan.send({
            type: "broadcast",
            event: "call:ice-candidate",
            payload: {
              senderId: currentUserRef.current?.id,
              candidate: event.candidate.toJSON(),
            },
          });
        }
      }
    };

    pc.ontrack = (event) => {
      if (remoteAudioRef.current && event.streams[0]) {
        remoteAudioRef.current.srcObject = event.streams[0];
        remoteAudioRef.current.play().catch((err) =>
          console.warn("Autoplay blocked:", err),
        );
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("WebRTC state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setCallStatus("connected");
        if (!durationTimerRef.current) {
          durationTimerRef.current = setInterval(() => {
            setCallDuration((prev) => prev + 1);
          }, 1000);
        }
      } else if (pc.connectionState === "connecting") {
        setCallStatus("connecting");
      } else if (
        pc.connectionState === "failed" ||
        pc.connectionState === "closed"
      ) {
        cleanupWebRTC();
        setCallStatus("idle");
        setActiveOtherUser(null);
        setIncomingCaller(null);
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [cleanupWebRTC]);

  // Process queued ICE
  const processPendingIce = useCallback(async () => {
    const pc = peerConnectionRef.current;
    if (!pc || !pc.remoteDescription) return;
    while (pendingIceCandidatesRef.current.length > 0) {
      const c = pendingIceCandidatesRef.current.shift();
      if (c) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(c));
        } catch (e) {
          console.error("ICE add error:", e);
        }
      }
    }
  }, []);

  // Offer (caller)
  const createOffer = useCallback(async () => {
    const me = currentUserRef.current;
    const target = activeOtherUserRef.current;
    if (!me || !target || !localStreamRef.current) return;
    try {
      setCallStatus("connecting");
      const pc = setupPeerConnection();
      localStreamRef.current.getTracks().forEach((track) => {
        if (!pc.getSenders().some((s) => s.track === track)) {
          pc.addTrack(track, localStreamRef.current!);
        }
      });
      const offer = await pc.createOffer({ offerToReceiveAudio: true });
      await pc.setLocalDescription(offer);
      const chan =
        targetChannelRef.current ||
        supabase.channel(`user-calls-${target.id}`);
      await chan.send({
        type: "broadcast",
        event: "call:offer",
        payload: { senderId: me.id, sdp: offer },
      });
    } catch (e) {
      console.error("Offer error:", e);
    }
  }, [setupPeerConnection]);

  // Handle offer (receiver)
  const handleOffer = useCallback(
    async (sdp: RTCSessionDescriptionInit) => {
      const me = currentUserRef.current;
      if (!me || !localStreamRef.current) return;
      try {
        setCallStatus("connecting");
        const pc = setupPeerConnection();
        localStreamRef.current.getTracks().forEach((track) => {
          if (!pc.getSenders().some((s) => s.track === track)) {
            pc.addTrack(track, localStreamRef.current!);
          }
        });
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        await processPendingIce();
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        const caller =
          incomingCallerRef.current || activeOtherUserRef.current;
        if (caller) {
          const chan =
            targetChannelRef.current ||
            supabase.channel(`user-calls-${caller.id}`);
          await chan.send({
            type: "broadcast",
            event: "call:answer",
            payload: { senderId: me.id, sdp: answer },
          });
        }
      } catch (e) {
        console.error("Handle offer error:", e);
      }
    },
    [setupPeerConnection, processPendingIce],
  );

  // Handle answer
  const handleAnswer = useCallback(
    async (sdp: RTCSessionDescriptionInit) => {
      const pc = peerConnectionRef.current;
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          await processPendingIce();
        } catch (e) {
          console.error("Handle answer error:", e);
        }
      }
    },
    [processPendingIce],
  );

  // Handle ICE
  const handleIce = useCallback(async (candidate: RTCIceCandidateInit) => {
    const pc = peerConnectionRef.current;
    if (pc && pc.remoteDescription) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("ICE error:", e);
      }
    } else {
      pendingIceCandidatesRef.current.push(candidate);
    }
  }, []);

  // ── Channel: subscribe ONCE per userId, use refs for callbacks ──
  useEffect(() => {
    if (!currentUser?.id) return;

    const channel = supabase.channel(`user-calls-${currentUser.id}`);

    channel
      .on("broadcast", { event: "call:invite" }, ({ payload }) => {
        if (payload.callerId !== currentUserRef.current?.id) {
          const caller: CallUser = {
            id: payload.callerId,
            username: payload.callerUsername,
            avatar_url: payload.callerAvatar,
          };
          setIncomingCaller(caller);
          setActiveOtherUser(caller);
          setCallStatus("incoming");
          targetChannelRef.current = supabase.channel(
            `user-calls-${payload.callerId}`,
          );
        }
      })
      .on("broadcast", { event: "call:accept" }, ({ payload }) => {
        if (payload.receiverId !== currentUserRef.current?.id) {
          setCallStatus("connecting");
          createOffer();
        }
      })
      .on("broadcast", { event: "call:reject" }, () => {
        setCallStatus("rejected");
        cleanupWebRTC();
        setActiveOtherUser(null);
        setIncomingCaller(null);
        setTimeout(() => setCallStatus("idle"), 2500);
      })
      .on("broadcast", { event: "call:offer" }, ({ payload }) => {
        if (payload.senderId !== currentUserRef.current?.id) {
          handleOffer(payload.sdp);
        }
      })
      .on("broadcast", { event: "call:answer" }, ({ payload }) => {
        if (payload.senderId !== currentUserRef.current?.id) {
          handleAnswer(payload.sdp);
        }
      })
      .on("broadcast", { event: "call:ice-candidate" }, ({ payload }) => {
        if (payload.senderId !== currentUserRef.current?.id) {
          handleIce(payload.candidate);
        }
      })
      .on("broadcast", { event: "call:end" }, () => {
        setCallStatus("ended");
        cleanupWebRTC();
        setActiveOtherUser(null);
        setIncomingCaller(null);
        setTimeout(() => setCallStatus("idle"), 2000);
      })
      .subscribe();

    myChannelRef.current = channel;

    return () => {
      cleanupWebRTC();
      supabase.removeChannel(channel);
      myChannelRef.current = null;
    };
  }, [currentUser?.id, cleanupWebRTC, createOffer, handleOffer, handleAnswer, handleIce]);

  // ── Public actions ──

  const startCall = async (targetUser: CallUser) => {
    if (!currentUser) return;

    setActiveOtherUser(targetUser);
    targetChannelRef.current = supabase.channel(`user-calls-${targetUser.id}`);

    try {
      await getMicrophoneStream();
      setCallStatus("calling");

      await targetChannelRef.current.send({
        type: "broadcast",
        event: "call:invite",
        payload: {
          callerId: currentUser.id,
          callerUsername: currentUser.username,
          callerAvatar: currentUser.avatar_url,
        },
      });
    } catch (e) {
      console.error("Failed to start call", e);
      setCallStatus("idle");
      setActiveOtherUser(null);
    }
  };

  const acceptCall = async () => {
    const me = currentUser;
    const caller = incomingCaller;
    if (!me || !caller) return;

    try {
      await getMicrophoneStream();
      setCallStatus("connecting");

      targetChannelRef.current = supabase.channel(`user-calls-${caller.id}`);
      await targetChannelRef.current.send({
        type: "broadcast",
        event: "call:accept",
        payload: { receiverId: me.id },
      });
      // Stay on current page — no redirect
    } catch (e) {
      console.error("Failed to accept call", e);
      setCallStatus("idle");
    }
  };

  const rejectCall = async () => {
    const me = currentUser;
    const caller = incomingCaller;
    if (caller) {
      const chan = supabase.channel(`user-calls-${caller.id}`);
      await chan.send({
        type: "broadcast",
        event: "call:reject",
        payload: { senderId: me?.id },
      });
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

    if (target && me) {
      const chan =
        targetChannelRef.current ||
        supabase.channel(`user-calls-${target.id}`);
      await chan.send({
        type: "broadcast",
        event: "call:end",
        payload: { senderId: me.id },
      });
    }

    if (callStatusRef.current === "connected" && me && target && callDuration > 0) {
      const minutes = Math.floor(callDuration / 60);
      const seconds = callDuration % 60;
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
      }}
    >
      {children}
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
