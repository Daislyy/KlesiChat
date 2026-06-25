import { useState } from "react";
import {
  User,
  Mail,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  Camera,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

interface UserData {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  role?: string;
  created_at?: string;
}

interface Props {
  user: UserData;
  onUpdated?: (updated: Partial<UserData>) => void;
  onBack?: () => void;
  isDark?: boolean;
}

export default function ProfileForm({ user, onUpdated, onBack, isDark = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(user.avatar_url || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Ukuran file maksimal 2MB");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const form = e.currentTarget;
      const username = (
        form.elements.namedItem("username") as HTMLInputElement
      ).value.trim();
      const email = (
        form.elements.namedItem("email") as HTMLInputElement
      ).value.trim();

      let avatar_url = user.avatar_url || "";

      // Upload avatar jika ada file baru
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const filePath = `${user.id}/avatar.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);
        avatar_url = urlData.publicUrl;
      }

      // Update tabel profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ username, avatar_url })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update email di auth jika berubah
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email });
        if (emailError) throw emailError;
      }

      setSuccess(true);
      onUpdated?.({ username, avatar_url, email });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Gagal update profil: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const t = {
    textColor: isDark ? "text-white" : "text-gray-900",
    subColor: isDark ? "text-gray-400" : "text-gray-500",
    inputBg: isDark ? "rgba(255,255,255,0.06)" : "#f9fafb",
    inputBorder: isDark ? "rgba(255,255,255,0.12)" : "#d1d5db",
    inputFocusBorder: isDark ? "focus:ring-white/30" : "focus:ring-indigo-500/30 focus:border-indigo-500",
    inputTextColor: isDark ? "text-white" : "text-gray-900",
    divider: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tombol Back */}
      <div className="mb-4">
        <motion.button
          type="button"
          onClick={onBack || (() => window.history.back())}
          style={{
            background: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#d1d5db"}`,
          }}
          whileHover={{ scale: 1.02, background: isDark ? "rgba(255,255,255,0.1)" : "#f3f4f6" }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isDark ? "text-gray-300" : "text-gray-700"} transition-colors text-sm font-medium shadow-sm`}
        >
          <ArrowLeft size={16} />
          Kembali
        </motion.button>
      </div>

      {/* Alert sukses */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            style={{
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.3)",
            }}
            className="text-green-500 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium overflow-hidden"
          >
            <CheckCircle size={18} className="shrink-0" />
            Profil berhasil diperbarui!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
            }}
            className="text-red-500 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium overflow-hidden"
          >
            <AlertCircle size={18} className="shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Foto Profil */}
      <div>
        <label className={`text-sm font-semibold mb-3 ${t.textColor} flex items-center gap-2`}>
          <ImageIcon size={16} className={t.subColor} />
          Foto Profil
        </label>
        <div className="flex items-center gap-5">
          {/* Preview avatar dengan tombol kamera overlay */}
          <label
            htmlFor="avatar-input"
            className="cursor-pointer group relative shrink-0"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-20 h-20 rounded-full overflow-hidden border-2 group-hover:border-indigo-500/50 transition-colors"
              style={{ borderColor: isDark ? "rgba(255,255,255,0.2)" : "#d1d5db" }}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full ${isDark ? "bg-white/10" : "bg-gray-100"} flex items-center justify-center`}>
                  <User size={28} className={t.subColor} />
                </div>
              )}
            </motion.div>
            {/* Overlay kamera */}
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={18} className="text-white" />
            </div>
          </label>

          <div className="flex-1">
            <input
              id="avatar-input"
              type="file"
              name="avatar"
              accept="image/jpg,image/jpeg,image/png,image/gif"
              onChange={handleImageChange}
              className="hidden"
            />
            <motion.button
              type="button"
              onClick={() => document.getElementById("avatar-input")?.click()}
              style={{
                background: isDark ? "rgba(255,255,255,0.08)" : "#ffffff",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "#d1d5db"}`,
              }}
              whileHover={{ scale: 1.02, background: isDark ? "rgba(255,255,255,0.12)" : "#f9fafb" }}
              whileTap={{ scale: 0.98 }}
              className={`text-sm ${isDark ? "text-gray-200" : "text-gray-700"} font-medium px-4 py-2 rounded-lg transition-colors shadow-sm`}
            >
              Pilih Foto
            </motion.button>
            <p className={`text-xs ${t.subColor} mt-2`}>
              JPG, PNG, atau GIF · Maks. 2MB
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: `1px solid ${t.divider}` }} />

      {/* Username */}
      <div>
        <label className={`text-sm font-semibold mb-2 ${t.textColor} flex items-center gap-2`}>
          <User size={16} className={t.subColor} />
          Username
        </label>
        <input
          type="text"
          name="username"
          defaultValue={user.username}
          required
          minLength={3}
          style={{
            background: t.inputBg,
            border: `1px solid ${t.inputBorder}`,
          }}
          className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 ${t.inputFocusBorder} ${t.inputTextColor} placeholder-gray-500 transition-all text-sm`}
          placeholder="Masukkan username"
        />
      </div>

      {/* Email */}
      <div>
        <label className={`text-sm font-semibold mb-2 ${t.textColor} flex items-center gap-2`}>
          <Mail size={16} className={t.subColor} />
          Email
        </label>
        <input
          type="email"
          name="email"
          defaultValue={user.email}
          required
          style={{
            background: t.inputBg,
            border: `1px solid ${t.inputBorder}`,
          }}
          className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 ${t.inputFocusBorder} ${t.inputTextColor} placeholder-gray-500 transition-all text-sm`}
          placeholder="Masukkan email"
        />
      </div>

      {/* Tombol aksi */}
      <div className="flex gap-3 pt-1">
        <motion.button
          type="submit"
          disabled={loading}
          style={{
            background: isDark 
              ? "rgba(255,255,255,0.15)" 
              : "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
            border: isDark ? "1px solid rgba(255,255,255,0.2)" : "none",
          }}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="flex-1 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-md"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Menyimpan...
            </>
          ) : (
            "Simpan Perubahan"
          )}
        </motion.button>
        <motion.button
          type="button"
          onClick={() => window.location.reload()}
          disabled={loading}
          style={{
            background: isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#d1d5db"}`,
          }}
          whileHover={{ scale: loading ? 1 : 1.02, background: isDark ? "rgba(255,255,255,0.08)" : "#f9fafb" }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className={`px-5 py-3 rounded-xl transition-all font-semibold ${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-800"} disabled:opacity-50 text-sm`}
        >
          Batal
        </motion.button>
      </div>
    </form>
  );
}
