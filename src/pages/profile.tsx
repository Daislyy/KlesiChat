import { useEffect, useState } from "react";
import { User, Mail, Shield, Calendar, ArrowLeft, Sun, Moon } from "lucide-react";
import { supabase } from "../lib/supabase";
import ProfileForm from "../components/ProfileForm";
import { motion, AnimatePresence } from "framer-motion";
import { getChatTheme } from "../lib/chatTheme";

interface UserData {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  role: string;
  created_at: string;
}

function withCacheBuster(url: string) {
  if (!url) return "";
  return `${url}?t=${Date.now()}`;
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarSrc, setAvatarSrc] = useState("");
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark" || 
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  const t = getChatTheme(isDark);

  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const avatar = profile?.avatar_url || "";
      setAvatarSrc(withCacheBuster(avatar));

      setUserData({
        id: user.id,
        username: profile?.username || "",
        email: user.email || "",
        avatar_url: avatar,
        role: profile?.role || "user",
        created_at: profile?.created_at || user.created_at,
      });
      setLoading(false);
    };
    load();
  }, []);

  const handleUpdated = (updated: Partial<UserData>) => {
    setUserData((prev) => (prev ? { ...prev, ...updated } : prev));
    if (updated.avatar_url) {
      setAvatarSrc(withCacheBuster(updated.avatar_url));
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: t.pageBg, transition: "background 0.3s" }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              border: `2.5px solid ${t.loaderBorderColor}`,
              borderTop: `2.5px solid ${t.loaderTopColor}`,
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ fontSize: 13, color: t.loaderText, fontFamily: "monospace", letterSpacing: "0.1em" }}>
            memuat...
          </p>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  const joinDate = new Date(userData.created_at).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Page Transition variants
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 280, damping: 24 },
    },
  };

  return (
    <motion.main
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen"
      style={{
        background: t.pageBg,
        color: isDark ? "#f3f4f6" : "#1f2937",
        fontFamily: "'DM Sans', sans-serif",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <motion.a
              href="/chat"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 14,
                color: isDark ? "#9ca3af" : "#6b7280",
                textDecoration: "none",
                marginBottom: 12,
                fontWeight: 500,
              }}
              whileHover={{ x: -4, color: isDark ? "#f3f4f6" : "#111827" }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <ArrowLeft size={16} />
              Kembali ke Chat
            </motion.a>
            <h1 className="text-3xl font-bold mb-1" style={{ letterSpacing: "-0.02em" }}>Profil Saya</h1>
            <p style={{ color: isDark ? "#9ca3af" : "#6b7280" }} className="text-sm">Kelola informasi profil kamu</p>
          </div>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsDark(!isDark)}
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
              background: isDark ? "#1f2937" : "#ffffff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
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
                  <Sun size={18} color="#fbbf24" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon size={18} color="#6366f1" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left Panel - Profile Cards */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              variants={itemVariants}
              className="rounded-2xl p-8 text-center"
              style={{
                background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`,
                boxShadow: isDark ? "none" : "0 10px 30px rgba(0,0,0,0.02)",
              }}
            >
              <div className="relative w-32 h-32 mx-auto mb-5">
                {avatarSrc ? (
                  <motion.img
                    src={avatarSrc}
                    alt={userData.username}
                    className="w-full h-full rounded-full object-cover border-4"
                    style={{ borderColor: isDark ? "#4b5563" : "#e5e7eb" }}
                    whileHover={{ scale: 1.06, rotate: 2 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  />
                ) : (
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center border-4"
                    style={{
                      background: isDark ? "#374151" : "#f3f4f6",
                      borderColor: isDark ? "#4b5563" : "#e5e7eb",
                    }}
                  >
                    <User size={48} style={{ color: isDark ? "#9ca3af" : "#6b7280" }} />
                  </div>
                )}
                <div
                  className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4"
                  style={{ borderColor: isDark ? "#1f2937" : "#ffffff" }}
                />
              </div>

              <h2 className="text-xl font-bold mb-1">{userData.username}</h2>
              <p style={{ color: isDark ? "#9ca3af" : "#6b7280" }} className="text-sm mb-4">{userData.email}</p>

              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
                style={{
                  background: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`,
                }}
              >
                <Shield size={14} style={{ color: isDark ? "#d1d5db" : "#4b5563" }} />
                <span className="text-sm capitalize font-medium" style={{ color: isDark ? "#d1d5db" : "#4b5563" }}>
                  {userData.role}
                </span>
              </div>

              <div
                className="pt-5"
                style={{ borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}` }}
              >
                <div className="flex items-center justify-center gap-2 mb-1" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
                  <Calendar size={16} />
                  <span className="text-sm">Bergabung</span>
                </div>
                <p className="text-sm font-semibold">{joinDate}</p>
              </div>
            </motion.div>

            {/* Username Card */}
            <motion.div
              variants={itemVariants}
              className="rounded-xl p-4 flex items-center gap-4"
              style={{
                background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`,
                boxShadow: isDark ? "none" : "0 10px 30px rgba(0,0,0,0.02)",
              }}
            >
              <div
                className="p-3 rounded-lg"
                style={{ background: isDark ? "#374151" : "#f3f4f6" }}
              >
                <User size={20} style={{ color: isDark ? "#d1d5db" : "#4b5563" }} />
              </div>
              <div>
                <p style={{ color: isDark ? "#9ca3af" : "#6b7280" }} className="text-xs">Username</p>
                <p className="font-semibold text-sm">{userData.username}</p>
              </div>
            </motion.div>

            {/* Email Card */}
            <motion.div
              variants={itemVariants}
              className="rounded-xl p-4 flex items-center gap-4"
              style={{
                background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`,
                boxShadow: isDark ? "none" : "0 10px 30px rgba(0,0,0,0.02)",
              }}
            >
              <div
                className="p-3 rounded-lg"
                style={{ background: isDark ? "#374151" : "#f3f4f6" }}
              >
                <Mail size={20} style={{ color: isDark ? "#d1d5db" : "#4b5563" }} />
              </div>
              <div className="min-w-0 flex-1">
                <p style={{ color: isDark ? "#9ca3af" : "#6b7280" }} className="text-xs">Email</p>
                <p className="font-semibold text-sm truncate">{userData.email}</p>
              </div>
            </motion.div>
          </div>

          {/* Right Panel - Profile Form */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2"
          >
            <div
              className="rounded-2xl p-8"
              style={{
                background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`,
                boxShadow: isDark ? "none" : "0 10px 30px rgba(0,0,0,0.02)",
              }}
            >
              <h3 className="text-xl font-bold mb-6">Edit Profil</h3>
              <ProfileForm user={userData} onUpdated={handleUpdated} isDark={isDark} />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.main>
  );
}
