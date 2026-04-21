import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Sun, Moon, MessageCircle, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
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

      if (profile?.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/chat";
      }
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
        btnHoverBg: "#666666",
        btnShadow: "0 8px 24px rgba(0,0,0,0.4)",
        btnColor: "#fff",
        btnLoadingBg: "#3a3a3a",
        btnLoadingBorder: "#4a4a4a",
        btnLoadingBorderTop: "#888888",
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
        btnHoverBg: "#333333",
        btnShadow: "0 8px 24px rgba(0,0,0,0.2)",
        btnColor: "#fff",
        btnLoadingBg: "#e5e5e5",
        btnLoadingBorder: "#cccccc",
        btnLoadingBorderTop: "#555555",
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
        creditColor: "#dddddd",
      };

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

        @keyframes floatA {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-14px) rotate(1deg); }
          66% { transform: translateY(-8px) rotate(-1deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          40% { transform: translateY(-20px) rotate(-1.5deg); }
          80% { transform: translateY(-10px) rotate(0.5deg); }
        }
        @keyframes floatC {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
        }
        @keyframes chatSlide {
          0%, 100% { transform: translateY(0px); opacity: 0.7; }
          50% { transform: translateY(-8px); opacity: 1; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes errorShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes orbitRotate {
          from { transform: rotate(0deg) translateX(80px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(80px) rotate(-360deg); }
        }

        .fa1 { animation: floatA 7s ease-in-out infinite; }
        .fa2 { animation: floatB 9s ease-in-out infinite 1s; }
        .fa3 { animation: floatC 6s ease-in-out infinite 2s; }
        .fa4 { animation: floatA 8s ease-in-out infinite 0.5s; }
        .fa5 { animation: floatC 10s ease-in-out infinite 3s; }
        .chat-a { animation: chatSlide 6s ease-in-out infinite; }
        .chat-b { animation: chatSlide 8s ease-in-out infinite 1.5s; }
        .chat-c { animation: chatSlide 7s ease-in-out infinite 3s; }

        .orbit-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: orbitRotate 12s linear infinite;
        }
        .orbit-dot-2 { animation: orbitRotate 18s linear infinite reverse; }

        .form-card { animation: fadeUp 0.5s cubic-bezier(0.34,1.2,0.64,1) both; }
        .panel-content { animation: slideInLeft 0.6s cubic-bezier(0.34,1.2,0.64,1) both 0.1s; }

        .login-input {
          width: 100%;
          box-sizing: border-box;
          padding: 13px 16px;
          border-radius: 12px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: all 0.2s;
        }
        .login-btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
          letter-spacing: 0.01em;
        }
        .login-btn:hover:not(:disabled) { transform: translateY(-2px) scale(1.01); }
        .login-btn:active:not(:disabled) { transform: translateY(0) scale(0.98); }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .toggle-theme {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          z-index: 10;
        }
        .toggle-theme:hover { transform: scale(1.1) rotate(10deg); }
        .error-box { animation: errorShake 0.4s ease; }
        .typing-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          display: inline-block;
          animation: typingBounce 1.2s ease-in-out infinite;
        }
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
        {/* Floating orbs */}
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

        {/* Glow center */}
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

        {/* Floating chat bubbles */}
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
          style={{ position: "absolute", top: "35%", right: "8%" }}
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
              Roads Untraveled
            </p>
          </div>
        </div>

        <div
          className="chat-c"
          style={{ position: "absolute", bottom: "25%", left: "12%" }}
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
              fontFamily: "'Syne', sans-serif",
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
              margin: 0,
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
              marginTop: 28,
              justifyContent: "center",
            }}
          >
            {["💬", "🎵", "✨"].map((e, i) => (
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
          padding: "40px 24px",
          background: t.rightBg,
          position: "relative",
          transition: "background 0.3s",
        }}
      >
        {/* Theme toggle */}
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
            padding: "40px 36px",
            boxShadow: t.cardShadow,
            transition: "background 0.3s, border-color 0.3s",
          }}
        >
          {/* Mobile logo */}
          <div
            className="md-show"
            style={{ textAlign: "center", marginBottom: 28 }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: t.logoGradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
                boxShadow: t.logoBoxShadow,
              }}
            >
              <MessageCircle size={24} color="#fff" />
            </div>
            <h1
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 24,
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
          <div style={{ marginBottom: 32 }}>
            <h2
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 26,
                fontWeight: 800,
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
          </div>

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
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: t.labelColor,
                  marginBottom: 8,
                  letterSpacing: "0.01em",
                }}
              >
                Email
              </label>
              <div style={{ position: "relative" }}>
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
                <span
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 16,
                    opacity: 0.4,
                  }}
                >
                  ✉️
                </span>
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: t.labelColor,
                  marginBottom: 8,
                  letterSpacing: "0.01em",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
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
                    color: t.subtitleColor,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="login-btn"
              style={{
                background: isLoading ? t.btnLoadingBg : t.btnBg,
                color: isLoading ? t.subtitleColor : t.btnColor,
                boxShadow: isLoading ? "none" : t.btnShadow,
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
            </button>
          </form>

          {/* Divider */}
          <div
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
                fontFamily: "'DM Mono', monospace",
                letterSpacing: "0.08em",
              }}
            >
              Or
            </span>
            <div style={{ flex: 1, height: 1, background: t.dividerColor }} />
          </div>

          {/* Register link */}
          <p
            style={{
              textAlign: "center",
              fontSize: 14,
              color: t.subtitleColor,
              margin: 0,
            }}
          >
            Don't have an account?{" "}
            <a
              href="/register"
              style={{
                color: t.linkColor,
                fontWeight: 600,
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = t.linkHover)}
              onMouseLeave={(e) => (e.currentTarget.style.color = t.linkColor)}
            >
              Register Here
            </a>
          </p>

          {/* Credit */}
          <p
            style={{
              textAlign: "center",
              fontSize: 10,
              color: t.creditColor,
              margin: "20px 0 0",
              fontFamily: "'DM Mono', monospace",
            }}
          >
            Deslyy : Mff kalo masih banyak Bug :))))
          </p>
        </div>
      </div>
    </div>
  );
}
