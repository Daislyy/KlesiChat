import { useEffect, useState } from "react";
import { User, Mail, Shield, Calendar } from "lucide-react";
import { supabase } from "../lib/supabase";
import ProfileForm from "../components/ProfileForm";

interface UserData {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  role: string;
  created_at: string;
}

// ✅ Tambah cache buster agar browser reload gambar baru
function withCacheBuster(url: string) {
  if (!url) return "";
  return `${url}?t=${Date.now()}`;
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  // ✅ Simpan avatar URL terpisah agar bisa di-update + cache bust
  const [avatarSrc, setAvatarSrc] = useState("");

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

  // ✅ Saat profil diupdate, refresh avatarSrc dengan cache buster baru
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
        style={{ background: "#2e2e2e" }}
      >
        <p className="text-gray-400">Memuat...</p>
      </div>
    );
  }

  if (!userData) return null;

  const joinDate = new Date(userData.created_at).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main
      className="min-h-screen text-white"
      style={{ background: "#2e2e2e", fontFamily: "sans-serif" }}
    >
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Profil Saya</h1>
          <p className="text-gray-400 text-sm">Kelola informasi profil kamu</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-5">
            <div
              className="rounded-2xl p-8 text-center"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="relative w-32 h-32 mx-auto mb-5">
                {/* ✅ Pakai avatarSrc yang sudah ada cache buster */}
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={userData.username}
                    className="w-full h-full rounded-full object-cover border-4 border-gray-500"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-600 flex items-center justify-center border-4 border-gray-500">
                    <User size={48} className="text-gray-400" />
                  </div>
                )}
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-[#2e2e2e]" />
              </div>

              <h2 className="text-xl font-bold text-white mb-1">
                {userData.username}
              </h2>
              <p className="text-gray-400 text-sm mb-4">{userData.email}</p>

              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <Shield size={14} className="text-gray-300" />
                <span className="text-gray-300 text-sm capitalize">
                  {userData.role}
                </span>
              </div>

              <div
                className="pt-5"
                style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
              >
                <div className="flex items-center justify-center gap-2 text-gray-400 mb-1">
                  <Calendar size={16} />
                  <span className="text-sm">Bergabung</span>
                </div>
                <p className="text-white text-sm font-semibold">{joinDate}</p>
              </div>
            </div>

            <div
              className="rounded-xl p-4 flex items-center gap-4"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="bg-gray-600 p-3 rounded-lg">
                <User size={20} className="text-gray-300" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Username</p>
                <p className="text-white font-semibold text-sm">
                  {userData.username}
                </p>
              </div>
            </div>

            <div
              className="rounded-xl p-4 flex items-center gap-4"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="bg-gray-600 p-3 rounded-lg">
                <Mail size={20} className="text-gray-300" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Email</p>
                <p className="text-white font-semibold text-sm break-all">
                  {userData.email}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div
              className="rounded-2xl p-8"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <h3 className="text-xl font-bold text-white mb-6">Edit Profil</h3>
              <ProfileForm user={userData} onUpdated={handleUpdated} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
