import { useEffect, useState } from "react";
import { X, Hash, MessageCircle } from "lucide-react";
import type { OnlineUser, TypingUser, CurrentUser } from "../../types/chat";
import type { ChatTheme } from "../../lib/chatTheme";
import { supabase } from "../../lib/supabase";
import Avatar from "./Avatar";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  messages: { length: number };
  onlineUsers: OnlineUser[];
  typingUsers: TypingUser[];
  currentUser: CurrentUser;
  allUsers: (OnlineUser & { id: string })[];
  isDark: boolean;
  t: ChatTheme;
}

export default function Sidebar({
  isOpen,
  onClose,
  messages,
  onlineUsers,
  typingUsers,
  currentUser,
  allUsers,
  isDark,
  t,
}: SidebarProps) {
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Fetch unread counts per sender
  const fetchUnread = async () => {
    const { data } = await supabase
      .from("direct_messages")
      .select("sender_id")
      .eq("receiver_id", currentUser.id)
      .eq("is_read", false);

    if (data) {
      const counts: Record<string, number> = {};
      data.forEach((row: { sender_id: string }) => {
        counts[row.sender_id] = (counts[row.sender_id] || 0) + 1;
      });
      setUnreadCounts(counts);
    }
  };

  useEffect(() => {
    fetchUnread();

    // Realtime: dengarkan pesan baru yang masuk
    const channel = supabase
      .channel("sidebar-unread")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages" },
        (payload) => {
          if (payload.new.receiver_id === currentUser.id) {
            setUnreadCounts((prev) => ({
              ...prev,
              [payload.new.sender_id]: (prev[payload.new.sender_id] || 0) + 1,
            }));
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "direct_messages" },
        () => {
          // Refresh ketika is_read berubah
          fetchUnread();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser.id]);

  return (
    <>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(6px)",
          }}
          onClick={onClose}
        />
      )}

      <aside
        style={{
          width: 240,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          background: t.sidebarBg,
          borderRight: `1px solid ${t.sidebarBorder}`,
          position: "fixed",
          top: 0,
          left: 0,
          height: "100%",
          zIndex: 50,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition:
            "transform 0.3s cubic-bezier(0.4,0,0.2,1),background 0.3s",
          boxShadow: isDark ? "none" : "2px 0 8px rgba(0,0,0,0.04)",
        }}
        className="md:relative md:translate-x-0 md:z-auto"
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: `1px solid ${t.sidebarBorder}`,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: t.sectionLabel,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Channels
          </span>
          <button
            className="nav-btn md:hidden"
            style={{ padding: 4 }}
            onClick={onClose}
          >
            <X size={14} color={isDark ? "#e2e8f0" : "#111827"} />
          </button>
        </div>

        {/* Channel item */}
        <div
          style={{
            padding: "12px",
            borderBottom: `1px solid ${t.sidebarBorder}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 10,
              background: t.channelActiveBg,
              border: `1px solid ${t.channelActiveBorder}`,
            }}
          >
            <Hash size={13} color={isDark ? "#e2e8f0" : "#111827"} />
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: t.channelActiveText,
                flex: 1,
              }}
            >
              Public - Chat
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: t.channelBadgeText,
                padding: "2px 8px",
                borderRadius: 20,
                background: t.channelBadgeBg,
              }}
            >
              {messages.length}
            </span>
          </div>
        </div>

        {/* All users */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 12px 8px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 12,
              paddingLeft: 4,
            }}
          >
            <div
              className="online-pulse"
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: t.onlineDot,
              }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: t.sectionLabel,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Member — {allUsers.length}
            </span>
          </div>

          {allUsers.map((ou) => {
            const isOnline = onlineUsers.some(
              (u) => u.username === ou.username,
            );
            const isTyping = typingUsers.some(
              (tv) => tv.username === ou.username,
            );
            const isMe = ou.username === currentUser.username;
            const unread = unreadCounts[ou.id] || 0;

            return (
              <div
                key={ou.username}
                className="sidebar-user"
                style={{ marginBottom: 4, justifyContent: "space-between" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <Avatar
                      username={ou.username}
                      avatar_url={ou.avatar_url}
                      size={32}
                      isDark={isDark}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background: isOnline
                          ? t.onlineDot
                          : isDark
                            ? "#374151"
                            : "#9ca3af",
                        border: `2px solid ${t.onlineDotBorder}`,
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: unread > 0 ? 700 : 500,
                        color: t.usernameText,
                        margin: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {ou.username}
                      {isMe && (
                        <span
                          style={{
                            marginLeft: 6,
                            fontSize: 11,
                            color: t.subText,
                            fontWeight: 400,
                          }}
                        >
                          (kamu)
                        </span>
                      )}
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        color: isTyping
                          ? t.typingText
                          : isOnline
                            ? t.subText
                            : isDark
                              ? "#6b7280"
                              : "#9ca3af",
                        margin: 0,
                      }}
                    >
                      {isTyping
                        ? "✦ mengetik..."
                        : isOnline
                          ? "online"
                          : "offline"}
                    </p>
                  </div>
                </div>

                {!isMe && (
                  <a
                    href={`/dm?user=${ou.id}`}
                    style={{
                      flexShrink: 0,
                      position: "relative",
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none",
                      background:
                        unread > 0
                          ? isDark
                            ? "#3b1fa8"
                            : "#ede9fe"
                          : isDark
                            ? "#1e1e2e"
                            : "#f3f4f6",
                      border: `1px solid ${unread > 0 ? "#7c3aed" : t.headerBorder}`,
                    }}
                    title={`Chat dengan ${ou.username}`}
                  >
                    <MessageCircle
                      size={14}
                      color={
                        unread > 0 ? "#7c3aed" : isDark ? "#e2e8f0" : "#111827"
                      }
                    />
                    {unread > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: -6,
                          right: -6,
                          minWidth: 16,
                          height: 16,
                          padding: "0 4px",
                          borderRadius: 10,
                          background: "#ef4444",
                          color: "#fff",
                          fontSize: 10,
                          fontWeight: 700,
                          fontFamily: "'DM Mono', monospace",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: `1.5px solid ${isDark ? "#0a0a0f" : "#fff"}`,
                          lineHeight: 1,
                        }}
                      >
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: 12,
            borderTop: `1px solid ${t.sidebarBorder}`,
            flexShrink: 0,
          }}
        >
          <a href="/profile" className="sidebar-user">
            <div style={{ position: "relative", flexShrink: 0 }}>
              <Avatar
                username={currentUser.username}
                avatar_url={currentUser.avatar_url}
                size={34}
                glow
                isDark={isDark}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: t.onlineDot,
                  border: `2px solid ${t.onlineDotBorder}`,
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: isDark ? "#e2e8f0" : "#111827",
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {currentUser.username}
              </p>
              <p style={{ fontSize: 11, color: t.viewProfileColor, margin: 0 }}>
                Lihat profil →
              </p>
            </div>
          </a>
        </div>
      </aside>
    </>
  );
}
