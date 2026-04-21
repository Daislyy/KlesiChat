import { Pencil, Trash2, Check } from "lucide-react";
import type { Message } from "../../types/chat";
import type { ChatTheme } from "../../lib/chatTheme";
import { formatTime } from "../../lib/chatTheme"; // ← Perbaikan: import sebagai value, bukan type
import Avatar from "./Avatar";
import VoiceMessagePlayer from "./VoiceMessagePlayer";

interface MessageItemProps {
  msg: Message;
  isMe: boolean;
  isNew: boolean;
  isEditing: boolean;
  editText: string;
  isDark: boolean;
  t: ChatTheme;
  onEditStart: (id: string, content: string) => void;
  onEditChange: (text: string) => void;
  onEditSave: (id: string) => void;
  onEditCancel: () => void;
  onDelete: (id: string) => void;
}

export default function MessageItem({
  msg,
  isMe,
  isNew,
  isEditing,
  editText,
  isDark,
  t,
  onEditStart,
  onEditChange,
  onEditSave,
  onEditCancel,
  onDelete,
}: MessageItemProps) {
  const isAudio = msg.type === "audio";

  return (
    <div
      className={`msg-wrapper ${isNew ? "msg-new" : "msg-old"}`}
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 10,
        flexDirection: isMe ? "row-reverse" : "row",
      }}
    >
      {!isMe && (
        <div style={{ flexShrink: 0 }}>
          <Avatar
            username={msg.username}
            avatar_url={msg.avatar_url}
            size={28}
            isDark={isDark}
          />
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "min(340px,70%)",
          alignItems: isMe ? "flex-end" : "flex-start",
        }}
      >
        {!isMe && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: t.senderNameColor,
              marginBottom: 4,
              marginLeft: 4,
              letterSpacing: "0.02em",
            }}
          >
            {msg.username}
          </span>
        )}

        {isEditing ? (
          <EditBox
            editText={editText}
            t={t}
            onEditChange={onEditChange}
            onEditSave={() => onEditSave(msg.id)}
            onEditCancel={onEditCancel}
          />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 6,
              flexDirection: isMe ? "row-reverse" : "row",
            }}
          >
            <div
              style={{
                padding: isAudio ? "10px 12px" : "10px 14px",
                fontSize: 13,
                lineHeight: 1.6,
                wordBreak: "break-word",
                background: isMe ? t.outgoingMsgBg : t.incomingMsgBg,
                color: isMe ? t.outgoingMsgColor : t.incomingMsgColor,
                border: isMe ? "none" : `1px solid ${t.incomingMsgBorder}`,
                borderRadius: isMe
                  ? "18px 18px 4px 18px"
                  : "18px 18px 18px 4px",
                boxShadow: isMe ? t.outgoingMsgShadow : t.incomingMsgShadow,
                maxWidth: "100%",
              }}
            >
              {isAudio && msg.audio_url ? (
                <VoiceMessagePlayer
                  url={msg.audio_url}
                  duration={msg.audio_duration}
                  isMe={isMe}
                  isDark={isDark}
                />
              ) : (
                msg.content
              )}
            </div>

            {isMe && (
              <div
                className="msg-actions"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginBottom: 2,
                }}
              >
                {!isAudio && (
                  <button
                    className="action-btn"
                    title="Edit"
                    onClick={() => onEditStart(msg.id, msg.content)}
                  >
                    <Pencil size={11} color={isDark ? "#8b5cf6" : "#7c3aed"} />
                  </button>
                )}
                <button
                  className="action-btn del"
                  title="Hapus"
                  onClick={() => onDelete(msg.id)}
                >
                  <Trash2 size={11} color="#f43f5e" />
                </button>
              </div>
            )}
          </div>
        )}

        <span
          style={{
            fontSize: 10,
            color: t.timestampColor,
            marginTop: 4,
            marginLeft: 4,
            marginRight: 4,
            fontFamily: "'DM Mono',monospace",
          }}
        >
          {formatTime(msg.created_at)}
        </span>
      </div>
    </div>
  );
}

// Edit box sub-component
interface EditBoxProps {
  editText: string;
  t: ChatTheme;
  onEditChange: (text: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
}

function EditBox({
  editText,
  t,
  onEditChange,
  onEditSave,
  onEditCancel,
}: EditBoxProps) {
  return (
    <div
      style={{
        background: t.editBoxBg,
        border: `1px solid ${t.editBoxBorder}`,
        borderRadius: 16,
        padding: 12,
        minWidth: 200,
        boxShadow: t.editBoxShadow,
      }}
    >
      <textarea
        autoFocus
        value={editText}
        onChange={(e) => onEditChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onEditSave();
          }
          if (e.key === "Escape") onEditCancel();
        }}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          outline: "none",
          color: t.editTextColor,
          fontSize: 13,
          resize: "none",
          minHeight: 60,
          maxHeight: 120,
          fontFamily: "'DM Sans',sans-serif",
          lineHeight: 1.6,
        }}
      />
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "flex-end",
          marginTop: 8,
        }}
      >
        <button
          onClick={onEditCancel}
          style={{
            background: t.cancelBtnBg,
            color: t.cancelBtnColor,
            border: `1px solid ${t.cancelBtnBorder}`,
            borderRadius: 8,
            padding: "4px 12px",
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "'DM Sans',sans-serif",
          }}
        >
          Batal
        </button>
        <button
          onClick={onEditSave}
          style={{
            background: t.saveBtnBg,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "4px 12px",
            fontSize: 12,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontFamily: "'DM Sans',sans-serif",
          }}
        >
          <Check size={11} /> Simpan
        </button>
      </div>
    </div>
  );
}
