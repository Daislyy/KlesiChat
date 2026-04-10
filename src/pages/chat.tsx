import { useState, useRef, useEffect, useCallback } from "react";
import { Send, LogOut, Menu, X, MessageCircle, Hash } from "lucide-react";
import { supabase } from "../lib/supabase";

interface Message {
  id: string;
  content: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

interface TypingUser {
  username: string;
  avatar_url?: string;
  timestamp: number;
}

interface OnlineUser {
  username: string;
  avatar_url?: string;
}

function formatTime(isoString: string) {
  return new Date(isoString).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const AVATAR_COLORS: Record<string, { bg: string; text: string }> = {
  A: { bg: "#dbeafe", text: "#1d4ed8" },
  B: { bg: "#fce7f3", text: "#be185d" },
  C: { bg: "#d1fae5", text: "#065f46" },
  D: { bg: "#fef3c7", text: "#92400e" },
  E: { bg: "#ede9fe", text: "#6d28d9" },
  F: { bg: "#fee2e2", text: "#991b1b" },
  G: { bg: "#ecfdf5", text: "#065f46" },
  H: { bg: "#fff7ed", text: "#9a3412" },
  I: { bg: "#f0f9ff", text: "#0369a1" },
  J: { bg: "#fdf4ff", text: "#86198f" },
  K: { bg: "#f0fdf4", text: "#166534" },
  L: { bg: "#fffbeb", text: "#92400e" },
  M: { bg: "#fff1f2", text: "#9f1239" },
  N: { bg: "#f0f9ff", text: "#0c4a6e" },
  O: { bg: "#faf5ff", text: "#581c87" },
  P: { bg: "#fdf2f8", text: "#9d174d" },
  Q: { bg: "#ecfeff", text: "#164e63" },
  R: { bg: "#d1fae5", text: "#065f46" },
  S: { bg: "#fce7f3", text: "#be185d" },
  T: { bg: "#ede9fe", text: "#5b21b6" },
  U: { bg: "#fef3c7", text: "#78350f" },
  V: { bg: "#dbeafe", text: "#1e40af" },
  W: { bg: "#fee2e2", text: "#7f1d1d" },
  X: { bg: "#f0fdf4", text: "#14532d" },
  Y: { bg: "#fff7ed", text: "#7c2d12" },
  Z: { bg: "#fdf4ff", text: "#701a75" },
};

function getAvatarColor(username: string) {
  const key = username[0]?.toUpperCase() || "A";
  return AVATAR_COLORS[key] || { bg: "#e5e7eb", text: "#374151" };
}

function Avatar({
  username,
  avatar_url,
  size = 32,
}: {
  username: string;
  avatar_url?: string;
  size?: number;
}) {
  const style = { width: size, height: size, flexShrink: 0 as const };
  const { bg, text } = getAvatarColor(username);

  if (avatar_url) {
    return (
      <img
        src={avatar_url}
        alt={username}
        className="rounded-full object-cover"
        style={style}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold"
      style={{ ...style, background: bg, color: text, fontSize: size * 0.38 }}
    >
      {username[0]?.toUpperCase()}
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-gray-400"
          style={{
            animation: `typingBounce 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    username: string;
    avatar_url: string;
  } | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // ✅ FIX: Simpan typing channel di ref agar bisa diakses di handleTyping
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(
    null,
  );

  const fetchMessages = useCallback(async () => {
    try {
      const { data: msgs } = await supabase
        .from("messages")
        .select(
          "id, content, user_id, created_at, profiles(username, avatar_url)",
        )
        .order("created_at", { ascending: true });

      if (msgs) {
        setMessages(
          msgs.map((m: any) => ({
            id: m.id,
            content: m.content,
            user_id: m.user_id,
            created_at: m.created_at,
            username: m.profiles?.username || "unknown",
            avatar_url: m.profiles?.avatar_url || "",
          })),
        );
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

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
        .select("username, avatar_url")
        .eq("id", user.id)
        .single();

      const me = {
        id: user.id,
        username: profile?.username || "unknown",
        avatar_url: profile?.avatar_url || "",
      };
      setCurrentUser(me);

      await fetchMessages();
      autoRefreshInterval = setInterval(fetchMessages, 2000);

      msgChannel = supabase
        .channel("public:messages")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          async (payload) => {
            const { data: p } = await supabase
              .from("profiles")
              .select("username, avatar_url")
              .eq("id", payload.new.user_id)
              .single();

            setMessages((prev) => [
              ...prev,
              {
                ...(payload.new as Message),
                username: p?.username || "unknown",
                avatar_url: p?.avatar_url || "",
              },
            ]);
          },
        )
        .subscribe();

      // ✅ FIX: Buat channel presence dengan config yang benar
      typingChannel = supabase.channel("typing-room", {
        config: {
          presence: { key: user.id },
        },
      });

      // ✅ FIX: Simpan ke ref agar bisa dipakai di handleTyping
      typingChannelRef.current = typingChannel;

      // ✅ Helper untuk mengambil semua presence state terbaru
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
        // ✅ FIX: sync dipanggil setiap ada perubahan state (join/leave/update)
        .on("presence", { event: "sync" }, () => {
          syncPresenceState();
        })
        // ✅ FIX: Tambahkan listener join agar sidebar langsung update saat user baru masuk
        .on("presence", { event: "join" }, () => {
          syncPresenceState();
        })
        // ✅ FIX: Tambahkan listener leave agar sidebar langsung update saat user keluar
        .on("presence", { event: "leave" }, () => {
          syncPresenceState();
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            // ✅ Track diri sendiri setelah berhasil subscribe
            await typingChannel.track({
              username: me.username,
              avatar_url: me.avatar_url,
              isTyping: false,
            });
          }
        });
    };

    init();

    return () => {
      if (msgChannel) supabase.removeChannel(msgChannel);
      if (typingChannel) supabase.removeChannel(typingChannel);
      typingChannelRef.current = null;
      if (autoRefreshInterval) clearInterval(autoRefreshInterval);
    };
  }, [fetchMessages]);

  async function handleSend() {
    if (!input.trim() || !currentUser) return;
    const content = input.trim();
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    await supabase
      .from("messages")
      .insert({ content, user_id: currentUser.id });
  }

  // ✅ FIX: Gunakan typingChannelRef.current, bukan membuat channel baru
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

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const typingLabel =
    typingUsers.length === 1
      ? `${typingUsers[0].username} sedang mengetik`
      : typingUsers.length > 1
        ? `${typingUsers.map((t) => t.username).join(", ")} sedang mengetik`
        : "";

  if (!currentUser) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ background: "#f5f5f5" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
          <p className="text-sm text-gray-400">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen flex flex-col"
      style={{ background: "#f0f0f0", fontFamily: "sans-serif", color: "#111" }}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-4px); opacity: 1; }
        }
        .msg-anim { animation: fadeUp 0.18s ease forwards; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        .sidebar-item:hover { background: #f3f4f6; }
        .online-item:hover { background: #f9fafb; }
        .nav-btn:hover { background: #f3f4f6; }
        .send-btn:hover { opacity: 0.85; }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-1.5 rounded-lg nav-btn transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} color="#374151" />
          </button>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#111" }}
            >
              <MessageCircle size={15} color="#fff" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">
              KlesiChat
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <a
            href="/profile"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg nav-btn transition-colors text-sm text-gray-600"
          >
            <Avatar
              username={currentUser.username}
              avatar_url={currentUser.avatar_url}
              size={24}
            />
            <span className="hidden sm:inline font-medium">
              {currentUser.username}
            </span>
          </a>
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg nav-btn transition-colors text-sm text-gray-500"
            onClick={handleLogout}
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed md:relative top-0 left-0 h-full z-50 md:z-auto flex flex-col w-64 flex-shrink-0 transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
          style={{ background: "#ffffff", borderRight: "1px solid #e5e7eb" }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ borderBottom: "1px solid #f3f4f6" }}
          >
            <span className="text-sm font-semibold text-gray-700">
              Channels
            </span>
            <button
              className="md:hidden p-1 rounded nav-btn"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={15} color="#6b7280" />
            </button>
          </div>

          <div
            className="px-2 py-3"
            style={{ borderBottom: "1px solid #f3f4f6" }}
          >
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer"
              style={{ background: "#f3f4f6" }}
            >
              <Hash size={14} color="#6b7280" />
              <span className="text-sm font-medium text-gray-900">
                Public - Chat
              </span>
              <span
                className="ml-auto text-xs font-medium px-1.5 py-0.5 rounded-full"
                style={{ background: "#111", color: "#fff" }}
              >
                {messages.length}
              </span>
            </div>
          </div>

          {/* Online Users List */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase">
                  Online — {onlineUsers.length}
                </p>
              </div>

              {onlineUsers.length === 0 && (
                <p className="text-xs text-gray-400 px-1">
                  Belum ada yang online
                </p>
              )}

              {onlineUsers.map((onlineUser) => {
                const isTyping = typingUsers.some(
                  (t) => t.username === onlineUser.username,
                );
                const isMe = onlineUser.username === currentUser.username;
                return (
                  <div
                    key={onlineUser.username}
                    className="online-item flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-colors cursor-default"
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar
                        username={onlineUser.username}
                        avatar_url={onlineUser.avatar_url}
                        size={34}
                      />
                      <div
                        className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white"
                        style={{ background: "#22c55e" }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {onlineUser.username}
                        {isMe && (
                          <span className="ml-1.5 text-xs font-normal text-gray-400">
                            (kamu)
                          </span>
                        )}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{ color: isTyping ? "#22c55e" : "#9ca3af" }}
                      >
                        {isTyping ? "sedang mengetik..." : "aktif sekarang"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current User Footer */}
          <div
            className="p-3 flex-shrink-0"
            style={{ borderTop: "1px solid #f3f4f6" }}
          >
            <a
              href="/profile"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl online-item transition-colors"
            >
              <div className="relative flex-shrink-0">
                <Avatar
                  username={currentUser.username}
                  avatar_url={currentUser.avatar_url}
                  size={34}
                />
                <div
                  className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white"
                  style={{ background: "#22c55e" }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {currentUser.username}
                </p>
                <p className="text-xs text-gray-400">Lihat profil →</p>
              </div>
            </a>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div
            className="px-5 py-3 flex-shrink-0 flex items-center gap-3"
            style={{ background: "#ffffff", borderBottom: "1px solid #e5e7eb" }}
          >
            <Hash size={15} color="#9ca3af" />
            <span className="text-sm font-semibold text-gray-800">
              chat - room
            </span>
            <div className="w-px h-4 mx-1" style={{ background: "#e5e7eb" }} />
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-gray-500">
                {onlineUsers.length} online
              </span>
            </div>
            <span className="text-xs text-gray-400 ml-auto">
              {messages.length} pesan
            </span>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-5 py-5 space-y-3"
            style={{ background: "#f9fafb" }}
          >
            {messages.map((msg) => {
              const isMe = msg.user_id === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`msg-anim flex items-end gap-2.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                >
                  {!isMe && (
                    <div className="flex-shrink-0">
                      <Avatar
                        username={msg.username}
                        avatar_url={msg.avatar_url}
                        size={30}
                      />
                    </div>
                  )}
                  <div
                    className={`flex flex-col max-w-xs md:max-w-md lg:max-w-lg ${isMe ? "items-end" : "items-start"}`}
                  >
                    {!isMe && (
                      <span className="text-xs font-medium text-gray-500 mb-1 ml-1">
                        {msg.username}
                      </span>
                    )}
                    <div
                      className="px-4 py-2.5 text-sm leading-relaxed"
                      style={{
                        background: isMe ? "#111111" : "#ffffff",
                        color: isMe ? "#ffffff" : "#111111",
                        border: isMe ? "none" : "1px solid #e5e7eb",
                        borderRadius: isMe
                          ? "18px 18px 4px 18px"
                          : "18px 18px 18px 4px",
                        wordBreak: "break-word",
                        maxWidth: "100%",
                        boxShadow: isMe ? "none" : "0 1px 2px rgba(0,0,0,0.05)",
                      }}
                    >
                      {msg.content}
                    </div>
                    <span className="text-xs text-gray-400 mt-1 mx-1">
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}

            {typingUsers.length > 0 && (
              <div className="msg-anim flex items-end gap-2.5">
                {/* ✅ Tampilkan avatar sesuai akun yang sedang mengetik */}
                <div className="flex items-end">
                  {typingUsers.slice(0, 3).map((typingUser, i) => (
                    <div
                      key={typingUser.username}
                      className="flex-shrink-0"
                      style={{
                        marginLeft: i > 0 ? "-8px" : "0",
                        zIndex: typingUsers.length - i,
                        position: "relative",
                      }}
                    >
                      <Avatar
                        username={typingUser.username}
                        avatar_url={typingUser.avatar_url}
                        size={30}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xs font-medium text-gray-400 mb-1 ml-1">
                    {typingLabel}
                  </span>
                  <div
                    className="px-4 py-3"
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "18px 18px 18px 4px",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    }}
                  >
                    <TypingDots />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div
            className="px-4 py-3 flex-shrink-0"
            style={{ borderTop: "1px solid #e5e7eb", background: "#ffffff" }}
          >
            <div
              className="flex items-end gap-3 rounded-2xl px-4 py-2"
              style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Ketik aja sob..."
                rows={1}
                className="flex-1 bg-transparent text-sm resize-none outline-none py-2"
                style={{
                  maxHeight: "120px",
                  color: "#111",
                  caretColor: "#111",
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="send-btn flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                style={{
                  background: input.trim() ? "#111111" : "#e5e7eb",
                  cursor: input.trim() ? "pointer" : "not-allowed",
                }}
              >
                <Send size={15} color={input.trim() ? "#ffffff" : "#9ca3af"} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 px-1">
                Deslyy : Mff kalo masih banyak Bug :))))
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
