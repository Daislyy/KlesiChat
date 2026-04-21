import { Send, X, Mic } from "lucide-react";
import type { ChatTheme } from "../../lib/chatTheme";
import { formatDuration } from "../../lib/chatTheme";

interface InputAreaProps {
  input: string;
  isRecording: boolean;
  recordingDuration: number;
  isSendingAudio: boolean;
  isDark: boolean;
  t: ChatTheme;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onStartRecording: () => void;
  onStopAndSendRecording: () => void;
  onCancelRecording: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>; // ← Perbaiki tipe ini
}

export default function InputArea({
  input, isRecording, recordingDuration, isSendingAudio,
  isDark, t,
  onInputChange, onKeyDown, onSend,
  onStartRecording, onStopAndSendRecording, onCancelRecording,
  textareaRef,
}: InputAreaProps) {
  return (
    <div style={{
      padding: "12px 16px",
      background: t.inputAreaBg,
      borderTop: `1px solid ${t.inputAreaBorder}`,
      flexShrink: 0,
      boxShadow: isDark ? "none" : "0 -1px 0 rgba(0,0,0,0.04)",
    }}>
      <div
        className="input-wrap"
        style={{
          display: "flex", alignItems: "flex-end", gap: 8,
          borderRadius: 16, padding: "8px 8px 8px 12px",
          background: t.inputWrapBg,
          border: `1px solid ${isRecording ? "#ef4444" : t.inputWrapBorder}`,
        }}
      >
        {isRecording ? (
          <RecordingMode
            recordingDuration={recordingDuration}
            isDark={isDark}
            t={t}
            onCancel={onCancelRecording}
            onSend={onStopAndSendRecording}
          />
        ) : (
          <NormalMode
            input={input}
            isSendingAudio={isSendingAudio}
            isDark={isDark}
            t={t}
            textareaRef={textareaRef}
            onInputChange={onInputChange}
            onKeyDown={onKeyDown}
            onSend={onSend}
            onStartRecording={onStartRecording}
          />
        )}
      </div>

      <p style={{
        fontSize: 10, color: t.creditColor,
        marginTop: 6, paddingLeft: 4,
        fontFamily: "'DM Mono',monospace",
      }}>
        Deslyy : Mff kalo masih banyak Bug :))))
      </p>
    </div>
  );
}

// Recording mode
interface RecordingModeProps {
  recordingDuration: number;
  isDark: boolean;
  t: ChatTheme;
  onCancel: () => void;
  onSend: () => void;
}

function RecordingMode({ recordingDuration, isDark, t, onCancel, onSend }: RecordingModeProps) {
  return (
    <>
      <button
        onClick={onCancel}
        style={{
          flexShrink: 0, width: 32, height: 32, borderRadius: 8,
          border: "none", cursor: "pointer", background: "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
        title="Batalkan rekaman"
      >
        <X size={15} color={isDark ? "#6b7280" : "#9ca3af"} />
      </button>

      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%", background: "#ef4444",
          flexShrink: 0, animation: "recPulse 1s ease-in-out infinite",
        }} />
        <span style={{
          fontSize: 13, color: isDark ? "#e2e8f0" : "#111827",
          fontFamily: "'DM Mono',monospace", letterSpacing: "0.05em",
        }}>
          {formatDuration(recordingDuration)}
        </span>
        <span style={{ fontSize: 12, color: isDark ? "#4b5563" : "#9ca3af" }}>
          Merekam...
        </span>
      </div>

      <button
        onClick={onSend}
        className="mic-btn is-recording"
        style={{
          flexShrink: 0, width: 36, height: 36, borderRadius: 10,
          background: t.micActiveBg, boxShadow: t.micActiveShadow,
        }}
        title="Kirim pesan suara"
      >
        <Send size={14} color="#fff" />
      </button>
    </>
  );
}

// Normal mode
interface NormalModeProps {
  input: string;
  isSendingAudio: boolean;
  isDark: boolean;
  t: ChatTheme;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onStartRecording: () => void;
}

function NormalMode({
  input, isSendingAudio, isDark, t,
  textareaRef, onInputChange, onKeyDown, onSend, onStartRecording,
}: NormalModeProps) {
  return (
    <>
      <textarea
        ref={textareaRef}
        value={input}
        onChange={onInputChange}
        onKeyDown={onKeyDown}
        placeholder="Ketik aja sob..."
        rows={1}
        style={{
          flex: 1, background: "transparent", border: "none", outline: "none",
          color: t.inputColor, fontSize: 13, resize: "none",
          padding: "6px 0", maxHeight: 120, caretColor: t.inputCaret,
          fontFamily: "'DM Sans',sans-serif", lineHeight: 1.6,
        }}
      />

      <button
        onClick={onStartRecording}
        disabled={isSendingAudio}
        className="mic-btn"
        style={{
          flexShrink: 0, width: 36, height: 36, borderRadius: 10,
          background: t.micBtnBg, border: `1px solid ${t.micBtnBorder}`,
          opacity: isSendingAudio ? 0.5 : 1,
        }}
        title="Rekam pesan suara"
      >
        {isSendingAudio ? (
          <div style={{
            width: 14, height: 14, borderRadius: "50%",
            border: `2px solid ${t.micBtnColor}33`,
            borderTop: `2px solid ${t.micBtnColor}`,
            animation: "spin 0.8s linear infinite",
          }} />
        ) : (
          <Mic size={15} color={t.micBtnColor} />
        )}
      </button>

      <button
        onClick={onSend}
        disabled={!input.trim()}
        className="send-btn"
        style={{
          flexShrink: 0, width: 36, height: 36, borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: input.trim() ? t.sendBtnActiveBg : t.sendBtnInactiveBg,
          boxShadow: input.trim() ? t.sendBtnActiveShadow : "none",
          opacity: input.trim() ? 1 : 0.4,
        }}
      >
        <Send size={14} color={input.trim() ? "#fff" : isDark ? "#4b5563" : "#9ca3af"} />
      </button>
    </>
  );
}