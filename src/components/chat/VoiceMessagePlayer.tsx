import { useRef, useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { formatDuration } from "../../lib/chatTheme";

interface VoiceMessagePlayerProps {
  url: string;
  duration?: number;
  isMe: boolean;
  isDark: boolean;
}

export default function VoiceMessagePlayer({
  url,
  duration,
  isMe,
  isDark,
}: VoiceMessagePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [realDuration, setRealDuration] = useState(duration || 0);
  const [error, setError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    const onMeta = () => {
      if (isFinite(audio.duration)) {
        setRealDuration(Math.round(audio.duration));
      }
    };

    const onTime = () => {
      if (!audio.duration || !isFinite(audio.duration)) return;
      setCurrentTime(Math.floor(audio.currentTime));
      setProgress(audio.currentTime / audio.duration);
    };

    const onError = () => {
      setError(true);
    };

    audio.addEventListener("ended", onEnd);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("error", onError);
    };
  }, [url]);

  async function togglePlay() {
    if (error) return;
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (playing) {
        audio.pause();
        setPlaying(false);
      } else {
        await audio.play();
        setPlaying(true);
      }
    } catch {
      setError(true);
    }
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    if (error) return;
    const audio = audioRef.current;
    if (!audio || !audio.duration || !isFinite(audio.duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(
      1,
      Math.max(0, (e.clientX - rect.left) / rect.width),
    );
    audio.currentTime = ratio * audio.duration;
    setProgress(ratio);
  }

  if (error) {
    return (
      <div
        style={{
          fontSize: 12,
          color: isMe
            ? "rgba(255,255,255,0.6)"
            : isDark
              ? "#9ca3af"
              : "#6b7280",
          padding: "4px 0",
        }}
      >
        ❌ Gagal memuat audio
      </div>
    );
  }

  const accent = isMe
    ? "rgba(255,255,255,0.9)"
    : isDark
      ? "#8b5cf6"
      : "#7c3aed";
  const trackBg = isMe
    ? "rgba(255,255,255,0.25)"
    : isDark
      ? "#1f1f35"
      : "#e5e7eb";
  const fillColor = isMe
    ? "rgba(255,255,255,0.85)"
    : isDark
      ? "#8b5cf6"
      : "#7c3aed";
  const textColor = isMe
    ? "rgba(255,255,255,0.7)"
    : isDark
      ? "#9ca3af"
      : "#6b7280";

  const getBarHeight = (i: number) => {
    if (!url) return 0.3;
    const seed = (url.charCodeAt(i % url.length) || 65) + i * 7;
    return 0.25 + ((seed * 13) % 100) / 130;
  };

  const bars = Array.from({ length: 20 }, (_, i) => getBarHeight(i));
  const displayDuration = playing ? currentTime : realDuration;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        minWidth: 180,
        maxWidth: 240,
      }}
    >
      <audio ref={audioRef} src={url} preload="metadata" />

      <button
        onClick={togglePlay}
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          flexShrink: 0,
          background: isMe
            ? "rgba(255,255,255,0.15)"
            : isDark
              ? "#1f1f35"
              : "#f3f0ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.15s",
        }}
      >
        {playing ? (
          <Pause size={12} color={accent} fill={accent} />
        ) : (
          <Play
            size={12}
            color={accent}
            fill={accent}
            style={{ marginLeft: 1 }}
          />
        )}
      </button>

      <div
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}
      >
        <div
          style={{ position: "relative", height: 24, cursor: "pointer" }}
          onClick={handleSeek}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            {bars.map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  borderRadius: 1.5,
                  height: `${Math.min(100, Math.max(15, h * 80))}%`,
                  background: trackBg,
                }}
              />
            ))}
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)`,
            }}
          >
            {bars.map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  borderRadius: 1.5,
                  height: `${Math.min(100, Math.max(15, h * 80))}%`,
                  background: fillColor,
                }}
              />
            ))}
          </div>
        </div>
        <span
          style={{
            fontSize: 9,
            color: textColor,
            fontFamily: "'DM Mono', monospace",
            letterSpacing: "0.5px",
          }}
        >
          {formatDuration(displayDuration)}
        </span>
      </div>
    </div>
  );
}
