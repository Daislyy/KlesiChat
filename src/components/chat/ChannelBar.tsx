import { Hash } from "lucide-react";
import type { ChatTheme } from "../../lib/chatTheme";

interface ChannelBarProps {
  messageCount: number;
  onlineCount: number;
  isDark: boolean;
  t: ChatTheme;
}

export default function ChannelBar({ messageCount, onlineCount, isDark, t }: ChannelBarProps) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 20px",
      background: t.channelBarBg,
      borderBottom: `1px solid ${t.channelBarBorder}`,
      flexShrink: 0,
      boxShadow: isDark ? "none" : "0 1px 0 rgba(0,0,0,0.03)",
    }}>
      <Hash size={14} color={isDark ? "#4b5563" : "#9ca3af"} />
      <span style={{ fontSize: 13, fontWeight: 600, color: t.channelNameColor }}>
        chat-room
      </span>

      <div style={{ width: 1, height: 14, background: t.dividerBg }} />

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div className="online-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: t.onlineDot }} />
        <span style={{ fontSize: 12, color: t.countColor }}>{onlineCount} online</span>
      </div>

      <span style={{ fontSize: 12, color: t.countColor, marginLeft: "auto" }}>
        {messageCount} pesan
      </span>
    </div>
  );
}