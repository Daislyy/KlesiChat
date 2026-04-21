import { getAvatarColor } from "../../lib/chatTheme";

interface AvatarProps {
  username: string;
  avatar_url?: string;
  size?: number;
  glow?: boolean;
  isDark?: boolean;
}

export default function Avatar({
  username,
  avatar_url,
  size = 32,
  glow = false,
  isDark = false,
}: AvatarProps) {
  const style: React.CSSProperties = {
    width: size,
    height: size,
    flexShrink: 0,
    boxShadow: glow
      ? isDark
        ? "0 0 12px 2px rgba(139,92,246,0.4)"
        : "0 0 12px 2px rgba(109,40,217,0.25)"
      : "none",
  };
  const { bg, text } = getAvatarColor(username, isDark);

  if (avatar_url)
    return (
      <img
        src={avatar_url}
        alt={username}
        className="rounded-full object-cover"
        style={style}
      />
    );

  return (
    <div
      className="rounded-full flex items-center justify-center font-bold"
      style={{
        ...style,
        background: bg,
        color: text,
        fontSize: size * 0.38,
        border: `1px solid ${text}33`,
      }}
    >
      {username[0]?.toUpperCase()}
    </div>
  );
}