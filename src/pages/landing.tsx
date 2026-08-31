import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  Sun,
  Moon,
  Send,
  Check,
  ArrowRight,
  MessageSquare,
  Mic,
  Contrast,
  User,
  Zap,
  Sparkles,
  Smartphone,
  ChevronDown,
  Radio,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LOGO_SRC from "../assets/bee.png";

export default function Landing() {
  const [isDark, setIsDark] = useState(() => {
    return (
      localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mockInput, setMockInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mockMessages, setMockMessages] = useState([
    {
      id: "1",
      sender: "KlesiBee",
      content: "Hi.",
      isBot: true,
      time: "18:00",
    },
    {
      id: "2",
      sender: "KlesiBee",
      content:
        "Coba test ngab",
      isBot: true,
      time: "18:01",
    },
  ]);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setIsAuthenticated(true);
    });
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [mockMessages, isBotTyping]);

  const handleSendMockMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockInput.trim() || isBotTyping) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: "Kamu",
      content: mockInput,
      isBot: false,
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMockMessages((prev) => [...prev, userMsg]);
    const query = mockInput.toLowerCase();
    setMockInput("");
    setIsBotTyping(true);

    setTimeout(() => {
      let reply = "";
      if (
        query.includes("halo") ||
        query.includes("hai") ||
        query.includes("hello") ||
        query.includes("hi")
      ) {
        reply =
          "Halo juga! Senang ketemu kamu di sini.";
      } else if (
        query.includes("fitur") ||
        query.includes("bisa apa") ||
        query.includes("apa aja")
      ) {
        reply =
          "Ada pesan teks real-time, voice note, dark/light mode, dan profil user. Simpel tapi lengkap!";
      } else if (
        query.includes("siapa") ||
        query.includes("buat") ||
        query.includes("teknologi")
      ) {
        reply =
          "Dibangun pakai React + TypeScript, Supabase buat backend, dan Framer Motion buat animasinya.";
      } else {
        reply =
          "Seru kan? Daftar buat cobain versi lengkapnya, gratis kok!";
      }

      setMockMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "KlesiBee",
          content: reply,
          isBot: true,
          time: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      setIsBotTyping(false);
    }, 1200);
  };

  // Theme tokens — sama persis nuansanya dengan login/register
  const t = isDark
    ? {
        pageBg: "#1e1e24",
        panelBg:
          "linear-gradient(145deg, #1e1e24 0%, #26262e 50%, #1e1e24 100%)",
        cardBg: "rgba(30,30,38,0.98)",
        cardBorder: "#2e2e38",
        cardShadow:
          "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
        titleColor: "#f0f0f0",
        subtitleColor: "#6b6b7b",
        labelColor: "#8a8a9a",
        inputBg: "#282832",
        inputBorder: "#36363f",
        inputColor: "#e0e0e8",
        btnBg: "linear-gradient(135deg, #4a4a58 0%, #3a3a48 100%)",
        btnShadow: "0 8px 24px rgba(0,0,0,0.4)",
        btnColor: "#fff",
        linkColor: "#b0b0c0",
        linkHover: "#f0f0f0",
        dividerColor: "#2e2e38",
        toggleBg: "#282832",
        toggleBorder: "#3a3a44",
        toggleIcon: "#fbbf24",
        logoBg: "#36363f",
        logoBorder: "rgba(255,255,255,0.1)",
        logoBoxShadow: "0 0 40px rgba(0,0,0,0.5)",
        bubbleBg: "rgba(255,255,255,0.03)",
        chatInBg: "rgba(255,255,255,0.04)",
        chatOutBg: "rgba(255,255,255,0.08)",
        chatBubbleBorder: "rgba(255,255,255,0.06)",
        chatText: "#d0d0d8",
        chatTextMuted: "#6b6b7b",
        glowColor: "rgba(100,100,140,0.15)",
        typingDot: "#7a7a8e",
        creditColor: "#2e2e38",
        featureIconBg: "rgba(255,255,255,0.04)",
      }
    : {
        pageBg: "#f7f7fa",
        panelBg:
          "linear-gradient(145deg, #fafafe 0%, #f0f0f5 50%, #f7f7fa 100%)",
        cardBg: "rgba(255,255,255,0.98)",
        cardBorder: "#e8e8ee",
        cardShadow:
          "0 32px 80px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)",
        titleColor: "#1a1a2e",
        subtitleColor: "#9a9ab0",
        labelColor: "#4e4e6a",
        inputBg: "#f5f5fa",
        inputBorder: "#e0e0ea",
        inputColor: "#1a1a2e",
        btnBg: "linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%)",
        btnShadow: "0 8px 24px rgba(26,26,46,0.25)",
        btnColor: "#fff",
        linkColor: "#3a3a5e",
        linkHover: "#1a1a2e",
        dividerColor: "#e8e8ee",
        toggleBg: "#f5f5fa",
        toggleBorder: "#e0e0ea",
        toggleIcon: "#6b5ce7",
        logoBg: "#1a1a2e",
        logoBorder: "rgba(0,0,0,0.08)",
        logoBoxShadow: "0 0 32px rgba(0,0,0,0.15)",
        bubbleBg: "rgba(100,100,160,0.04)",
        chatInBg: "rgba(255,255,255,0.8)",
        chatOutBg: "rgba(100,100,160,0.08)",
        chatBubbleBorder: "rgba(0,0,0,0.06)",
        chatText: "#1a1a2e",
        chatTextMuted: "#9a9ab0",
        glowColor: "rgba(100,100,160,0.08)",
        typingDot: "#5e5e7e",
        creditColor: "#dddde8",
        featureIconBg: "rgba(0,0,0,0.03)",
      };

  const pageVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
    },
    exit: {
      opacity: 0,
      y: -15,
      transition: { duration: 0.3, ease: [0.7, 0, 0.84, 0] as const },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24,
      },
    },
  };

  const floatAnim = (dur: number, del: number) => ({
    y: [0, -10, 0],
    transition: {
      duration: dur,
      ease: "easeInOut" as const,
      repeat: Infinity,
      delay: del,
    },
  });

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        minHeight: "100vh",
        background: t.pageBg,
        fontFamily: "'Inter', sans-serif",
        transition: "background 0.4s",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        @keyframes typingBounce{0%,60%,100%{transform:translateY(0);opacity:0.4;}30%{transform:translateY(-4px);opacity:1;}}
        .typing-dot-lp{width:5px;height:5px;border-radius:50%;display:inline-block;animation:typingBounce 1.2s ease-in-out infinite;}
        @keyframes orbitRotate{from{transform:rotate(0deg) translateX(70px) rotate(0deg);}to{transform:rotate(360deg) translateX(70px) rotate(-360deg);}}
        .orbit-dot-lp{position:absolute;width:7px;height:7px;border-radius:50%;animation:orbitRotate 14s linear infinite;}
      `}</style>

      {/* ── Navigation ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          background: isDark
            ? "rgba(30,30,36,0.85)"
            : "rgba(247,247,250,0.85)",
          borderBottom: `1px solid ${t.cardBorder}`,
          transition: "background 0.4s, border-color 0.4s",
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "14px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <motion.div
              whileHover={{ rotate: 8, scale: 1.05 }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 11,
                background: t.logoBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                border: `1.5px solid ${t.logoBorder}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              }}
            >
              <img
                src={LOGO_SRC}
                alt="KlesiChat"
                draggable={false}
                style={{
                  width: "78%",
                  height: "78%",
                  objectFit: "contain",
                }}
              />
            </motion.div>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: t.titleColor,
                letterSpacing: "-0.03em",
              }}
            >
              KlesiChat
            </span>
          </div>

          {/* Right Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsDark(!isDark)}
              aria-label="Toggle Theme"
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                border: `1px solid ${t.toggleBorder}`,
                background: t.toggleBg,
                transition: "background 0.3s, border-color 0.3s",
              }}
            >
              <AnimatePresence mode="wait">
                {isDark ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun size={14} color={t.toggleIcon} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon size={14} color={t.toggleIcon} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {isAuthenticated ? (
              <Link to="/chat" style={{ textDecoration: "none" }}>
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 10,
                    border: "none",
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "'Inter', sans-serif",
                    cursor: "pointer",
                    background: t.btnBg,
                    color: t.btnColor,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  Buka Chat
                </motion.button>
              </Link>
            ) : (
              <>
                <Link to="/login" style={{ textDecoration: "none" }}>
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      padding: "7px 16px",
                      borderRadius: 10,
                      border: "none",
                      background: "transparent",
                      fontSize: 13,
                      fontWeight: 500,
                      fontFamily: "'Inter', sans-serif",
                      cursor: "pointer",
                      color: t.titleColor,
                    }}
                  >
                    Masuk
                  </motion.button>
                </Link>
                <Link to="/register" style={{ textDecoration: "none" }}>
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      padding: "8px 18px",
                      borderRadius: 10,
                      border: "none",
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: "'Inter', sans-serif",
                      cursor: "pointer",
                      background: t.btnBg,
                      color: t.btnColor,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  >
                    Daftar
                  </motion.button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <div
        style={{
          display: "flex",
          minHeight: "calc(100vh - 65px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "25%",
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: t.glowColor,
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "15%",
            width: 260,
            height: 260,
            borderRadius: "50%",
            background: t.glowColor,
            filter: "blur(70px)",
            pointerEvents: "none",
          }}
        />

        {/* Content wrapper */}
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "60px 28px 40px",
            display: "flex",
            flexDirection: "column",
            gap: 56,
            width: "100%",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Top row: text + chat mock */}
          <div
            style={{
              display: "flex",
              gap: 48,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {/* Left – Text */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              style={{
                flex: "1 1 420px",
                minWidth: 300,
              }}
            >
              <motion.p
                variants={staggerItem}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: t.subtitleColor,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                Just My Personal Chat Web
              </motion.p>

              <motion.h1
                variants={staggerItem}
                style={{
                  fontSize: "clamp(32px, 5vw, 48px)",
                  fontWeight: 800,
                  color: t.titleColor,
                  lineHeight: 1.15,
                  letterSpacing: "-0.03em",
                  margin: "0 0 20px",
                }}
              >
                KlesiChat Web, <br />
                With React and Supabase.
              </motion.h1>

              <motion.p
                variants={staggerItem}
                style={{
                  fontSize: 15,
                  color: t.subtitleColor,
                  lineHeight: 1.7,
                  maxWidth: 440,
                  marginBottom: 32,
                }}
              >
                KlesiChat adalah Platform Chat Publik dan Pribadi di buat
                mengunakan React dan Supabase.
              </motion.p>

              <motion.div
                variants={staggerItem}
                style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
              >
                {isAuthenticated ? (
                  <Link to="/chat" style={{ textDecoration: "none" }}>
                    <motion.button
                      whileHover={{ y: -2, scale: 1.01 }}
                      whileTap={{ y: 0, scale: 0.98 }}
                      style={{
                        padding: "13px 28px",
                        borderRadius: 12,
                        border: "none",
                        fontSize: 14,
                        fontWeight: 600,
                        fontFamily: "'Inter', sans-serif",
                        cursor: "pointer",
                        background: t.btnBg,
                        color: t.btnColor,
                        boxShadow: t.btnShadow,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      Buka Chat
                      <ArrowRight size={16} />
                    </motion.button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register" style={{ textDecoration: "none" }}>
                      <motion.button
                        whileHover={{ y: -2, scale: 1.01 }}
                        whileTap={{ y: 0, scale: 0.98 }}
                        style={{
                          padding: "13px 28px",
                          borderRadius: 12,
                          border: "none",
                          fontSize: 14,
                          fontWeight: 600,
                          fontFamily: "'Inter', sans-serif",
                          cursor: "pointer",
                          background: t.btnBg,
                          color: t.btnColor,
                          boxShadow: t.btnShadow,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        Mulai Chatting
                        <ArrowRight size={16} />
                      </motion.button>
                    </Link>
                    <Link to="/login" style={{ textDecoration: "none" }}>
                      <motion.button
                        whileHover={{ y: -2, scale: 1.01 }}
                        whileTap={{ y: 0, scale: 0.98 }}
                        style={{
                          padding: "13px 28px",
                          borderRadius: 12,
                          fontSize: 14,
                          fontWeight: 500,
                          fontFamily: "'Inter', sans-serif",
                          cursor: "pointer",
                          background: "transparent",
                          color: t.titleColor,
                          border: `1.5px solid ${t.cardBorder}`,
                          transition: "border-color 0.3s",
                        }}
                      >
                        Sudah Punya Akun
                      </motion.button>
                    </Link>
                  </>
                )}
              </motion.div>

              {/* Small trust indicators */}
              <motion.div
                variants={staggerItem}
                style={{
                  display: "flex",
                  gap: 24,
                  marginTop: 36,
                  flexWrap: "wrap",
                }}
              >
                {["Real-time chat", "Voice notes", "Dark & Light mode"].map(
                  (item, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 11,
                        color: t.subtitleColor,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <span style={{ color: isDark ? "#6fcf97" : "#4a9e6f", fontSize: 14 }}>
                        ✓
                      </span>
                      {item}
                    </span>
                  )
                )}
              </motion.div>
            </motion.div>

            {/* Right – Chat Mock */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 22,
                delay: 0.2,
              }}
              style={{
                flex: "1 1 380px",
                minWidth: 320,
                maxWidth: 460,
              }}
            >
              <div
                style={{
                  background: t.cardBg,
                  border: `1px solid ${t.cardBorder}`,
                  borderRadius: 20,
                  boxShadow: t.cardShadow,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  height: 440,
                  transition:
                    "background 0.4s, border-color 0.4s, box-shadow 0.4s",
                }}
              >
                {/* Chat header */}
                <div
                  style={{
                    padding: "14px 18px",
                    borderBottom: `1px solid ${t.cardBorder}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: t.logoBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        border: `1px solid ${t.logoBorder}`,
                        position: "relative",
                      }}
                    >
                      <img
                        src={LOGO_SRC}
                        alt="bot"
                        style={{
                          width: "72%",
                          height: "72%",
                          objectFit: "contain",
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          bottom: -1,
                          right: -1,
                          width: 9,
                          height: 9,
                          background: "#6fcf97",
                          borderRadius: "50%",
                          border: `2px solid ${t.cardBg}`,
                        }}
                      />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: t.titleColor,
                        }}
                      >
                        KlesiBee
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: t.subtitleColor,
                        }}
                      >
                        Online
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 9,
                      color: t.subtitleColor,
                      background: t.featureIconBg,
                      padding: "3px 8px",
                      borderRadius: 6,
                      fontWeight: 500,
                    }}
                  >
                    Demo
                  </span>
                </div>

                {/* Messages */}
                <div
                  ref={chatContainerRef}
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "16px 18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  {mockMessages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: msg.isBot ? "flex-start" : "flex-end",
                        maxWidth: "82%",
                        alignSelf: msg.isBot ? "flex-start" : "flex-end",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 9,
                          color: t.subtitleColor,
                          marginBottom: 3,
                          paddingLeft: 2,
                          paddingRight: 2,
                        }}
                      >
                        {msg.sender}
                      </span>
                      <div
                        style={{
                          background: msg.isBot ? t.chatInBg : t.chatOutBg,
                          color: msg.isBot
                            ? t.chatText
                            : isDark
                            ? "#f0f0f0"
                            : "#ffffff",
                          borderRadius: msg.isBot
                            ? "14px 14px 14px 4px"
                            : "14px 14px 4px 14px",
                          border: msg.isBot
                            ? `1px solid ${t.chatBubbleBorder}`
                            : "none",
                          padding: "9px 14px",
                          fontSize: 12,
                          lineHeight: 1.5,
                        }}
                      >
                        {msg.content}
                      </div>
                      <div
                        style={{
                          fontSize: 8,
                          color: t.subtitleColor,
                          marginTop: 3,
                          paddingLeft: 2,
                          paddingRight: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        {msg.time}
                        {!msg.isBot && (
                          <Check size={9} color="#6fcf97" />
                        )}
                      </div>
                    </div>
                  ))}

                  {isBotTyping && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        maxWidth: "82%",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 9,
                          color: t.subtitleColor,
                          marginBottom: 3,
                          paddingLeft: 2,
                        }}
                      >
                        KlesiBee
                      </span>
                      <div
                        style={{
                          background: t.chatInBg,
                          border: `1px solid ${t.chatBubbleBorder}`,
                          borderRadius: "14px 14px 14px 4px",
                          padding: "10px 14px",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="typing-dot-lp"
                            style={{
                              background: t.typingDot,
                              animationDelay: `${i * 0.2}s`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <form
                  onSubmit={handleSendMockMessage}
                  style={{
                    borderTop: `1px solid ${t.cardBorder}`,
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <input
                    type="text"
                    value={mockInput}
                    onChange={(e) => setMockInput(e.target.value)}
                    placeholder="Coba ketik sesuatu..."
                    style={{
                      flex: 1,
                      padding: "9px 14px",
                      borderRadius: 10,
                      border: `1.5px solid ${t.inputBorder}`,
                      background: t.inputBg,
                      color: t.inputColor,
                      fontSize: 12,
                      fontFamily: "'Inter', sans-serif",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = isDark
                        ? "#7a7a8e"
                        : "#7a7a9e")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = t.inputBorder)
                    }
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      border: "none",
                      background: t.btnBg,
                      color: t.btnColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <Send size={13} />
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>

          {/* ── Features Grid ── */}
          {/* ── Features Grid (Yang Bisa Kamu Lakuin) ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <p
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: t.subtitleColor,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                textAlign: "center",
                marginBottom: 28,
              }}
            >
              Yang Bisa Kamu Lakuin
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              {[
                {
                  icon: <MessageSquare size={18} style={{ color: isDark ? "#fbbf24" : "#6b5ce7" }} />,
                  title: "Chat Real-time",
                  desc: "Pesan masuk langsung muncul tanpa perlu refresh halaman.",
                },
                {
                  icon: <Mic size={18} style={{ color: isDark ? "#6fcf97" : "#4a9e6f" }} />,
                  title: "Voice Note",
                  desc: "Rekam dan kirim pesan suara langsung dari browser.",
                },
                {
                  icon: <Contrast size={18} style={{ color: isDark ? "#60a5fa" : "#3b82f6" }} />,
                  title: "Tema Gelap & Terang",
                  desc: "Ganti tema sesukamu, nyaman di mata kapanpun.",
                },
                {
                  icon: <User size={18} style={{ color: isDark ? "#f472b6" : "#ec4899" }} />,
                  title: "Profil & DM",
                  desc: "Kelola profil dan kirim pesan langsung ke teman.",
                },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4 }}
                  animate={floatAnim(8 + i, i * 0.5)}
                  style={{
                    background: t.cardBg,
                    border: `1px solid ${t.cardBorder}`,
                    borderRadius: 16,
                    padding: "24px 22px",
                    transition:
                      "background 0.4s, border-color 0.4s, box-shadow 0.3s",
                    cursor: "default",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: t.featureIconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 14,
                    }}
                  >
                    {f.icon}
                  </div>
                  <h4
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: t.titleColor,
                      margin: "0 0 6px",
                    }}
                  >
                    {f.title}
                  </h4>
                  <p
                    style={{
                      fontSize: 12,
                      color: t.subtitleColor,
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {f.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Section: Cara Kerja (How It Works) ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            style={{ marginTop: 24 }}
          >
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: isDark ? "#fbbf24" : "#6b5ce7",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  background: isDark
                    ? "rgba(251, 191, 36, 0.1)"
                    : "rgba(107, 92, 231, 0.1)",
                  padding: "4px 12px",
                  borderRadius: 20,
                  display: "inline-block",
                  marginBottom: 12,
                }}
              >
                Cara Kerja
              </span>
              <h3
                style={{
                  fontSize: "clamp(22px, 3.5vw, 30px)",
                  fontWeight: 700,
                  color: t.titleColor,
                  margin: "0 0 10px",
                  letterSpacing: "-0.02em",
                }}
              >
                Mulai Mengobrol Hanya Dalam 3 Langkah
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: t.subtitleColor,
                  margin: 0,
                  maxWidth: 520,
                  marginLeft: "auto",
                  marginRight: "auto",
                  lineHeight: 1.6,
                }}
              >
                Simpel, cepat, dan tanpa konfigurasi rumit. Siapapun bisa langsung terhubung.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 20,
              }}
            >
              {[
                {
                  step: "01",
                  title: "Daftar Akun",
                  desc: "Masukkan email dan kata sandi untuk membuat akun KlesiChat dalam beberapa detik.",
                  icon: <User size={18} color={isDark ? "#60a5fa" : "#3b82f6"} />,
                },
                {
                  step: "02",
                  title: "Pilih Ruang & DM",
                  desc: "Gabung ke obrolan publik bersama pengguna lain atau kirim pesan pribadi secara aman.",
                  icon: <MessageSquare size={18} color={isDark ? "#fbbf24" : "#f59e0b"} />,
                },
                {
                  step: "03",
                  title: "Kirim Teks & Voice Note",
                  desc: "Ketik obrolan atau gunakan mikrofon untuk merekam suara secara instan tanpa delay.",
                  icon: <Mic size={18} color={isDark ? "#6fcf97" : "#10b981"} />,
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4, borderColor: isDark ? "#4e4e5e" : "#c8c8d8" }}
                  style={{
                    background: t.cardBg,
                    border: `1px solid ${t.cardBorder}`,
                    borderRadius: 18,
                    padding: "28px 24px",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: t.cardShadow,
                    transition: "all 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 11,
                        background: t.featureIconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </div>
                    <span
                      style={{
                        fontSize: 24,
                        fontWeight: 800,
                        color: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {item.step}
                    </span>
                  </div>
                  <h4
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: t.titleColor,
                      margin: "0 0 8px",
                    }}
                  >
                    {item.title}
                  </h4>
                  <p
                    style={{
                      fontSize: 12,
                      color: t.subtitleColor,
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Section: Keunggulan & Teknologi ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            style={{ marginTop: 24 }}
          >
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: isDark ? "#6fcf97" : "#10b981",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  background: isDark
                    ? "rgba(111, 207, 151, 0.1)"
                    : "rgba(16, 185, 129, 0.1)",
                  padding: "4px 12px",
                  borderRadius: 20,
                  display: "inline-block",
                  marginBottom: 12,
                }}
              >
                Keunggulan
              </span>
              <h3
                style={{
                  fontSize: "clamp(22px, 3.5vw, 30px)",
                  fontWeight: 700,
                  color: t.titleColor,
                  margin: "0 0 10px",
                  letterSpacing: "-0.02em",
                }}
              >
                Pengalaman Chatting Cepat & Responsif
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: t.subtitleColor,
                  margin: 0,
                  maxWidth: 540,
                  marginLeft: "auto",
                  marginRight: "auto",
                  lineHeight: 1.6,
                }}
              >
                Dirancang untuk memberikan kenyamanan maksimal saat berkirim pesan.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 18,
              }}
            >
              {[
                {
                  icon: <Zap size={18} color="#fbbf24" />,
                  title: "Supabase Realtime Engine",
                  desc: "Protokol websocket yang memungkinkan pesan masuk langsung tanpa delay.",
                },
                {
                  icon: <Radio size={18} color="#60a5fa" />,
                  title: "Voice Memo Terintegrasi",
                  desc: "Rekam audio berdurasi fleksibel dengan kualitas jernih langsung di browser.",
                },
                {
                  icon: <Smartphone size={18} color="#a78bfa" />,
                  title: "Responsif di Semua Layar",
                  desc: "Tampilan mulus dan nyaman digunakan baik di HP, tablet, maupun desktop.",
                },
                {
                  icon: <Sparkles size={18} color="#f472b6" />,
                  title: "Desain Modern & Smooth",
                  desc: "Animasi interaktif dan transisi visual yang memanjakan mata.",
                },
              ].map((feat, idx) => (
                <div
                  key={idx}
                  style={{
                    background: t.cardBg,
                    border: `1px solid ${t.cardBorder}`,
                    borderRadius: 16,
                    padding: "24px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    transition: "all 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: t.featureIconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {feat.icon}
                  </div>
                  <h4
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: t.titleColor,
                      margin: 0,
                    }}
                  >
                    {feat.title}
                  </h4>
                  <p
                    style={{
                      fontSize: 12,
                      color: t.subtitleColor,
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {feat.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Section: FAQ (Pertanyaan Umum) ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            style={{ marginTop: 24 }}
          >
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: isDark ? "#60a5fa" : "#3b82f6",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  background: isDark
                    ? "rgba(96, 165, 250, 0.1)"
                    : "rgba(59, 130, 246, 0.1)",
                  padding: "4px 12px",
                  borderRadius: 20,
                  display: "inline-block",
                  marginBottom: 12,
                }}
              >
                Pertanyaan Umum
              </span>
              <h3
                style={{
                  fontSize: "clamp(22px, 3.5vw, 30px)",
                  fontWeight: 700,
                  color: t.titleColor,
                  margin: "0 0 10px",
                  letterSpacing: "-0.02em",
                }}
              >
                Sering Ditanyakan (FAQ)
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: t.subtitleColor,
                  margin: 0,
                  maxWidth: 500,
                  marginLeft: "auto",
                  marginRight: "auto",
                  lineHeight: 1.6,
                }}
              >
                Informasi seputar penggunaan fitur dan layanan di KlesiChat.
              </p>
            </div>

            <div
              style={{
                maxWidth: 760,
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                width: "100%",
              }}
            >
              {[
                {
                  q: "Apakah KlesiChat bisa digunakan secara gratis?",
                  a: "Ya! KlesiChat 100% gratis digunakan untuk obrolan di ruang publik maupun direct message (DM) pribadi.",
                },
                {
                  q: "Bagaimana cara merekam dan mengirim Voice Note?",
                  a: "Klik tombol mikrofon di samping input chat, izinkan browser mengakses mikrofon perangkat Anda, lalu bicaralah dan klik tombol kirim.",
                },
                {
                  q: "Apakah pesan masuk langsung tampil tanpa reload?",
                  a: "Tentu! KlesiChat menggunakan koneksi Supabase Realtime sehingga pesan baru otomatis muncul seketika di layar Anda.",
                },
                {
                  q: "Bagaimana cara mengubah profil dan tema tampilan?",
                  a: "Anda dapat mengganti tema Gelap/Terang melalui tombol ikon di pojok kanan atas, serta mengubah nama profil & foto avatar di halaman Profil.",
                },
              ].map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    style={{
                      background: t.cardBg,
                      border: `1px solid ${isOpen ? (isDark ? "#4a4a58" : "#cfcfe0") : t.cardBorder}`,
                      borderRadius: 14,
                      padding: "16px 20px",
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 14,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: t.titleColor,
                        }}
                      >
                        {faq.q}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={16} color={t.subtitleColor} />
                      </motion.div>
                    </div>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: "auto", marginTop: 10 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          style={{ overflow: "hidden" }}
                        >
                          <p
                            style={{
                              fontSize: 12,
                              color: t.subtitleColor,
                              lineHeight: 1.65,
                              margin: 0,
                              borderTop: `1px solid ${t.cardBorder}`,
                              paddingTop: 10,
                            }}
                          >
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* ── Section: Call To Action (CTA Card) ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            style={{
              marginTop: 32,
              marginBottom: 20,
              background: isDark
                ? "linear-gradient(135deg, rgba(40,40,52,0.95) 0%, rgba(30,30,40,0.95) 100%)"
                : "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,240,248,0.95) 100%)",
              border: `1px solid ${t.cardBorder}`,
              borderRadius: 22,
              padding: "44px 32px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              boxShadow: t.cardShadow,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-40%",
                left: "50%",
                transform: "translateX(-50%)",
                width: 300,
                height: 200,
                background: t.glowColor,
                filter: "blur(60px)",
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative", zIndex: 1, maxWidth: 540, margin: "0 auto" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: t.logoBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  border: `1px solid ${t.logoBorder}`,
                }}
              >
                <img
                  src={LOGO_SRC}
                  alt="KlesiChat"
                  style={{ width: "70%", height: "70%", objectFit: "contain" }}
                />
              </div>

              <h3
                style={{
                  fontSize: "clamp(24px, 4vw, 32px)",
                  fontWeight: 800,
                  color: t.titleColor,
                  margin: "0 0 12px",
                  letterSpacing: "-0.02em",
                }}
              >
                Siap Mulai Mengobrol?
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: t.subtitleColor,
                  lineHeight: 1.6,
                  margin: "0 0 28px",
                }}
              >
                Gabung sekarang di KlesiChat dan rasakan pengalaman chatting publik & direct message yang seru dan instan.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                {isAuthenticated ? (
                  <Link to="/chat" style={{ textDecoration: "none" }}>
                    <motion.button
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ y: 0, scale: 0.98 }}
                      style={{
                        padding: "13px 32px",
                        borderRadius: 12,
                        border: "none",
                        fontSize: 14,
                        fontWeight: 600,
                        fontFamily: "'Inter', sans-serif",
                        cursor: "pointer",
                        background: t.btnBg,
                        color: t.btnColor,
                        boxShadow: t.btnShadow,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      Buka Chat
                      <ArrowRight size={16} />
                    </motion.button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register" style={{ textDecoration: "none" }}>
                      <motion.button
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileTap={{ y: 0, scale: 0.98 }}
                        style={{
                          padding: "13px 28px",
                          borderRadius: 12,
                          border: "none",
                          fontSize: 14,
                          fontWeight: 600,
                          fontFamily: "'Inter', sans-serif",
                          cursor: "pointer",
                          background: t.btnBg,
                          color: t.btnColor,
                          boxShadow: t.btnShadow,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        Mulai Chatting
                        <ArrowRight size={16} />
                      </motion.button>
                    </Link>
                    <Link to="/login" style={{ textDecoration: "none" }}>
                      <motion.button
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileTap={{ y: 0, scale: 0.98 }}
                        style={{
                          padding: "13px 28px",
                          borderRadius: 12,
                          fontSize: 14,
                          fontWeight: 500,
                          fontFamily: "'Inter', sans-serif",
                          cursor: "pointer",
                          background: "transparent",
                          color: t.titleColor,
                          border: `1.5px solid ${t.cardBorder}`,
                        }}
                      >
                        Sudah Punya Akun
                      </motion.button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: `1px solid ${t.cardBorder}`,
          padding: "24px 28px",
          transition: "border-color 0.4s",
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: t.creditColor,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Deslyy : Mff kalo masih banyak Bug :))))
          </span>
          <div
            style={{
              display: "flex",
              gap: 20,
              fontSize: 11,
              color: t.subtitleColor,
            }}
          >
            <Link
              to="/login"
              style={{
                color: t.linkColor,
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              Login
            </Link>
            <Link
              to="/register"
              style={{
                color: t.linkColor,
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              Register
            </Link>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
