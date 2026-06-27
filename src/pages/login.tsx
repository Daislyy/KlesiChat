import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Sun, Moon, Eye, EyeOff, Mail, Lock, MessageSquare, Music, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LOGO_SRC from "../assets/bee.png";

export default function Login() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark" || 
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError("Email atau password salah");
    } else {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      window.location.href = profile?.role === "admin" ? "/admin" : "/chat";
    }
    setIsLoading(false);
  }

  const t = isDark
    ? {
        pageBg: "#1e1e24",
        leftBg:
          "linear-gradient(145deg, #1e1e24 0%, #26262e 50%, #1e1e24 100%)",
        rightBg: "#1e1e24",
        cardBg: "rgba(30,30,38,0.98)",
        cardBorder: "#2e2e38",
        cardShadow:
          "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
        titleColor: "#f0f0f0",
        subtitleColor: "#6b6b7b",
        labelColor: "#8a8a9a",
        inputBg: "#282832",
        inputBorder: "#36363f",
        inputBorderFocus: "#7a7a8e",
        inputColor: "#e0e0e8",
        inputShadowFocus: "0 0 0 3px rgba(140,140,180,0.12)",
        btnBg: "linear-gradient(135deg, #4a4a58 0%, #3a3a48 100%)",
        btnShadow: "0 8px 24px rgba(0,0,0,0.4)",
        btnColor: "#fff",
        btnLoadingBg: "#2a2a34",
        btnLoadingBorder: "#3a3a44",
        btnLoadingBorderTop: "#8a8a9a",
        linkColor: "#b0b0c0",
        linkHover: "#f0f0f0",
        dividerColor: "#2e2e38",
        dividerText: "#3e3e48",
        toggleBg: "#282832",
        toggleBorder: "#3a3a44",
        toggleIconColor: "#fbbf24",
        errorBg: "rgba(239,68,68,0.08)",
        errorBorder: "rgba(239,68,68,0.2)",
        errorColor: "#f87171",
        panelTitle: "#f0f0f0",
        panelSubtitle: "#4e4e5e",
        logoBg: "#36363f",
        logoBorder: "rgba(255,255,255,0.1)",
        logoBoxShadow: "0 0 40px rgba(0,0,0,0.5)",
        bubbleBg: "rgba(255,255,255,0.03)",
        chatBubbleInBg: "rgba(255,255,255,0.04)",
        chatBubbleOutBg: "rgba(255,255,255,0.07)",
        chatBubbleBorder: "rgba(255,255,255,0.06)",
        chatBubbleText: "#6b6b7b",
        orbitDot1: "#7a7a8e",
        orbitDot2: "#9a9aae",
        glowColor: "rgba(100,100,140,0.15)",
        typingDot: "#7a7a8e",
        creditColor: "#2e2e38",
      }
    : {
        pageBg: "#f7f7fa",
        leftBg:
          "linear-gradient(145deg, #fafafe 0%, #f0f0f5 50%, #f7f7fa 100%)",
        rightBg: "#ffffff",
        cardBg: "rgba(255,255,255,0.98)",
        cardBorder: "#e8e8ee",
        cardShadow: "0 32px 80px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)",
        titleColor: "#1a1a2e",
        subtitleColor: "#9a9ab0",
        labelColor: "#4e4e6a",
        inputBg: "#f5f5fa",
        inputBorder: "#e0e0ea",
        inputBorderFocus: "#7a7a9e",
        inputColor: "#1a1a2e",
        inputShadowFocus: "0 0 0 3px rgba(100,100,160,0.1)",
        btnBg: "linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%)",
        btnShadow: "0 8px 24px rgba(26,26,46,0.25)",
        btnColor: "#fff",
        btnLoadingBg: "#e5e5ec",
        btnLoadingBorder: "#ccccda",
        btnLoadingBorderTop: "#5555a0",
        linkColor: "#3a3a5e",
        linkHover: "#1a1a2e",
        dividerColor: "#e8e8ee",
        dividerText: "#ccccda",
        toggleBg: "#f5f5fa",
        toggleBorder: "#e0e0ea",
        toggleIconColor: "#6b5ce7",
        errorBg: "#fff5f5",
        errorBorder: "#fed7d7",
        errorColor: "#c53030",
        panelTitle: "#1a1a2e",
        panelSubtitle: "#9a9ab0",
        logoBg: "#1a1a2e",
        logoBorder: "rgba(0,0,0,0.08)",
        logoBoxShadow: "0 0 32px rgba(0,0,0,0.15)",
        bubbleBg: "rgba(100,100,160,0.04)",
        chatBubbleInBg: "rgba(255,255,255,0.8)",
        chatBubbleOutBg: "rgba(100,100,160,0.06)",
        chatBubbleBorder: "rgba(0,0,0,0.06)",
        chatBubbleText: "#9a9ab0",
        orbitDot1: "#5e5e7e",
        orbitDot2: "#8a8aa0",
        glowColor: "rgba(100,100,160,0.08)",
        typingDot: "#5e5e7e",
        creditColor: "#dddde8",
      };

  // Animation variants
  const pageVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.3, ease: [0.7, 0, 0.84, 0] as const } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 260, damping: 24, delay: 0.1 },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  const panelContentVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring" as const, stiffness: 200, damping: 20, delay: 0.15 },
    },
  };

  const bubbleVariants = (delay: number) => ({
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 200, damping: 18, delay },
    },
  });

  const floatAnimation = (duration: number, delay: number) => ({
    y: [0, -14, -6, 0],
    transition: {
      duration,
      ease: "easeInOut" as const,
      repeat: Infinity,
      delay,
    },
  });

  const chatSlideAnimation = (duration: number, delay: number) => ({
    y: [0, -8, 0],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration,
      ease: "easeInOut" as const,
      repeat: Infinity,
      delay,
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
        display: "flex",
        fontFamily: "'Inter', sans-serif",
        background: t.pageBg,
        transition: "background 0.4s",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes orbitRotate{from{transform:rotate(0deg) translateX(80px) rotate(0deg);}to{transform:rotate(360deg) translateX(80px) rotate(-360deg);}}
        @keyframes typingBounce{0%,60%,100%{transform:translateY(0);opacity:0.4;}30%{transform:translateY(-4px);opacity:1;}}
        .login-input{width:100%;box-sizing:border-box;padding:12px 16px 12px 40px;border-radius:12px;font-size:14px;font-family:'Inter',sans-serif;outline:none;transition:all 0.25s cubic-bezier(0.4,0,0.2,1);}
        .login-input::placeholder{color:${t.subtitleColor};opacity:0.7;}
        .orbit-dot{position:absolute;width:8px;height:8px;border-radius:50%;animation:orbitRotate 12s linear infinite;}
        .orbit-dot-2{animation:orbitRotate 18s linear infinite reverse;}
        .typing-dot{width:5px;height:5px;border-radius:50%;display:inline-block;animation:typingBounce 1.2s ease-in-out infinite;}
        @media(max-width:768px){.md-hidden{display:none !important;}}
        @media(min-width:769px){.md-show{display:none !important;}}
      `}</style>

      {/* ── Left Panel ── */}
      <div
        className="md-hidden"
        style={{
          width: "45%",
          flexShrink: 0,
          background: t.leftBg,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRight: `1px solid ${t.cardBorder}`,
          transition: "background 0.4s",
        }}
      >
        {/* Floating orbs */}
        {[
          { style: { top: "8%", left: "12%", width: 80, height: 80 }, dur: 7, del: 0 },
          { style: { top: "15%", right: "10%", width: 120, height: 120 }, dur: 9, del: 1 },
          { style: { bottom: "12%", left: "8%", width: 60, height: 60 }, dur: 6, del: 2 },
          { style: { bottom: "20%", right: "15%", width: 90, height: 90 }, dur: 8, del: 0.5 },
          { style: { top: "50%", left: "5%", width: 40, height: 40 }, dur: 10, del: 3 },
        ].map((orb, i) => (
          <motion.div
            key={i}
            animate={floatAnimation(orb.dur, orb.del)}
            style={{
              position: "absolute",
              borderRadius: "50%",
              background: t.bubbleBg,
              ...orb.style,
            }}
          />
        ))}

        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: t.glowColor,
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />

        {/* Chat bubbles */}
        <motion.div
          animate={chatSlideAnimation(6, 0)}
          style={{ position: "absolute", top: "22%", left: "10%" }}
        >
          <motion.div
            variants={bubbleVariants(0.3)}
            initial="hidden"
            animate="visible"
            style={{
              background: t.chatBubbleInBg,
              border: `1px solid ${t.cardBorder}`,
              borderRadius: "16px 16px 16px 4px",
              padding: "10px 14px",
              backdropFilter: "blur(8px)",
            }}
          >
            <p style={{ margin: 0, fontSize: 12, color: t.chatBubbleText, whiteSpace: "nowrap" }}>
              K.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          animate={chatSlideAnimation(8, 1.5)}
          style={{ position: "absolute", top: "35%", right: "8%" }}
        >
          <motion.div
            variants={bubbleVariants(0.5)}
            initial="hidden"
            animate="visible"
            style={{
              background: t.chatBubbleOutBg,
              border: `1px solid ${t.chatBubbleBorder}`,
              borderRadius: "16px 16px 4px 16px",
              padding: "10px 14px",
              backdropFilter: "blur(8px)",
            }}
          >
            <p style={{ margin: 0, fontSize: 12, color: t.chatBubbleText, whiteSpace: "nowrap" }}>
              Roads Untraveled
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          animate={chatSlideAnimation(7, 3)}
          style={{ position: "absolute", bottom: "25%", left: "12%" }}
        >
          <motion.div
            variants={bubbleVariants(0.7)}
            initial="hidden"
            animate="visible"
            style={{
              background: t.chatBubbleInBg,
              border: `1px solid ${t.cardBorder}`,
              borderRadius: "16px 16px 16px 4px",
              padding: "10px 14px",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <p style={{ margin: 0, fontSize: 12, color: t.chatBubbleText }}>
              Typing...
            </p>
            <div style={{ display: "flex", gap: 3 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="typing-dot"
                  style={{
                    background: t.typingDot,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Center logo */}
        <motion.div
          variants={panelContentVariants}
          initial="hidden"
          animate="visible"
          style={{ textAlign: "center", zIndex: 10, position: "relative" }}
        >
          <div
            style={{
              position: "relative",
              display: "inline-block",
              marginBottom: 28,
            }}
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [-2, 2, -2],
              }}
              transition={{
                duration: 5,
                ease: "easeInOut",
                repeat: Infinity,
              }}
              style={{
                width: 110,
                height: 110,
                borderRadius: 30,
                background: t.logoBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: t.logoBoxShadow,
                margin: "0 auto",
                overflow: "hidden",
                border: `1.5px solid ${t.logoBorder}`,
                transition: "background 0.4s, box-shadow 0.4s",
              }}
            >
              <img
                src={LOGO_SRC}
                alt="KlesiChat Logo"
                draggable={false}
                style={{
                  width: "80%",
                  height: "80%",
                  objectFit: "contain",
                  imageRendering: "auto",
                  filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.3))",
                }}
              />
            </motion.div>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 0,
                height: 0,
              }}
            >
              <div
                className="orbit-dot"
                style={{
                  background: t.orbitDot1,
                  marginLeft: -4,
                  marginTop: -4,
                  animationDuration: "10s",
                }}
              />
              <div
                className="orbit-dot orbit-dot-2"
                style={{
                  background: t.orbitDot2,
                  marginLeft: -4,
                  marginTop: -4,
                  animationDuration: "15s",
                  opacity: 0.6,
                }}
              />
            </div>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 34,
              fontWeight: 800,
              color: t.panelTitle,
              margin: "0 0 8px",
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            KlesiChat
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{
              fontSize: 13,
              color: t.panelSubtitle,
              margin: 0,
              fontWeight: 400,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Just My Personal Chat Web
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, type: "spring" }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 28,
              justifyContent: "center",
            }}
          >
            {[
              <MessageSquare size={16} color={t.labelColor} />,
              <Music size={16} color={t.labelColor} />,
              <Sparkles size={16} color={t.labelColor} />,
            ].map((icon, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.15, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: t.bubbleBg,
                  border: `1px solid ${t.logoBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "default",
                }}
              >
                {icon}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* ── Right Form Panel ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          background: t.rightBg,
          position: "relative",
          transition: "background 0.4s",
        }}
      >
        <motion.button
          whileHover={{ scale: 1.15, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            width: 38,
            height: 38,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            border: `1px solid ${t.toggleBorder}`,
            background: t.toggleBg,
            zIndex: 10,
            transition: "background 0.3s, border-color 0.3s",
          }}
          onClick={() => setIsDark(!isDark)}
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
                <Sun size={16} color={t.toggleIconColor} />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Moon size={16} color={t.toggleIconColor} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          style={{
            width: "100%",
            maxWidth: 420,
            background: t.cardBg,
            border: `1px solid ${t.cardBorder}`,
            borderRadius: 24,
            padding: "40px 36px",
            boxShadow: t.cardShadow,
            transition: "background 0.4s, border-color 0.4s, box-shadow 0.4s",
          }}
        >
          {/* Mobile logo */}
          <motion.div
            className="md-show"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            style={{ textAlign: "center", marginBottom: 28, display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [-1, 1, -1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 60,
                height: 60,
                borderRadius: 18,
                background: t.logoBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
                boxShadow: t.logoBoxShadow,
                overflow: "hidden",
                border: `1.5px solid ${t.logoBorder}`,
                transition: "background 0.4s",
              }}
            >
              <img
                src={LOGO_SRC}
                alt="KlesiChat Logo"
                draggable={false}
                style={{
                  width: "80%",
                  height: "80%",
                  objectFit: "contain",
                  imageRendering: "auto",
                  filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.3))",
                }}
              />
            </motion.div>
            <h1
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 22,
                fontWeight: 800,
                color: t.titleColor,
                margin: 0,
                letterSpacing: "-0.03em",
              }}
            >
              KlesiChat
            </h1>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={staggerItem} style={{ marginBottom: 28 }}>
              <h2
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 24,
                  fontWeight: 700,
                  color: t.titleColor,
                  margin: "0 0 6px",
                  letterSpacing: "-0.03em",
                }}
              >
                Login
              </h2>
              <p style={{ fontSize: 14, color: t.subtitleColor, margin: 0 }}>
                Login to continue
              </p>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  style={{
                    background: t.errorBg,
                    border: `1px solid ${t.errorBorder}`,
                    borderRadius: 12,
                    padding: "12px 14px",
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <AlertCircle size={16} color={t.errorColor} />
                  <span
                    style={{ fontSize: 13, color: t.errorColor, fontWeight: 500 }}
                  >
                    {error}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit}>
              <motion.div variants={staggerItem} style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: t.labelColor,
                    marginBottom: 7,
                  }}
                >
                  Email
                </label>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: 13,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      transition: "color 0.2s",
                    }}
                  >
                    <Mail
                      size={15}
                      color={focusedField === "email" ? t.inputBorderFocus : t.subtitleColor}
                    />
                  </div>
                  <input
                    className="login-input"
                    type="email"
                    name="email"
                    placeholder="youremail@gmail.com"
                    required
                    disabled={isLoading}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    style={{
                      background: t.inputBg,
                      border: `1.5px solid ${focusedField === "email" ? t.inputBorderFocus : t.inputBorder}`,
                      color: t.inputColor,
                      boxShadow:
                        focusedField === "email" ? t.inputShadowFocus : "none",
                      paddingRight: 44,
                    }}
                  />
                </div>
              </motion.div>

              <motion.div variants={staggerItem} style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: t.labelColor,
                    marginBottom: 7,
                  }}
                >
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: 13,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      transition: "color 0.2s",
                    }}
                  >
                    <Lock
                      size={15}
                      color={focusedField === "password" ? t.inputBorderFocus : t.subtitleColor}
                    />
                  </div>
                  <input
                    className="login-input"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    style={{
                      background: t.inputBg,
                      border: `1.5px solid ${focusedField === "password" ? t.inputBorderFocus : t.inputBorder}`,
                      color: t.inputColor,
                      boxShadow:
                        focusedField === "password" ? t.inputShadowFocus : "none",
                      paddingRight: 44,
                    }}
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 4,
                      color: t.subtitleColor,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </motion.button>
                </div>
              </motion.div>

              <motion.div variants={staggerItem}>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={!isLoading ? { y: -2, scale: 1.01 } : {}}
                  whileTap={!isLoading ? { y: 0, scale: 0.98 } : {}}
                  style={{
                    width: "100%",
                    padding: 14,
                    border: "none",
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 600,
                    fontFamily: "'Inter', sans-serif",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    letterSpacing: "0.01em",
                    background: isLoading ? t.btnLoadingBg : t.btnBg,
                    color: isLoading ? t.subtitleColor : t.btnColor,
                    boxShadow: isLoading ? "none" : t.btnShadow,
                    opacity: isLoading ? 0.6 : 1,
                    transition: "background 0.3s, box-shadow 0.3s, opacity 0.3s",
                  }}
                >
                  {isLoading ? (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                      }}
                    >
                      <span
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          border: `2px solid ${t.btnLoadingBorder}`,
                          borderTop: `2px solid ${t.btnLoadingBorderTop}`,
                          animation: "spin 0.7s linear infinite",
                          display: "inline-block",
                        }}
                      />
                      Memproses...
                    </span>
                  ) : (
                    "Masuk →"
                  )}
                </motion.button>
              </motion.div>
            </form>

            <motion.div
              variants={staggerItem}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                margin: "24px 0",
              }}
            >
              <div style={{ flex: 1, height: 1, background: t.dividerColor }} />
              <span
                style={{
                  fontSize: 11,
                  color: t.dividerText,
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: "0.08em",
                }}
              >
                Or
              </span>
              <div style={{ flex: 1, height: 1, background: t.dividerColor }} />
            </motion.div>

            <motion.p
              variants={staggerItem}
              style={{
                textAlign: "center",
                fontSize: 14,
                color: t.subtitleColor,
                margin: 0,
              }}
            >
              Don't have an account?{" "}
              <motion.a
                href="/register"
                whileHover={{ scale: 1.03 }}
                style={{
                  color: t.linkColor,
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "inline-block",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = t.linkHover)}
                onMouseLeave={(e) => (e.currentTarget.style.color = t.linkColor)}
              >
                Register Here
              </motion.a>
            </motion.p>
            <motion.p
              variants={staggerItem}
              style={{
                textAlign: "center",
                fontSize: 10,
                color: t.creditColor,
                margin: "20px 0 0",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Deslyy : Mff kalo masih banyak Bug :))))
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
