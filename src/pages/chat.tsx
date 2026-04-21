import { useState, useRef, useCallback, useEffect } from "react";
import {
  LogOut,
  Menu,
  MessageCircle,
  Sun,
  Moon,
  ArrowDown,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import type {
  Message,
  TypingUser,
  OnlineUser,
  CurrentUser,
} from "../types/chat";
import { getChatTheme } from "../lib/chatTheme";
import { playNotificationSound, unlockAudio } from "../lib/audioNotification";

import Avatar from "../components/chat/Avatar";
import Sidebar from "../components/chat/Sidebar";
import ChannelBar from "../components/chat/ChannelBar";
import MessageItem from "../components/chat/MessageItem";
import TypingIndicator from "../components/chat/TypingIndicator";
import InputArea from "../components/chat/InputArea";

const SCROLL_THRESHOLD = 120;

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [allUsers, setAllUsers] = useState<(OnlineUser & { id: string })[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [newMsgIds, setNewMsgIds] = useState<Set<string>>(new Set());
  const [isDark, setIsDark] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMsgCountRef = useRef(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(
    null,
  );

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isSendingAudio, setIsSendingAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  const t = getChatTheme(isDark);

  useEffect(() => {
    document.body.style.backgroundColor = t.pageBg;
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.documentElement.style.backgroundColor = t.pageBg;
    return () => {
      document.body.style.backgroundColor = "";
      document.documentElement.style.backgroundColor = "";
    };
  }, [t.pageBg]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (micStreamRef.current)
        micStreamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const checkNearBottom = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= SCROLL_THRESHOLD;
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  const handleScroll = useCallback(() => {
    const near = checkNearBottom();
    setIsNearBottom(near);
    if (near) setUnreadCount(0);
  }, [checkNearBottom]);

  useEffect(() => {
    const newCount = messages.length;
    const oldCount = prevMsgCountRef.current;
    prevMsgCountRef.current = newCount;
    if (newCount <= oldCount) return;
    if (isNearBottom) {
      scrollToBottom("smooth");
      setUnreadCount(0);
    } else setUnreadCount((prev) => prev + (newCount - oldCount));
  }, [messages.length, isNearBottom, scrollToBottom]);

  const fetchMessages = useCallback(async () => {
    try {
      const { data: msgs } = await supabase
        .from("messages")
        .select(
          "id,content,type,audio_url,audio_duration,user_id,created_at,profiles(username,avatar_url)",
        )
        .order("created_at", { ascending: true });
      if (msgs) {
        setMessages(
          msgs.map((m: any) => ({
            id: m.id,
            content: m.content,
            type: m.type || "text",
            audio_url: m.audio_url || undefined,
            audio_duration: m.audio_duration || undefined,
            user_id: m.user_id,
            created_at: m.created_at,
            username: m.profiles?.username || "unknown",
            avatar_url: m.profiles?.avatar_url || "",
          })),
        );
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Fungsi logout yang lengkap
  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return; // Mencegah double click

    setIsLoggingOut(true);

    try {
      // 1. Hapus presence typing user dari channel
      if (typingChannelRef.current && currentUser) {
        try {
          await typingChannelRef.current.track({
            username: currentUser.username,
            avatar_url: currentUser.avatar_url,
            isTyping: false,
          });
          await typingChannelRef.current.untrack();
          await supabase.removeChannel(typingChannelRef.current);
        } catch (err) {
          console.error("Error cleaning up typing channel:", err);
        }
      }

      // 2. Sign out dari Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        alert("Gagal keluar. Silakan coba lagi.");
        setIsLoggingOut(false);
        return;
      }

      // 3. Redirect ke halaman login
      window.location.href = "/login";
    } catch (err) {
      console.error("Unexpected error during logout:", err);
      alert("Terjadi kesalahan. Silakan coba lagi.");
      setIsLoggingOut(false);
    }
  }, [currentUser, isLoggingOut]);

  useEffect(() => {
    let msgChannel: ReturnType<typeof supabase.channel>;
    let typingChannel: ReturnType<typeof supabase.channel>;
    let autoRefreshInterval: ReturnType<typeof setInterval>;

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username,avatar_url")
        .eq("id", user.id)
        .single();
      const me: CurrentUser = {
        id: user.id,
        username: profile?.username || "unknown",
        avatar_url: profile?.avatar_url || "",
      };
      setCurrentUser(me);

      const { data: allProfiles } = await supabase
        .from("profiles")
        .select("id,username,avatar_url");
      if (allProfiles) {
        setAllUsers(
          allProfiles.map((p: any) => ({
            id: p.id,
            username: p.username || "unknown",
            avatar_url: p.avatar_url || "",
          })),
        );
      }

      await fetchMessages();
      setTimeout(() => {
        prevMsgCountRef.current = 0;
        scrollToBottom("instant" as ScrollBehavior);
      }, 80);
      autoRefreshInterval = setInterval(fetchMessages, 2000);

      msgChannel = supabase
        .channel("public:messages")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          async (payload) => {
            const { data: p } = await supabase
              .from("profiles")
              .select("username,avatar_url")
              .eq("id", payload.new.user_id)
              .single();
            const newMsg: Message = {
              ...(payload.new as any),
              type: payload.new.type || "text",
              username: p?.username || "unknown",
              avatar_url: p?.avatar_url || "",
            };
            if (newMsg.user_id !== me.id) playNotificationSound();
            setMessages((prev) => [...prev, newMsg]);
            setNewMsgIds((prev) => {
              const s = new Set(prev);
              s.add(newMsg.id);
              return s;
            });
            setTimeout(
              () =>
                setNewMsgIds((prev) => {
                  const s = new Set(prev);
                  s.delete(newMsg.id);
                  return s;
                }),
              600,
            );
          },
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "messages" },
          (payload) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === payload.new.id
                  ? { ...m, content: payload.new.content }
                  : m,
              ),
            );
          },
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "messages" },
          (payload) => {
            setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
          },
        )
        .subscribe();

      typingChannel = supabase.channel("typing-room", {
        config: { presence: { key: user.id } },
      });
      typingChannelRef.current = typingChannel;
      const syncPresenceState = () => {
        const state = typingChannel.presenceState();
        const all = Object.values(state).flat() as any[];
        setOnlineUsers(
          all.map((u) => ({
            username: u.username,
            avatar_url: u.avatar_url || "",
          })),
        );
        setTypingUsers(
          all
            .filter((u) => u.isTyping && u.username !== me.username)
            .map((u) => ({
              username: u.username,
              avatar_url: u.avatar_url || "",
              timestamp: Date.now(),
            })),
        );
      };
      typingChannel
        .on("presence", { event: "sync" }, syncPresenceState)
        .on("presence", { event: "join" }, syncPresenceState)
        .on("presence", { event: "leave" }, syncPresenceState)
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED")
            await typingChannel.track({
              username: me.username,
              avatar_url: me.avatar_url,
              isTyping: false,
            });
        });
    };

    init();
    return () => {
      if (msgChannel) supabase.removeChannel(msgChannel);
      if (typingChannel) supabase.removeChannel(typingChannel);
      typingChannelRef.current = null;
      if (autoRefreshInterval) clearInterval(autoRefreshInterval);
    };
  }, [fetchMessages, scrollToBottom]);

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
    if (!mediaRecorderRef.current || !currentUser) return;
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
          await supabase.from("messages").insert({
            content: "🎤 Pesan suara",
            type: "audio",
            audio_url: urlData.publicUrl,
            audio_duration: duration,
            user_id: currentUser.id,
          });
          setIsNearBottom(true);
          setUnreadCount(0);
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
    if (!input.trim() || !currentUser) return;
    const content = input.trim();
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsNearBottom(true);
    setUnreadCount(0);
    await supabase
      .from("messages")
      .insert({ content, type: "text", user_id: currentUser.id });
  }

  async function handleDelete(id: string) {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    await supabase.from("messages").delete().eq("id", id);
  }

  async function handleEditSave(id: string) {
    if (!editText.trim()) return;
    const newContent = editText.trim();
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, content: newContent } : m)),
    );
    setEditingId(null);
    setEditText("");
    await supabase
      .from("messages")
      .update({ content: newContent })
      .eq("id", id);
  }

  async function handleTyping() {
    if (!currentUser || !typingChannelRef.current) return;
    await typingChannelRef.current.track({
      username: currentUser.username,
      avatar_url: currentUser.avatar_url,
      isTyping: true,
    });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(async () => {
      if (!typingChannelRef.current || !currentUser) return;
      await typingChannelRef.current.track({
        username: currentUser.username,
        avatar_url: currentUser.avatar_url,
        isTyping: false,
      });
    }, 2000);
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
    if (e.target.value.trim()) handleTyping();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const typingLabel =
    typingUsers.length === 1
      ? `${typingUsers[0].username} sedang mengetik`
      : typingUsers.length > 1
        ? `${typingUsers.map((tv) => tv.username).join(", ")} sedang mengetik`
        : "";

  if (!currentUser) {
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
              letterSpacing: "0.1em",
            }}
          >
            memuat...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={unlockAudio}
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: t.pageBg,
        fontFamily: "'DM Sans',sans-serif",
        color: isDark ? "#e2e8f0" : "#111827",
        transition: "background 0.3s,color 0.3s",
      }}
    >
      <GlobalStyles t={t} isDark={isDark} />

      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: t.headerBg,
          borderBottom: `1px solid ${t.headerBorder}`,
          flexShrink: 0,
          zIndex: 10,
          boxShadow: isDark ? "none" : "0 1px 0 rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            className="nav-btn md:hidden"
            onClick={() => setSidebarOpen(true)}
            style={{ display: "flex" }}
          >
            <Menu size={17} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: t.logoGradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: t.logoShadow,
              }}
            >
              <MessageCircle size={16} color="#fff" />
            </div>
            <span
              style={{
                fontWeight: 700,
                fontSize: 17,
                color: t.appTitle,
                letterSpacing: "-0.03em",
              }}
            >
              KlesiChat
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            className="theme-toggle"
            onClick={() => setIsDark(!isDark)}
            title={isDark ? "Tema Terang" : "Tema Gelap"}
          >
            {isDark ? (
              <Sun size={15} color="#fbbf24" />
            ) : (
              <Moon size={15} color="#7c3aed" />
            )}
          </button>
          <a href="/profile" className="nav-btn">
            <Avatar
              username={currentUser.username}
              avatar_url={currentUser.avatar_url}
              size={26}
              glow
              isDark={isDark}
            />
            <span
              style={{
                color: t.profileLinkColor,
                fontWeight: 500,
                display: "none",
              }}
              className="sm:inline"
            >
              {currentUser.username}
            </span>
          </a>
          <button
            className="nav-btn"
            onClick={handleLogout}
            disabled={isLoggingOut}
            style={{
              opacity: isLoggingOut ? 0.6 : 1,
              cursor: isLoggingOut ? "not-allowed" : "pointer",
            }}
          >
            {isLoggingOut ? (
              <div
                style={{
                  width: 15,
                  height: 15,
                  borderRadius: "50%",
                  border: `2px solid ${t.navBtnColor}`,
                  borderTop: "2px solid transparent",
                  animation: "spin 0.8s linear infinite",
                }}
              />
            ) : (
              <LogOut size={15} />
            )}
            <span style={{ display: "none" }} className="sm:inline">
              {isLoggingOut ? "Keluar..." : "Keluar"}
            </span>
          </button>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          messages={messages}
          onlineUsers={onlineUsers}
          typingUsers={typingUsers}
          currentUser={currentUser}
          allUsers={allUsers}
          isDark={isDark}
          t={t}
        />

        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            transition: "background 0.3s",
          }}
        >
          <ChannelBar
            messageCount={messages.length}
            onlineCount={onlineUsers.length}
            isDark={isDark}
            t={t}
          />

          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              style={{
                height: "100%",
                overflowY: "auto",
                padding: "20px 16px",
                background: t.msgAreaBg,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                transition: "background 0.3s",
                boxSizing: "border-box",
              }}
            >
              {messages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  msg={msg}
                  isMe={msg.user_id === currentUser.id}
                  isNew={newMsgIds.has(msg.id)}
                  isEditing={editingId === msg.id}
                  editText={editText}
                  isDark={isDark}
                  t={t}
                  onEditStart={(id, content) => {
                    setEditingId(id);
                    setEditText(content);
                  }}
                  onEditChange={setEditText}
                  onEditSave={handleEditSave}
                  onEditCancel={() => {
                    setEditingId(null);
                    setEditText("");
                  }}
                  onDelete={handleDelete}
                />
              ))}
              <TypingIndicator
                typingUsers={typingUsers}
                typingLabel={typingLabel}
                isDark={isDark}
                t={t}
              />
              <div ref={messagesEndRef} style={{ height: 1, flexShrink: 0 }} />
            </div>

            {!isNearBottom && (
              <button
                className="scroll-fab"
                onClick={() => {
                  setIsNearBottom(true);
                  setUnreadCount(0);
                  scrollToBottom("smooth");
                }}
                title="Scroll ke bawah"
              >
                {unreadCount > 0 && (
                  <span className="unread-badge">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
                <ArrowDown size={17} color={t.scrollBtnColor} />
              </button>
            )}
          </div>

          <InputArea
            input={input}
            isRecording={isRecording}
            recordingDuration={recordingDuration}
            isSendingAudio={isSendingAudio}
            isDark={isDark}
            t={t}
            textareaRef={textareaRef}
            onInputChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            onSend={handleSend}
            onStartRecording={startRecording}
            onStopAndSendRecording={stopAndSendRecording}
            onCancelRecording={cancelRecording}
          />
        </main>
      </div>
    </div>
  );
}

