import { useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Sun,
  Moon,
  MessageCircle,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  CheckCircle2,
} from "lucide-react";

export default function Register() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordVal, setPasswordVal] = useState("");

  const pwChecks = {
    length: passwordVal.length >= 8,
    upper: /[A-Z]/.test(passwordVal),
    lower: /[a-z]/.test(passwordVal),
    number: /[0-9]/.test(passwordVal),
  };
  const pwStrength = Object.values(pwChecks).filter(Boolean).length;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const form = e.currentTarget;
    const username = (form.elements.namedItem("username") as HTMLInputElement)
      .value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/login";
      }, 2200);
    }

    setIsLoading(false);
  }

  const t = isDark
    ? {
        pageBg: "#2b2b2b",
        leftBg:
          "linear-gradient(145deg, #2b2b2b 0%, #323232 50%, #2b2b2b 100%)",
        rightBg: "#2b2b2b",
        cardBg: "rgba(38,38,38,0.98)",
        cardBorder: "#3a3a3a",
        cardShadow:
          "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
        titleColor: "#f0f0f0",
        subtitleColor: "#666666",
        labelColor: "#888888",
        inputBg: "#333333",
        inputBorder: "#3f3f3f",
        inputBorderFocus: "#888888",
        inputColor: "#e0e0e0",
        inputPlaceholder: "#555555",
        inputShadowFocus: "0 0 0 2px rgba(255,255,255,0.08)",
        btnBg: "#555555",
        btnShadow: "0 8px 24px rgba(0,0,0,0.4)",
        btnColor: "#fff",
        btnLoadingBg: "#3a3a3a",
        btnLoadingBorder: "#4a4a4a",
        btnLoadingBorderTop: "#888888",
        btnSuccessBg: "#3a3a3a",
        linkColor: "#bbbbbb",
        linkHover: "#f0f0f0",
        dividerColor: "#3a3a3a",
        dividerText: "#444444",
        toggleBg: "#333333",
        toggleBorder: "#4a4a4a",
        toggleIconColor: "#fbbf24",
        errorBg: "rgba(239,68,68,0.08)",
        errorBorder: "rgba(239,68,68,0.2)",
        errorColor: "#f87171",
        successBg: "rgba(34,197,94,0.08)",
        successBorder: "rgba(34,197,94,0.2)",
        successColor: "#4ade80",
        hintColor: "#555555",
        hintOkColor: "#6fcf97",
        pwBarBg: "#3a3a3a",
        pwBarColors: ["#ef4444", "#f97316", "#888888", "#6fcf97"],
        panelTitle: "#f0f0f0",
        panelSubtitle: "#555555",
        logoBg: "rgba(255,255,255,0.05)",
        logoBorder: "rgba(255,255,255,0.1)",
        logoGradient: "#444444",
        logoBoxShadow: "0 0 40px rgba(0,0,0,0.5)",
        bubbleBg: "rgba(255,255,255,0.04)",
        chatBubbleInBg: "rgba(255,255,255,0.05)",
        chatBubbleOutBg: "rgba(255,255,255,0.08)",
        chatBubbleBorder: "rgba(255,255,255,0.08)",
        chatBubbleText: "#666666",
        orbitColor: "rgba(255,255,255,0.06)",
        orbitDot1: "#888888",
        orbitDot2: "#aaaaaa",
        glowColor: "rgba(80,80,80,0.3)",
        typingDot: "#888888",
        iconColor: "#666666",
        iconFocusColor: "#aaaaaa",
        creditColor: "#3a3a3a",
      }
    : {
        pageBg: "#f5f5f5",
        leftBg:
          "linear-gradient(145deg, #f8f8f8 0%, #f0f0f0 50%, #f5f5f5 100%)",
        rightBg: "#ffffff",
        cardBg: "rgba(255,255,255,0.98)",
        cardBorder: "#e8e8e8",
        cardShadow: "0 32px 80px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
        titleColor: "#1a1a1a",
        subtitleColor: "#aaaaaa",
        labelColor: "#555555",
        inputBg: "#f5f5f5",
        inputBorder: "#e5e5e5",
        inputBorderFocus: "#888888",
        inputColor: "#1a1a1a",
        inputPlaceholder: "#aaaaaa",
        inputShadowFocus: "0 0 0 2px rgba(0,0,0,0.08)",
        btnBg: "#1a1a1a",
        btnShadow: "0 8px 24px rgba(0,0,0,0.2)",
        btnColor: "#fff",
        btnLoadingBg: "#e5e5e5",
        btnLoadingBorder: "#cccccc",
        btnLoadingBorderTop: "#555555",
        btnSuccessBg: "#e5e5e5",
        linkColor: "#333333",
        linkHover: "#000000",
        dividerColor: "#e8e8e8",
        dividerText: "#cccccc",
        toggleBg: "#f5f5f5",
        toggleBorder: "#e0e0e0",
        toggleIconColor: "#555555",
        errorBg: "#fff5f5",
        errorBorder: "#fed7d7",
        errorColor: "#c53030",
        successBg: "#f0fdf4",
        successBorder: "#bbf7d0",
        successColor: "#16a34a",
        hintColor: "#aaaaaa",
        hintOkColor: "#3b6d11",
        pwBarBg: "#e5e5e5",
        pwBarColors: ["#ef4444", "#f97316", "#888888", "#6fcf97"],
        panelTitle: "#1a1a1a",
        panelSubtitle: "#aaaaaa",
        logoBg: "rgba(0,0,0,0.05)",
        logoBorder: "rgba(0,0,0,0.1)",
        logoGradient: "#1a1a1a",
        logoBoxShadow: "0 0 32px rgba(0,0,0,0.2)",
        bubbleBg: "rgba(0,0,0,0.03)",
        chatBubbleInBg: "rgba(255,255,255,0.8)",
        chatBubbleOutBg: "rgba(0,0,0,0.06)",
        chatBubbleBorder: "rgba(0,0,0,0.08)",
        chatBubbleText: "#aaaaaa",
        orbitColor: "rgba(0,0,0,0.05)",
        orbitDot1: "#555555",
        orbitDot2: "#888888",
        glowColor: "rgba(0,0,0,0.06)",
        typingDot: "#555555",
        iconColor: "#aaaaaa",
        iconFocusColor: "#555555",
        creditColor: "#dddddd",
      };

  const pwBarColor =
    pwStrength === 0 ? t.pwBarBg : t.pwBarColors[pwStrength - 1];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "'DM Sans', sans-serif",
        background: t.pageBg,
        transition: "background 0.3s",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&family=Syne:wght@700;800&display=swap');

        @keyframes floatA { 0%,100%{transform:translateY(0) rotate(0deg);}33%{transform:translateY(-14px) rotate(1deg);}66%{transform:translateY(-8px) rotate(-1deg);} }
        @keyframes floatB { 0%,100%{transform:translateY(0);}40%{transform:translateY(-20px);}80%{transform:translateY(-10px);} }
        @keyframes floatC { 0%,100%{transform:translateY(0);}50%{transform:translateY(-16px);} }
        @keyframes chatSlide { 0%,100%{transform:translateY(0);opacity:0.7;}50%{transform:translateY(-8px);opacity:1;} }
        @keyframes spin { to{transform:rotate(360deg);} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
        @keyframes slideInLeft { from{opacity:0;transform:translateX(-20px);}to{opacity:1;transform:translateX(0);} }
        @keyframes errorShake { 0%,100%{transform:translateX(0);}20%{transform:translateX(-6px);}40%{transform:translateX(6px);}60%{transform:translateX(-4px);}80%{transform:translateX(4px);} }
        @keyframes successPop { 0%{opacity:0;transform:scale(0.8);}60%{transform:scale(1.05);}100%{opacity:1;transform:scale(1);} }
        @keyframes orbitRotate { from{transform:rotate(0deg) translateX(80px) rotate(0deg);}to{transform:rotate(360deg) translateX(80px) rotate(-360deg);} }
        @keyframes typingBounce { 0%,60%,100%{transform:translateY(0);opacity:0.4;}30%{transform:translateY(-4px);opacity:1;} }

        .fa1{animation:floatA 7s ease-in-out infinite;}
        .fa2{animation:floatB 9s ease-in-out infinite 1s;}
        .fa3{animation:floatC 6s ease-in-out infinite 2s;}
        .fa4{animation:floatA 8s ease-in-out infinite 0.5s;}
        .fa5{animation:floatC 10s ease-in-out infinite 3s;}
        .chat-a{animation:chatSlide 6s ease-in-out infinite;}
        .chat-b{animation:chatSlide 8s ease-in-out infinite 1.5s;}
        .chat-c{animation:chatSlide 7s ease-in-out infinite 3s;}
        .orbit-dot{position:absolute;width:8px;height:8px;border-radius:50%;animation:orbitRotate 12s linear infinite;}
        .orbit-dot-2{animation:orbitRotate 18s linear infinite reverse;}
        .form-card{animation:fadeUp 0.5s cubic-bezier(0.34,1.2,0.64,1) both;}
        .panel-content{animation:slideInLeft 0.6s cubic-bezier(0.34,1.2,0.64,1) both 0.1s;}
        .error-box{animation:errorShake 0.4s ease;}
        .success-box{animation:successPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;}

        .login-input {
          width:100%;box-sizing:border-box;padding:12px 16px 12px 40px;
          border-radius:12px;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:all 0.2s;
        }
        .login-btn {
          width:100%;padding:14px;border:none;border-radius:12px;font-size:15px;
          font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;
          transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1);letter-spacing:0.01em;
        }
        .login-btn:hover:not(:disabled){transform:translateY(-2px) scale(1.01);}
        .login-btn:active:not(:disabled){transform:translateY(0) scale(0.98);}
        .login-btn:disabled{opacity:0.6;cursor:not-allowed;}
        .toggle-theme{position:absolute;top:20px;right:20px;width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;transition:all 0.2s;z-index:10;}
        .toggle-theme:hover{transform:scale(1.1) rotate(10deg);}
        .typing-dot{width:5px;height:5px;border-radius:50%;display:inline-block;animation:typingBounce 1.2s ease-in-out infinite;}
        .pw-check{display:flex;align-items:center;gap:6px;font-size:11px;transition:color 0.2s;}
        .hint-link:hover{text-decoration:underline;}
        @media (max-width: 768px) { .md-hidden { display: none !important; } }
        @media (min-width: 769px) { .md-show { display: none !important; } }
      `}</style>

      {/* ── Left Decorative Panel ── */}
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
          transition: "background 0.3s",
        }}
      >
        {/* Orbs */}
        {[
          {
            cls: "fa1",
            style: {
              top: "8%",
              left: "12%",
              width: 80,
              height: 80,
              border: `1px solid ${t.orbitColor}`,
            },
          },
          {
            cls: "fa2",
            style: { top: "15%", right: "10%", width: 120, height: 120 },
          },
          {
            cls: "fa3",
            style: { bottom: "12%", left: "8%", width: 60, height: 60 },
          },
          {
            cls: "fa4",
            style: {
              bottom: "20%",
              right: "15%",
              width: 90,
              height: 90,
              border: `1px solid ${t.orbitColor}`,
            },
          },
          {
            cls: "fa5",
            style: { top: "50%", left: "5%", width: 40, height: 40 },
          },
        ].map((orb, i) => (
          <div
            key={i}
            className={orb.cls}
            style={{
              position: "absolute",
              borderRadius: "50%",
              background: t.bubbleBg,
              ...orb.style,
            }}
          />
        ))}

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
        <div
          className="chat-a"
          style={{ position: "absolute", top: "22%", left: "10%" }}
        >
          <div
            style={{
              background: t.chatBubbleInBg,
              border: `1px solid ${t.cardBorder}`,
              borderRadius: "16px 16px 16px 4px",
              padding: "10px 14px",
              backdropFilter: "blur(8px)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: t.chatBubbleText,
                whiteSpace: "nowrap",
              }}
            >
              K.
            </p>
          </div>
        </div>
        <div
          className="chat-b"
          style={{ position: "absolute", top: "38%", right: "8%" }}
        >
          <div
            style={{
              background: t.chatBubbleOutBg,
              border: `1px solid ${t.chatBubbleBorder}`,
              borderRadius: "16px 16px 4px 16px",
              padding: "10px 14px",
              backdropFilter: "blur(8px)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: t.chatBubbleText,
                whiteSpace: "nowrap",
              }}
            >
              KlesiChat Lol.
            </p>
          </div>
        </div>
        <div
          className="chat-c"
          style={{ position: "absolute", bottom: "26%", left: "12%" }}
        >
          <div
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
              someone is joining
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
          </div>
        </div>

        {/* Center logo */}
        <div
          className="panel-content"
          style={{ textAlign: "center", zIndex: 10, position: "relative" }}
        >
          <div
            style={{
              position: "relative",
              display: "inline-block",
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: 24,
                background: t.logoGradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: t.logoBoxShadow,
                margin: "0 auto",
              }}
            >
              <MessageCircle size={40} color="#fff" />
            </div>
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
          <h1
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 36,
              fontWeight: 800,
              color: t.panelTitle,
              margin: "0 0 8px",
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            KlesiChat
          </h1>
          <p
            style={{
              fontSize: 13,
              color: t.panelSubtitle,
              margin: "0 0 28px",
              fontWeight: 400,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Just My Personal Chat Web
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              justifyContent: "center",
            }}
          >
            {["👤", "💬", "🚀"].map((e, i) => (
              <div
                key={i}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: t.logoBg,
                  border: `1px solid ${t.logoBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                {e}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 24px",
          background: t.rightBg,
          position: "relative",
          transition: "background 0.3s",
        }}
      >
        <button
          className="toggle-theme"
          style={{
            background: t.toggleBg,
            border: `1px solid ${t.toggleBorder}`,
          }}
          onClick={() => setIsDark(!isDark)}
          title={isDark ? "Tema Terang" : "Tema Gelap"}
        >
          {isDark ? (
            <Sun size={16} color={t.toggleIconColor} />
          ) : (
            <Moon size={16} color={t.toggleIconColor} />
          )}
        </button>

        <div
          className="form-card"
          style={{
            width: "100%",
            maxWidth: 420,
            background: t.cardBg,
            border: `1px solid ${t.cardBorder}`,
            borderRadius: 24,
            padding: "36px 36px 32px",
            boxShadow: t.cardShadow,
            transition: "background 0.3s, border-color 0.3s",
          }}
        >
          {/* Mobile logo */}
          <div
            className="md-show"
            style={{ textAlign: "center", marginBottom: 24 }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: t.logoGradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 10px",
                boxShadow: t.logoBoxShadow,
              }}
            >
              <MessageCircle size={22} color="#fff" />
            </div>
            <h1
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 22,
                fontWeight: 800,
                color: t.titleColor,
                margin: 0,
                letterSpacing: "-0.03em",
              }}
            >
              KlesiChat
            </h1>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 24 }}>
            <h2
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 24,
                fontWeight: 800,
                color: t.titleColor,
                margin: "0 0 6px",
                letterSpacing: "-0.03em",
              }}
            >
              Register
            </h2>
            <p style={{ fontSize: 14, color: t.subtitleColor, margin: 0 }}>
              Register to continue
            </p>
          </div>

          {/* Success */}
          {success && (
            <div
              className="success-box"
              style={{
                background: t.successBg,
                border: `1px solid ${t.successBorder}`,
                borderRadius: 12,
                padding: "14px 16px",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <CheckCircle2 size={18} color={t.successColor} />
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    color: t.successColor,
                  }}
                >
                  Akun berhasil dibuat!
                </p>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: 12,
                    color: t.subtitleColor,
                  }}
                >
                  Mengalihkan ke halaman login...
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="error-box"
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
              <span style={{ fontSize: 16 }}>⚠️</span>
              <span
                style={{ fontSize: 13, color: t.errorColor, fontWeight: 500 }}
              >
                {error}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: t.labelColor,
                  marginBottom: 7,
                  letterSpacing: "0.01em",
                }}
              >
                Username
              </label>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                >
                  <User
                    size={15}
                    color={
                      focusedField === "username"
                        ? t.iconFocusColor
                        : t.iconColor
                    }
                    style={{ transition: "color 0.2s" }}
                  />
                </div>
                <input
                  className="login-input"
                  type="text"
                  name="username"
                  placeholder="username"
                  required
                  disabled={isLoading || success}
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    background: t.inputBg,
                    border: `1.5px solid ${focusedField === "username" ? t.inputBorderFocus : t.inputBorder}`,
                    color: t.inputColor,
                    boxShadow:
                      focusedField === "username" ? t.inputShadowFocus : "none",
                  }}
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: t.labelColor,
                  marginBottom: 7,
                  letterSpacing: "0.01em",
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
                  }}
                >
                  <Mail
                    size={15}
                    color={
                      focusedField === "email" ? t.iconFocusColor : t.iconColor
                    }
                    style={{ transition: "color 0.2s" }}
                  />
                </div>
                <input
                  className="login-input"
                  type="email"
                  name="email"
                  placeholder="youremail@gmail.com"
                  required
                  disabled={isLoading || success}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    background: t.inputBg,
                    border: `1.5px solid ${focusedField === "email" ? t.inputBorderFocus : t.inputBorder}`,
                    color: t.inputColor,
                    boxShadow:
                      focusedField === "email" ? t.inputShadowFocus : "none",
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 10 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: t.labelColor,
                  marginBottom: 7,
                  letterSpacing: "0.01em",
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
                  }}
                >
                  <Lock
                    size={15}
                    color={
                      focusedField === "password"
                        ? t.iconFocusColor
                        : t.iconColor
                    }
                    style={{ transition: "color 0.2s" }}
                  />
                </div>
                <input
                  className="login-input"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Min. 8 characters"
                  required
                  disabled={isLoading || success}
                  value={passwordVal}
                  onChange={(e) => setPasswordVal(e.target.value)}
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
                <button
                  type="button"
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
                    color: t.iconColor,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Password strength bar */}
            {passwordVal.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 3,
                        borderRadius: 4,
                        background: i <= pwStrength ? pwBarColor : t.pwBarBg,
                        transition: "background 0.3s",
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "4px 12px",
                  }}
                >
                  {[
                    { key: "length", label: "Min. 8 karakter" },
                    { key: "upper", label: "Huruf besar (A-Z)" },
                    { key: "lower", label: "Huruf kecil (a-z)" },
                    { key: "number", label: "Angka (0-9)" },
                  ].map(({ key, label }) => (
                    <div
                      key={key}
                      className="pw-check"
                      style={{
                        color: (pwChecks as any)[key]
                          ? t.hintOkColor
                          : t.hintColor,
                      }}
                    >
                      <span style={{ fontSize: 10 }}>
                        {(pwChecks as any)[key] ? "✓" : "○"}
                      </span>
                      <span style={{ fontSize: 11 }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || success}
              className="login-btn"
              style={{
                background: isLoading || success ? t.btnSuccessBg : t.btnBg,
                color: isLoading || success ? t.subtitleColor : t.btnColor,
                boxShadow: isLoading || success ? "none" : t.btnShadow,
                marginTop: 8,
              }}
            >
              {success ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <CheckCircle2 size={16} color={t.successColor} /> Register
                  Success
                </span>
              ) : isLoading ? (
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
                  Mendaftarkan...
                </span>
              ) : (
                "Register →"
              )}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "22px 0",
            }}
          >
            <div style={{ flex: 1, height: 1, background: t.dividerColor }} />
            <span
              style={{
                fontSize: 11,
                color: t.dividerText,
                fontFamily: "'DM Mono',monospace",
                letterSpacing: "0.08em",
              }}
            >
              Or
            </span>
            <div style={{ flex: 1, height: 1, background: t.dividerColor }} />
          </div>

          {/* Login link */}
          <p
            style={{
              textAlign: "center",
              fontSize: 14,
              color: t.subtitleColor,
              margin: 0,
            }}
          >
            Already have an account?{" "}
            <a
              href="/login"
              className="hint-link"
              style={{
                color: t.linkColor,
                fontWeight: 600,
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = t.linkHover)}
              onMouseLeave={(e) => (e.currentTarget.style.color = t.linkColor)}
            >
              Login here
            </a>
          </p>

          {/* Credit */}
          <p
            style={{
              textAlign: "center",
              fontSize: 10,
              color: t.creditColor,
              margin: "18px 0 0",
              fontFamily: "'DM Mono',monospace",
            }}
          >
            Deslyy : Mff kalo masih banyak Bug :))))
          </p>
        </div>
      </div>
    </div>
  );
}
