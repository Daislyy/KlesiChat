import { useState, useRef, useCallback, useEffect } from "react";
import { ArrowLeft, Moon, Sun, Mic, Send, X, StopCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import { getChatTheme } from "../lib/chatTheme";
import { playNotificationSound, unlockAudio } from "../lib/audioNotification";
import type { CurrentUser, DirectMessage } from "../types/chat";
import Avatar from "../components/chat/Avatar";
import VoiceMessagePlayer from "../components/chat/VoiceMessagePlayer";

export default function DMPage() {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [input, setInput] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [otherUser, setOtherUser] = useState<{
    id: string;
    username: string;
    avatar_url: string;
  } | null>(null);
  const [isDark, setIsDark] = useState(false);
  // Tambah state newMsgIds
  const [newMsgIds, setNewMsgIds] = useState<Set<string>>(new Set());

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isSendingAudio, setIsSendingAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentUserRef = useRef<CurrentUser | null>(null);
  const t = getChatTheme(isDark);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = t.pageBg;
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, [t.pageBg]);

  // Fetch messages function
  const fetchMessages = useCallback(async (myId: string, theirId: string) => {
    const { data: dms } = await supabase
      .from("direct_messages")
      .select(
        "*,sender:profiles!direct_messages_sender_id_fkey(username,avatar_url)",
      )
      .or(
        `and(sender_id.eq.${myId},receiver_id.eq.${theirId}),and(sender_id.eq.${theirId},receiver_id.eq.${myId})`,
      )
      .order("created_at", { ascending: true });

    if (dms) {
      setMessages(
        dms.map((m: any) => ({
          ...m,
          sender_username: m.sender?.username || "",
          sender_avatar: m.sender?.avatar_url || "",
        })),
      );
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("user");
    if (!userId) {
      window.location.href = "/chat";
      return;
    }

    let channel: ReturnType<typeof supabase.channel>;
    let autoRefreshInterval: ReturnType<typeof setInterval>;

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }

      const [{ data: me }, { data: other }] = await Promise.all([
        supabase
          .from("profiles")
          .select("username,avatar_url")
          .eq("id", user.id)
          .single(),
        supabase
          .from("profiles")
          .select("id,username,avatar_url")
          .eq("id", userId)
          .single(),
      ]);

      const meUser: CurrentUser = {
        id: user.id,
        username: me?.username || "",
        avatar_url: me?.avatar_url || "",
      };
      setCurrentUser(meUser);
      currentUserRef.current = meUser;
      setOtherUser({
        id: userId,
        username: other?.username || "",
        avatar_url: other?.avatar_url || "",
      });

      await fetchMessages(user.id, userId);
      setTimeout(scrollToBottom, 80);

      // Auto refresh sebagai fallback
      autoRefreshInterval = setInterval(
        () => fetchMessages(user.id, userId),
        2000,
      );

      // Mark as read
      await supabase
        .from("direct_messages")
        .update({ is_read: true })
        .eq("receiver_id", user.id)
        .eq("sender_id", userId);

      // Realtime
      channel = supabase
        .channel(`dm-${[user.id, userId].sort().join("-")}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "direct_messages" },
          async (payload) => {
            const isRelevant =
              (payload.new.sender_id === user.id &&
                payload.new.receiver_id === userId) ||
              (payload.new.sender_id === userId &&
                payload.new.receiver_id === user.id);
            if (!isRelevant) return;

            const { data: sender } = await supabase
              .from("profiles")
              .select("username,avatar_url")
              .eq("id", payload.new.sender_id)
              .single();
            const newMsg: DirectMessage = {
              ...(payload.new as any),
              sender_username: sender?.username || "",
              sender_avatar: sender?.avatar_url || "",
            };
            setMessages((prev) => {
              // Hindari duplikat
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });

            // Tambah ID pesan baru ke state untuk animasi
            setNewMsgIds((prev) => {
              const s = new Set(prev);
              s.add(newMsg.id);
              return s;
            });

            // Hapus ID setelah 300ms (animasi selesai)
            setTimeout(
              () =>
                setNewMsgIds((prev) => {
                  const s = new Set(prev);
                  s.delete(newMsg.id);
                  return s;
                }),
              300,
            );

            if (newMsg.sender_id !== user.id) playNotificationSound();
            setTimeout(scrollToBottom, 50);
          },
        )
        .subscribe();
    };

    init();
    return () => {
      if (channel) supabase.removeChannel(channel);
      if (autoRefreshInterval) clearInterval(autoRefreshInterval);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (micStreamRef.current)
        micStreamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [scrollToBottom, fetchMessages]);

  // Voice recording
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/ogg";
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.start(100);
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(
        () => setRecordingDuration((d) => d + 1),
        1000,
      );
    } catch {
      alert(
        "Izin mikrofon ditolak. Tolong izinkan akses mikrofon di browser kamu.",
      );
    }
  }

  async function stopAndSendRecording() {
    if (!mediaRecorderRef.current || !currentUser || !otherUser) return;
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    const duration = recordingDuration;
    return new Promise<void>((resolve) => {
      const recorder = mediaRecorderRef.current!;
      recorder.onstop = async () => {
        setIsRecording(false);
        setIsSendingAudio(true);
        try {
          const mimeType = recorder.mimeType || "audio/webm";
          const ext = mimeType.includes("ogg") ? "ogg" : "webm";
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mimeType,
          });
          const fileName = `${currentUser.id}/${Date.now()}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("voice-messages")
            .upload(fileName, audioBlob, {
              contentType: mimeType,
              upsert: false,
            });
          if (uploadError) throw uploadError;
          const { data: urlData } = supabase.storage
            .from("voice-messages")
            .getPublicUrl(fileName);
          await supabase.from("direct_messages").insert({
            content: "🎤 Pesan suara",
            type: "audio",
            audio_url: urlData.publicUrl,
            audio_duration: duration,
            sender_id: currentUser.id,
            receiver_id: otherUser.id,
          });
        } catch {
          alert("Gagal mengirim pesan suara. Coba lagi.");
        } finally {
          setIsSendingAudio(false);
          audioChunksRef.current = [];
        }
        resolve();
      };
      recorder.stop();
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
    });
  }

  function cancelRecording() {
    if (!mediaRecorderRef.current) return;
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    mediaRecorderRef.current.onstop = null;
    mediaRecorderRef.current.stop();
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    setIsRecording(false);
    setRecordingDuration(0);
    audioChunksRef.current = [];
  }

  async function handleSend() {
    if (!input.trim() || !currentUser || !otherUser) return;
    const content = input.trim();
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    await supabase.from("direct_messages").insert({
      content,
      type: "text",
      sender_id: currentUser.id,
      receiver_id: otherUser.id,
    });
  }

  const formatDur = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (!currentUser || !otherUser) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isDark ? "#0a0a0f" : "#f8f9fc",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: `2px solid ${t.loaderBorderColor}`,
              borderTop: `2px solid ${t.loaderTopColor}`,
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p
            style={{
              fontSize: 12,
              color: t.loaderText,
              fontFamily: "monospace",
            }}
          >
            memuat...
          </p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      </div>
    );
  }

  return (
    <div
      onClick={unlockAudio}
      className="dm-page"
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: t.pageBg,
        fontFamily: "'DM Sans',sans-serif",
        color: isDark ? "#e2e8f0" : "#111827",
      }}
    >
      <style>{`
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; }
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes recPulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.35;transform:scale(0.65);}}
  @keyframes micRing{0%,100%{box-shadow:0 0 0 3px rgba(239,68,68,0.3);}50%{box-shadow:0 0 0 6px rgba(239,68,68,0.15);}}
  
  @keyframes popIn{0%{opacity:0;transform:scale(0.85) translateY(8px);}70%{transform:scale(1.04) translateY(-1px);}100%{opacity:1;transform:scale(1) translateY(0);}}
  @keyframes fadeSlideUp{from{opacity:0;transform:translateY(10px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);}}
  @keyframes slideInLeft{from{opacity:0;transform:translateX(-18px) scale(0.96);}to{opacity:1;transform:translateX(0) scale(1);}}
  @keyframes slideInRight{from{opacity:0;transform:translateX(18px) scale(0.96);}to{opacity:1;transform:translateX(0) scale(1);}}
  @keyframes headerSlideIn{from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);}}
  @keyframes pageIn{from{opacity:0;transform:translateX(24px);}to{opacity:1;transform:translateX(0);}}

  .dm-page{animation:pageIn 0.28s cubic-bezier(0.4,0,0.2,1) forwards;}
  .dm-header{animation:headerSlideIn 0.25s ease forwards;}
  .dm-msg-new-me{animation:popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;}
  .dm-msg-new-other{animation:popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;}
  .dm-msg-old-me{animation:slideInRight 0.22s ease forwards;}
  .dm-msg-old-other{animation:slideInLeft 0.22s ease forwards;}

  ::-webkit-scrollbar{width:3px;}
  ::-webkit-scrollbar-thumb{background:${t.scrollThumb};border-radius:4px;}
  .dm-mic-btn{border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s cubic-bezier(0.34,1.56,0.64,1);}
  .dm-mic-btn:hover{transform:scale(1.1);}
  .dm-mic-btn.recording{animation:micRing 1.2s ease-in-out infinite;}
  .dm-send-btn{border:none;cursor:pointer;transition:all 0.2s cubic-bezier(0.34,1.56,0.64,1);}
  .dm-send-btn:hover:not(:disabled){transform:scale(1.1);}
`}</style>

      {/* Header */}
      <header
        className="dm-header"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 16px",
          background: t.headerBg,
          borderBottom: `1px solid ${t.headerBorder}`,
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <a
          href="/chat"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: 10,
            border: `1px solid ${t.headerBorder}`,
            background: "transparent",
            cursor: "pointer",
            textDecoration: "none",
            color: isDark ? "#e2e8f0" : "#111827",
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={16} />
        </a>
        <Avatar
          username={otherUser.username}
          avatar_url={otherUser.avatar_url}
          size={34}
          isDark={isDark}
        />
        <div style={{ flex: 1 }}>
          <p
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: 14,
              color: isDark ? "#e2e8f0" : "#111827",
            }}
          >
            {otherUser.username}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: t.subText }}>
            Pesan Pribadi
          </p>
        </div>
        <button
          onClick={() => setIsDark(!isDark)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: 10,
            border: `1px solid ${t.toggleBorder}`,
            background: t.toggleBg,
            cursor: "pointer",
          }}
        >
          {isDark ? (
            <Sun size={15} color="#fbbf24" />
          ) : (
            <Moon size={15} color="#7c3aed" />
          )}
        </button>
      </header>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          background: t.msgAreaBg,
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 8,
              opacity: 0.4,
            }}
          >
            <span style={{ fontSize: 32 }}>💬</span>
            <p style={{ margin: 0, fontSize: 13, color: t.subText }}>
              Belum ada pesan. Mulai percakapan!
            </p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUser.id;
          const isNew = newMsgIds.has(msg.id);
          const msgClassName = isNew
            ? isMe
              ? "dm-msg-new-me"
              : "dm-msg-new-other"
            : isMe
              ? "dm-msg-old-me"
              : "dm-msg-old-other";

          return (
            <div
              key={msg.id}
              className={msgClassName}
              style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
                gap: 8,
                alignItems: "flex-end",
              }}
            >
              {!isMe && (
                <Avatar
                  username={msg.sender_username}
                  avatar_url={msg.sender_avatar}
                  size={28}
                  isDark={isDark}
                />
              )}
              <div
                style={{
                  maxWidth: "70%",
                  padding: "10px 14px",
                  borderRadius: isMe
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                  background: isMe ? "#7c3aed" : isDark ? "#1e1e2e" : "#f3f4f6",
                  color: isMe ? "#fff" : isDark ? "#e2e8f0" : "#111827",
                  fontSize: 14,
                  lineHeight: 1.5,
                  wordBreak: "break-word",
                }}
              >
                {msg.type === "audio" && msg.audio_url ? (
                  <VoiceMessagePlayer
                    url={msg.audio_url}
                    duration={msg.audio_duration}
                    isMe={isMe}
                    isDark={isDark}
                  />
                ) : (
                  msg.content
                )}
                <div
                  style={{
                    fontSize: 10,
                    opacity: 0.6,
                    marginTop: 4,
                    textAlign: isMe ? "right" : "left",
                  }}
                >
                  {new Date(msg.created_at).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              {isMe && (
                <Avatar
                  username={currentUser.username}
                  avatar_url={currentUser.avatar_url}
                  size={28}
                  isDark={isDark}
                />
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: "12px 16px",
          background: t.headerBg,
          borderTop: `1px solid ${t.headerBorder}`,
          display: "flex",
          gap: 8,
          alignItems: "flex-end",
        }}
      >
        {isRecording ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 4px",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#ef4444",
                animation: "recPulse 1s ease-in-out infinite",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 13,
                color: isDark ? "#e2e8f0" : "#111827",
                fontVariantNumeric: "tabular-nums",
                fontFamily: "'DM Mono',monospace",
              }}
            >
              {formatDur(recordingDuration)}
            </span>
            <span
              style={{ fontSize: 12, color: isDark ? "#9ca3af" : "#6b7280" }}
            >
              Merekam...
            </span>
            <div style={{ flex: 1 }} />
            <button
              onClick={cancelRecording}
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                border: `1px solid ${t.headerBorder}`,
                background: isDark ? "#1e1e2e" : "#f3f4f6",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={14} color={isDark ? "#9ca3af" : "#6b7280"} />
            </button>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height =
                Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Pesan ke ${otherUser.username}...`}
            style={{
              flex: 1,
              resize: "none",
              border: `1px solid ${t.headerBorder}`,
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 14,
              fontFamily: "'DM Sans',sans-serif",
              background: t.msgAreaBg,
              color: isDark ? "#e2e8f0" : "#111827",
              outline: "none",
              minHeight: 42,
              maxHeight: 120,
              lineHeight: 1.5,
            }}
            rows={1}
          />
        )}

        {!input.trim() && !isSendingAudio && (
          <button
            className={`dm-mic-btn${isRecording ? " recording" : ""}`}
            onClick={isRecording ? stopAndSendRecording : startRecording}
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: isRecording
                ? "#ef4444"
                : isDark
                  ? "#1e1e2e"
                  : "#f3f4f6",
              border: `1px solid ${isRecording ? "#ef4444" : t.headerBorder}`,
            }}
          >
            {isRecording ? (
              <StopCircle size={16} color="#fff" />
            ) : (
              <Mic size={16} color={isDark ? "#8b5cf6" : "#7c3aed"} />
            )}
          </button>
        )}

        {(input.trim() || isSendingAudio) && (
          <button
            className="dm-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || isSendingAudio}
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: input.trim()
                ? "#7c3aed"
                : isDark
                  ? "#2d2d3d"
                  : "#e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {isSendingAudio ? (
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  border: "2px solid #fff",
                  borderTop: "2px solid transparent",
                  animation: "spin 0.8s linear infinite",
                }}
              />
            ) : (
              <Send
                size={16}
                color={input.trim() ? "#fff" : isDark ? "#4b5563" : "#9ca3af"}
              />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
