interface TypingDotsProps {
  isDark: boolean;
}

export default function TypingDots({ isDark }: TypingDotsProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 4px" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: isDark ? "#8b5cf6" : "#7c3aed",
            animation: "typingBounce 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}