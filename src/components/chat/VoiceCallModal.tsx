import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import Avatar from "./Avatar";
import type { CallStatus, VoiceCallUser } from "../../hooks/useVoiceCall";

interface VoiceCallModalProps {
  callStatus: CallStatus;
  otherUser: VoiceCallUser | null;
  incomingCaller: VoiceCallUser | null;
  isMuted: boolean;
  callDuration: number;
  isDark: boolean;
  remoteAudioRef: React.RefObject<HTMLAudioElement | null>;
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
}

export default function VoiceCallModal({
  callStatus,
  otherUser,
  incomingCaller,
  isMuted,
  callDuration,
  isDark,
  remoteAudioRef,
  onAccept,
  onReject,
  onEnd,
  onToggleMute,
}: VoiceCallModalProps) {
  if (callStatus === "idle") return null;

  const displayUser =
    callStatus === "incoming" ? incomingCaller : otherUser;
  if (!displayUser) return null;

  const formatDur = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const getStatusText = () => {
    switch (callStatus) {
      case "calling":
        return "Memanggil...";
      case "incoming":
        return "Panggilan suara masuk...";
      case "connecting":
        return "Menyambungkan...";
      case "connected":
        return formatDur(callDuration);
      case "ended":
        return "Panggilan berakhir";
      case "rejected":
        return "Panggilan ditolak";
      default:
        return "";
    }
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(8px)",
          fontFamily: "'DM Sans', sans-serif",
          padding: 16,
        }}
      >
        {/* Hidden audio element for WebRTC remote stream playback */}
        <audio ref={remoteAudioRef} autoPlay playsInline />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: "100%",
            maxWidth: 380,
            borderRadius: 24,
            background: isDark ? "#1a1a24" : "#ffffff",
            border: `1px solid ${isDark ? "#2d2d3d" : "#e2e8f0"}`,
            boxShadow: isDark
              ? "0 20px 40px rgba(0,0,0,0.6)"
              : "0 20px 40px rgba(0,0,0,0.15)",
            padding: "36px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            color: isDark ? "#e2e8f0" : "#111827",
            textAlign: "center",
          }}
        >
          {/* Pulsing Avatar */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {(callStatus === "calling" || callStatus === "incoming" || callStatus === "connecting") && (
              <>
                <motion.div
                  style={{
                    position: "absolute",
                    width: 90,
                    height: 90,
                    borderRadius: "50%",
                    border: "2px solid #7c3aed",
                  }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  style={{
                    position: "absolute",
                    width: 90,
                    height: 90,
                    borderRadius: "50%",
                    border: "2px solid #7c3aed",
                  }}
                  animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                />
              </>
            )}
            <div style={{ position: "relative", zIndex: 2 }}>
              <Avatar
                username={displayUser.username}
                avatar_url={displayUser.avatar_url}
                size={84}
                isDark={isDark}
              />
            </div>
          </div>

          {/* User Info */}
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 600,
                color: isDark ? "#ffffff" : "#111827",
              }}
            >
              {displayUser.username}
            </h3>
            <p
              style={{
                margin: "6px 0 0 0",
                fontSize: 14,
                color: callStatus === "connected" ? "#22c55e" : isDark ? "#9ca3af" : "#6b7280",
                fontFamily: callStatus === "connected" ? "'DM Mono', monospace" : "'DM Sans', sans-serif",
                fontWeight: callStatus === "connected" ? 600 : 400,
              }}
            >
              {getStatusText()}
            </p>
          </div>

          {/* Controls / Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              marginTop: 8,
            }}
          >
            {callStatus === "incoming" ? (
              <>
                {/* Reject */}
                <button
                  onClick={onReject}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    border: "none",
                    background: "#ef4444",
                    color: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 20px rgba(239, 68, 68, 0.4)",
                    transition: "transform 0.2s ease",
                  }}
                  title="Tolak panggilan"
                >
                  <PhoneOff size={24} />
                </button>
                {/* Accept */}
                <button
                  onClick={onAccept}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    border: "none",
                    background: "#22c55e",
                    color: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 20px rgba(34, 197, 94, 0.4)",
                    transition: "transform 0.2s ease",
                  }}
                  title="Terima panggilan"
                >
                  <Phone size={24} />
                </button>
              </>
            ) : callStatus === "connected" ? (
              <>
                {/* Mute button */}
                <button
                  onClick={onToggleMute}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    border: `1px solid ${isDark ? "#3f3f4e" : "#e2e8f0"}`,
                    background: isMuted ? "#ef4444" : isDark ? "#282836" : "#f1f5f9",
                    color: isMuted ? "#fff" : isDark ? "#e2e8f0" : "#334155",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                  }}
                  title={isMuted ? "Nyalakan suara" : "Bisukan mikrofon"}
                >
                  {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                </button>

                {/* End call */}
                <button
                  onClick={onEnd}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    border: "none",
                    background: "#ef4444",
                    color: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 20px rgba(239, 68, 68, 0.4)",
                    transition: "transform 0.2s ease",
                  }}
                  title="Akhiri panggilan"
                >
                  <PhoneOff size={24} />
                </button>
              </>
            ) : (
              /* Calling / Connecting / Ended / Rejected */
              <button
                onClick={onEnd}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  border: "none",
                  background: "#ef4444",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 20px rgba(239, 68, 68, 0.4)",
                  transition: "transform 0.2s ease",
                }}
                title="Batalkan panggilan"
              >
                <PhoneOff size={24} />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
