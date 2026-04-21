import type { TypingUser } from "../../types/chat";
import type { ChatTheme } from "../../lib/chatTheme";
import Avatar from "./Avatar";
import TypingDots from "./TypingDots";

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
  typingLabel: string;
  isDark: boolean;
  t: ChatTheme;
}

export default function TypingIndicator({ typingUsers, typingLabel, isDark, t }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, animation: "fadeIn 0.2s ease" }}>
      {/* Stacked avatars */}
      <div style={{ display: "flex", alignItems: "flex-end" }}>
        {typingUsers.slice(0, 3).map((u, i) => (
          <div key={u.username} style={{
            flexShrink: 0, marginLeft: i > 0 ? -8 : 0,
            position: "relative", zIndex: typingUsers.length - i,
          }}>
            <Avatar username={u.username} avatar_url={u.avatar_url} size={28} isDark={isDark} />
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <span style={{ fontSize: 11, color: t.typingText, marginBottom: 4, marginLeft: 4 }}>
          {typingLabel}
        </span>
        <div style={{
          padding: "10px 14px",
          background: t.typingBubbleBg,
          border: `1px solid ${t.typingBubbleBorder}`,
          borderRadius: "18px 18px 18px 4px",
          boxShadow: t.typingBubbleShadow,
        }}>
          <TypingDots isDark={isDark} />
        </div>
      </div>
    </div>
  );
}