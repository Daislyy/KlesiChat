import { useState } from "react";
import {
  User,
  Mail,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  Camera,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "../lib/supabase";

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
  onBack?: () => void; // Tambahkan prop untuk handle back
}

export default function ProfileForm({ user, onUpdated, onBack }: Props) {
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
        // ✅ FIX: path harus {uid}/namafile agar sesuai RLS policy storage
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tombol Back */}
      <div className="mb-4">
        <button
          type="button"
          onClick={onBack || (() => window.history.back())}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>
      </div>

      {/* Alert sukses */}
      {success && (
        <div
          style={{
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.3)",
          }}
          className="text-green-400 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium"
        >
          <CheckCircle size={18} />
          Profil berhasil diperbarui!
        </div>
      )}

      {/* Alert error */}
      {error && (
        <div
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
          }}
          className="text-red-400 px-4 py-3 rounded-xl text-sm font-medium"
        >
          {error}
        </div>
      )}

      {/* Foto Profil */}
      <div>
        <label className="text-sm font-semibold mb-3 text-white flex items-center gap-2">
          <ImageIcon size={16} className="text-gray-400" />
          Foto Profil
        </label>
        <div className="flex items-center gap-5">
          {/* Preview avatar dengan tombol kamera overlay */}
          <label
            htmlFor="avatar-input"
            className="cursor-pointer group relative shrink-0"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-white/40 transition-all">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                  <User size={28} className="text-gray-400" />
                </div>
              )}
            </div>
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
            <button
              type="button"
              onClick={() => document.getElementById("avatar-input")?.click()}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
              className="text-sm text-gray-200 font-medium px-4 py-2 rounded-lg hover:bg-white/15 transition-all"
            >
              Pilih Foto
            </button>
            <p className="text-xs text-gray-500 mt-2">
              JPG, PNG, atau GIF · Maks. 2MB
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />

      {/* Username */}
      <div>
        <label className="text-sm font-semibold mb-2 text-white flex items-center gap-2">
          <User size={16} className="text-gray-400" />
          Username
        </label>
        <input
          type="text"
          name="username"
          defaultValue={user.username}
          required
          minLength={3}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
          className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder-gray-500 transition-all text-sm"
          placeholder="Masukkan username"
        />
      </div>

      {/* Email */}
      <div>
        <label className="text-sm font-semibold mb-2 text-white flex items-center gap-2">
          <Mail size={16} className="text-gray-400" />
          Email
        </label>
        <input
          type="email"
          name="email"
          defaultValue={user.email}
          required
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
          className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder-gray-500 transition-all text-sm"
          placeholder="Masukkan email"
        />
      </div>

      {/* Tombol aksi */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading
              ? "rgba(255,255,255,0.1)"
              : "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
          className="flex-1 text-white font-semibold py-3 px-6 rounded-xl transition-all hover:bg-white/20 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Menyimpan...
            </>
          ) : (
            "Simpan Perubahan"
          )}
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          disabled={loading}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
          className="px-5 py-3 rounded-xl transition-all hover:bg-white/10 font-semibold text-gray-400 hover:text-gray-200 disabled:opacity-50 text-sm"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