function GlobalStyles({
  t,
  isDark,
}: {
  t: ReturnType<typeof getChatTheme>;
  isDark: boolean;
}) {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; height: 100%; background: ${t.pageBg}; transition: background 0.3s ease; }
      @keyframes fadeSlideUp{from{opacity:0;transform:translateY(10px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);}}
      @keyframes popIn{0%{opacity:0;transform:scale(0.85) translateY(8px);}70%{transform:scale(1.04) translateY(-1px);}100%{opacity:1;transform:scale(1) translateY(0);}}
      @keyframes typingBounce{0%,60%,100%{transform:translateY(0);opacity:0.3;}30%{transform:translateY(-5px);opacity:1;}}
      @keyframes spin{to{transform:rotate(360deg);}}
      @keyframes glowPulse{0%,100%{opacity:0.6;}50%{opacity:1;}}
      @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
      @keyframes themePop{0%{transform:scale(0.9);}60%{transform:scale(1.1);}100%{transform:scale(1);}}
      @keyframes scrollBtnIn{from{opacity:0;transform:translateY(10px) scale(0.85);}to{opacity:1;transform:translateY(0) scale(1);}}
      @keyframes badgePop{0%{transform:scale(0);}60%{transform:scale(1.25);}100%{transform:scale(1);}}
      @keyframes recPulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.35;transform:scale(0.65);}}
      @keyframes micRing{0%,100%{box-shadow:${t.micActiveShadow};}50%{box-shadow:0 0 0 6px rgba(239,68,68,0.15),${t.micActiveShadow};}}
      .msg-new{animation:popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;}
      .msg-old{animation:fadeSlideUp 0.22s ease forwards;}
      ::-webkit-scrollbar{width:3px;}
      ::-webkit-scrollbar-thumb{background:${t.scrollThumb};border-radius:4px;}
      ::-webkit-scrollbar-track{background:transparent;}
      .msg-actions{opacity:0;transform:translateX(4px);transition:opacity 0.15s,transform 0.15s;}
      .msg-wrapper:hover .msg-actions{opacity:1;transform:translateX(0);}
      .action-btn{background:${t.actionBtnBg};border:1px solid ${t.actionBtnBorder};border-radius:7px;padding:5px 7px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;}
      .action-btn:hover{background:${t.actionBtnHoverBg};border-color:${t.actionBtnHoverBorder};transform:scale(1.1);}
      .action-btn.del:hover{background:${t.actionBtnDelHoverBg};border-color:${t.actionBtnDelHoverBorder};}
      .nav-btn{border-radius:10px;padding:6px 10px;display:flex;align-items:center;gap:8px;transition:all 0.15s;cursor:pointer;border:none;background:transparent;color:${t.navBtnColor};font-size:13px;font-family:'DM Sans',sans-serif;text-decoration:none;}
      .nav-btn:hover{background:${t.navBtnHoverBg};color:${t.navBtnHoverColor};}
      .sidebar-user{border-radius:12px;padding:8px 10px;display:flex;align-items:center;gap:10px;transition:all 0.15s;cursor:default;text-decoration:none;}
      .sidebar-user:hover{background:${isDark ? "#12121e" : "#f9fafb"};}
      .input-wrap{transition:box-shadow 0.2s,border-color 0.2s;}
      .input-wrap:focus-within{box-shadow:${t.inputWrapFocusShadow};}
      .send-btn{transition:all 0.2s cubic-bezier(0.34,1.56,0.64,1);border:none;cursor:pointer;}
      .send-btn:hover:not(:disabled){transform:scale(1.1);}
      .send-btn:active:not(:disabled){transform:scale(0.93);}
      .mic-btn{border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s cubic-bezier(0.34,1.56,0.64,1);}
      .mic-btn:hover:not(:disabled){transform:scale(1.1);}
      .mic-btn:active:not(:disabled){transform:scale(0.93);}
      .mic-btn.is-recording{animation:micRing 1.2s ease-in-out infinite;}
      .online-pulse{animation:glowPulse 2s ease-in-out infinite;}
      .theme-toggle{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:10px;border:1px solid ${t.toggleBorder};background:${t.toggleBg};cursor:pointer;transition:all 0.25s;}
      .theme-toggle:hover{transform:scale(1.1);}
      .theme-toggle:active{animation:themePop 0.3s ease forwards;}
      .scroll-fab{position:absolute;bottom:16px;right:16px;width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;border:1px solid ${t.scrollBtnBorder};background:${t.scrollBtnBg};box-shadow:${t.scrollBtnShadow};animation:scrollBtnIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards;transition:transform 0.15s,box-shadow 0.15s;z-index:20;}
      .scroll-fab:hover{transform:scale(1.1) translateY(-2px);box-shadow:${t.scrollBtnShadow},0 0 0 4px ${isDark ? "rgba(139,92,246,0.1)" : "rgba(124,58,237,0.08)"};}
      .scroll-fab:active{transform:scale(0.94);}
      .unread-badge{position:absolute;top:-5px;right:-5px;min-width:18px;height:18px;padding:0 4px;border-radius:10px;background:${t.badgeBg};color:#fff;font-size:10px;font-weight:700;font-family:'DM Mono',monospace;display:flex;align-items:center;justify-content:center;animation:badgePop 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards;box-shadow:0 2px 8px rgba(124,58,237,0.45);border:1.5px solid ${isDark ? "#0a0a0f" : "#fff"};}
      @media (max-width: 768px) { .md\\:hidden { display: none; } .sm\\:inline { display: none; } }
      @media (min-width: 769px) { .md\\:hidden { display: flex; } .sm\\:inline { display: inline; } }
    `}</style>
  );
}
