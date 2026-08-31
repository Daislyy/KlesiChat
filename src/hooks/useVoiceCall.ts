import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { CurrentUser } from "../types/chat";

export type CallStatus =
  | "idle"
  | "calling"      // Caller waiting for receiver to pick up
  | "incoming"     // Receiver getting an incoming call
  | "connecting"   // Call accepted, establishing WebRTC connection
  | "connected"    // Call in progress
  | "ended"        // Call ended
  | "rejected";    // Call was rejected

export interface VoiceCallUser {
  id: string;
  username: string;
  avatar_url: string;
}

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

export function useVoiceCall(currentUser: CurrentUser | null, otherUser: VoiceCallUser | null) {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [incomingCaller, setIncomingCaller] = useState<VoiceCallUser | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  // Ref to hold current user & status to avoid re-subscribing channels on state changes
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;
  const otherUserRef = useRef(otherUser);
  otherUserRef.current = otherUser;
  const callStatusRef = useRef(callStatus);
  callStatusRef.current = callStatus;

  // Cleanup WebRTC connection only (without dropping channel)
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

  // Process queued ICE candidates after setRemoteDescription
  const processPendingIceCandidates = useCallback(async () => {
    const pc = peerConnectionRef.current;
    if (!pc || !pc.remoteDescription) return;

    while (pendingIceCandidatesRef.current.length > 0) {
      const candidate = pendingIceCandidatesRef.current.shift();
      if (candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding queued ICE candidate:", e);
        }
      }
    }
  }, []);

  // Setup PeerConnection
  const setupPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) return peerConnectionRef.current;

    const pc = new RTCPeerConnection(STUN_SERVERS);

    pc.onicecandidate = (event) => {
      const me = currentUserRef.current;
      if (event.candidate && channelRef.current && me) {
        channelRef.current.send({
          type: "broadcast",
          event: "call:ice-candidate",
          payload: { senderId: me.id, candidate: event.candidate.toJSON() },
        });
      }
    };

    pc.ontrack = (event) => {
      console.log("Remote stream received:", event.streams[0]);
      if (remoteAudioRef.current && event.streams[0]) {
        remoteAudioRef.current.srcObject = event.streams[0];
        remoteAudioRef.current.play().catch((err) => {
          console.warn("Autoplay blocked/failed:", err);
        });
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
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [cleanupWebRTC]);

  const createOffer = useCallback(async () => {
    const me = currentUserRef.current;
    if (!me || !channelRef.current || !localStreamRef.current) return;

    try {
      setCallStatus("connecting");
      const pc = setupPeerConnection();
      localStreamRef.current.getTracks().forEach((track) => {
        if (!pc.getSenders().some((sender) => sender.track === track)) {
          pc.addTrack(track, localStreamRef.current!);
        }
      });

      const offer = await pc.createOffer({ offerToReceiveAudio: true });
      await pc.setLocalDescription(offer);

      await channelRef.current.send({
        type: "broadcast",
        event: "call:offer",
        payload: { senderId: me.id, sdp: offer },
      });
    } catch (e) {
      console.error("Error creating offer:", e);
    }
  }, [setupPeerConnection]);

  const handleOffer = useCallback(async (sdp: RTCSessionDescriptionInit) => {
    const me = currentUserRef.current;
    if (!me || !channelRef.current || !localStreamRef.current) return;

    try {
      setCallStatus("connecting");
      const pc = setupPeerConnection();
      localStreamRef.current.getTracks().forEach((track) => {
        if (!pc.getSenders().some((sender) => sender.track === track)) {
          pc.addTrack(track, localStreamRef.current!);
        }
      });

      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      await processPendingIceCandidates();

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await channelRef.current.send({
        type: "broadcast",
        event: "call:answer",
        payload: { senderId: me.id, sdp: answer },
      });
    } catch (e) {
      console.error("Error handling offer:", e);
    }
  }, [setupPeerConnection, processPendingIceCandidates]);

  const handleAnswer = useCallback(async (sdp: RTCSessionDescriptionInit) => {
    const pc = peerConnectionRef.current;
    if (pc) {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        await processPendingIceCandidates();
      } catch (e) {
        console.error("Error handling answer:", e);
      }
    }
  }, [processPendingIceCandidates]);

  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    const pc = peerConnectionRef.current;
    if (pc && pc.remoteDescription) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("Error adding ICE candidate:", e);
      }
    } else {
      pendingIceCandidatesRef.current.push(candidate);
    }
  }, []);

  // Channel setup: runs ONLY when user IDs change, NOT on every callStatus state change!
  useEffect(() => {
    if (!currentUser?.id || !otherUser?.id) return;

    const channelName = `call-dm-${[currentUser.id, otherUser.id].sort().join("-")}`;
    const channel = supabase.channel(channelName);

    channel
      .on("broadcast", { event: "call:invite" }, ({ payload }) => {
        if (payload.callerId !== currentUserRef.current?.id) {
          setIncomingCaller({
            id: payload.callerId,
            username: payload.callerUsername,
            avatar_url: payload.callerAvatar,
          });
          setCallStatus("incoming");
        }
      })
      .on("broadcast", { event: "call:accept" }, async ({ payload }) => {
        if (payload.receiverId !== currentUserRef.current?.id) {
          setCallStatus("connecting");
          await createOffer();
        }
      })
      .on("broadcast", { event: "call:reject" }, () => {
        setCallStatus("rejected");
        cleanupWebRTC();
        setTimeout(() => setCallStatus("idle"), 2500);
      })
      .on("broadcast", { event: "call:offer" }, async ({ payload }) => {
        if (payload.senderId !== currentUserRef.current?.id) {
          await handleOffer(payload.sdp);
        }
      })
      .on("broadcast", { event: "call:answer" }, async ({ payload }) => {
        if (payload.senderId !== currentUserRef.current?.id) {
          await handleAnswer(payload.sdp);
        }
      })
      .on("broadcast", { event: "call:ice-candidate" }, async ({ payload }) => {
        if (payload.senderId !== currentUserRef.current?.id) {
          await handleIceCandidate(payload.candidate);
        }
      })
      .on("broadcast", { event: "call:end" }, () => {
        setCallStatus("ended");
        cleanupWebRTC();
        setTimeout(() => setCallStatus("idle"), 2000);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      cleanupWebRTC();
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [currentUser?.id, otherUser?.id, cleanupWebRTC, createOffer, handleOffer, handleAnswer, handleIceCandidate]);

  // Microphone stream getter
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
    } catch {
      alert("Izin mikrofon ditolak. Mohon izinkan akses mikrofon di browser.");
      throw new Error("Microphone permission denied");
    }
  }, []);

  // Initiate call
  const startCall = useCallback(async () => {
    const me = currentUserRef.current;
    const other = otherUserRef.current;
    if (!me || !other || !channelRef.current) return;

    try {
      await getMicrophoneStream();
      setCallStatus("calling");

      await channelRef.current.send({
        type: "broadcast",
        event: "call:invite",
        payload: {
          callerId: me.id,
          callerUsername: me.username,
          callerAvatar: me.avatar_url,
        },
      });
    } catch (e) {
      console.error("Failed to start call", e);
      setCallStatus("idle");
    }
  }, [getMicrophoneStream]);

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    const me = currentUserRef.current;
    if (!me || !channelRef.current) return;

    try {
      await getMicrophoneStream();
      setCallStatus("connecting");

      await channelRef.current.send({
        type: "broadcast",
        event: "call:accept",
        payload: { receiverId: me.id },
      });
    } catch (e) {
      console.error("Failed to accept call", e);
      setCallStatus("idle");
    }
  }, [getMicrophoneStream]);

  // Reject call
  const rejectCall = useCallback(async () => {
    const me = currentUserRef.current;
    if (channelRef.current && me) {
      await channelRef.current.send({
        type: "broadcast",
        event: "call:reject",
        payload: { senderId: me.id },
      });
    }
    setCallStatus("rejected");
    cleanupWebRTC();
    setTimeout(() => setCallStatus("idle"), 2000);
  }, [cleanupWebRTC]);

  // End call
  const endCall = useCallback(async () => {
    const me = currentUserRef.current;
    const other = otherUserRef.current;

    if (channelRef.current && me) {
      await channelRef.current.send({
        type: "broadcast",
        event: "call:end",
        payload: { senderId: me.id },
      });
    }

    if (callStatusRef.current === "connected" && me && other && callDuration > 0) {
      const minutes = Math.floor(callDuration / 60);
      const seconds = callDuration % 60;
      const durationStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

      supabase.from("direct_messages").insert({
        content: `📞 Panggilan suara selesai (${durationStr})`,
        type: "text",
        sender_id: me.id,
        receiver_id: other.id,
      }).then();
    }

    setCallStatus("ended");
    cleanupWebRTC();
    setTimeout(() => setCallStatus("idle"), 1500);
  }, [callDuration, cleanupWebRTC]);

  // Toggle Mute audio
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  return {
    callStatus,
    isMuted,
    callDuration,
    incomingCaller,
    remoteAudioRef,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
  };
}
