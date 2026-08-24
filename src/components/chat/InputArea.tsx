import { useRef } from "react";
import { Send, X, Mic, Image as ImageIcon, Paperclip } from "lucide-react";
import type { ChatTheme } from "../../lib/chatTheme";
import { formatDuration } from "../../lib/chatTheme";
import { formatFileSize } from "./FileAttachment";

interface InputAreaProps {
  input: string;
  isRecording: boolean;
  recordingDuration: number;
  isSendingAudio: boolean;
  selectedImage: File | null;
  imagePreviewUrl: string | null;
  isUploadingImage: boolean;
  selectedFile: File | null;
  isUploadingFile: boolean;
  isDark: boolean;
  t: ChatTheme;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onStartRecording: () => void;
  onStopAndSendRecording: () => void;
  onCancelRecording: () => void;
  onSelectImage: (file: File) => void;
  onRemoveImage: () => void;
  onSelectFile: (file: File) => void;
  onRemoveFile: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export default function InputArea({
  input,
  isRecording,
  recordingDuration,
  isSendingAudio,
  selectedImage,
  imagePreviewUrl,
  isUploadingImage,
  selectedFile,
  isUploadingFile,
  isDark,
  t,
  onInputChange,
  onKeyDown,
  onSend,
  onStartRecording,
  onStopAndSendRecording,
  onCancelRecording,
  onSelectImage,
  onRemoveImage,
  onSelectFile,
  onRemoveFile,
  textareaRef,
}: InputAreaProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        alert("Pilih file gambar (JPG, PNG, GIF, WebP, dsb).");
        return;
      }
      onSelectImage(file);
      e.target.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 50 * 1024 * 1024) {
        alert("Ukuran berkas maksimal 50 MB.");
        return;
      }
      onSelectFile(file);
      e.target.value = "";
    }
  };

  return (
    <div
      style={{
        padding: "12px 16px",
        background: t.inputAreaBg,
        borderTop: `1px solid ${t.inputAreaBorder}`,
        flexShrink: 0,
        boxShadow: isDark ? "none" : "0 -1px 0 rgba(0,0,0,0.04)",
      }}
    >
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleImageChange}
      />
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Image Preview Banner */}
      {imagePreviewUrl && (
        <div
          style={{
            marginBottom: 8,
            padding: "8px 12px",
            borderRadius: 14,
            background: isDark ? "rgba(40,40,48,0.9)" : "rgba(240,240,246,0.9)",
            border: `1px solid ${isDark ? "#3f3f4e" : "#e2e2ec"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            maxWidth: 340,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
            <img
              src={imagePreviewUrl}
              alt="Preview"
              style={{
                width: 42,
                height: 42,
                borderRadius: 8,
                objectFit: "cover",
                border: `1px solid ${isDark ? "#4f4f60" : "#d0d0dc"}`,
              }}
            />
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: t.inputColor,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {selectedImage?.name || "Gambar terpilih"}
              </div>
              <div style={{ fontSize: 10, color: isDark ? "#888899" : "#666677" }}>
                {selectedImage
                  ? `${(selectedImage.size / 1024).toFixed(1)} KB`
                  : "Siap dikirim"}
              </div>
            </div>
          </div>
          <button
            onClick={onRemoveImage}
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              border: "none",
              background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
              color: isDark ? "#bbb" : "#555",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Batal kirim gambar"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Generic File Preview Banner */}
      {selectedFile && (
        <div
          style={{
            marginBottom: 8,
            padding: "8px 12px",
            borderRadius: 14,
            background: isDark ? "rgba(40,40,48,0.9)" : "rgba(240,240,246,0.9)",
            border: `1px solid ${isDark ? "#3f3f4e" : "#e2e2ec"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            maxWidth: 340,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                background: isDark ? "rgba(139,92,246,0.2)" : "rgba(124,58,237,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Paperclip size={18} color={isDark ? "#a78bfa" : "#7c3aed"} />
            </div>
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: t.inputColor,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {selectedFile.name}
              </div>
              <div style={{ fontSize: 10, color: isDark ? "#888899" : "#666677" }}>
                {formatFileSize(selectedFile.size)} • Siap dikirim
              </div>
            </div>
          </div>
          <button
            onClick={onRemoveFile}
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              border: "none",
              background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
              color: isDark ? "#bbb" : "#555",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Batal kirim berkas"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div
        className="input-wrap"
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          borderRadius: 16,
          padding: "8px 8px 8px 12px",
          background: t.inputWrapBg,
          border: `1px solid ${isRecording ? "#ef4444" : t.inputWrapBorder}`,
        }}
      >
        {isRecording ? (
          <RecordingMode
            recordingDuration={recordingDuration}
            isDark={isDark}
            t={t}
            onCancel={onCancelRecording}
            onSend={onStopAndSendRecording}
          />
        ) : (
          <NormalMode
            input={input}
            isSendingAudio={isSendingAudio}
            hasAttachment={!!selectedImage || !!selectedFile}
            isUploading={isUploadingImage || isUploadingFile}
            hasImage={!!selectedImage}
            hasFile={!!selectedFile}
            isDark={isDark}
            t={t}
            textareaRef={textareaRef}
            onInputChange={onInputChange}
            onKeyDown={onKeyDown}
            onSend={onSend}
            onStartRecording={onStartRecording}
            onOpenImagePicker={() => imageInputRef.current?.click()}
            onOpenFilePicker={() => fileInputRef.current?.click()}
          />
        )}
      </div>

      <p
        style={{
          fontSize: 10,
          color: t.creditColor,
          marginTop: 6,
          paddingLeft: 4,
          fontFamily: "'DM Mono',monospace",
        }}
      >
        Deslyy : Mff kalo masih banyak Bug :))))
      </p>
    </div>
  );
}

// Recording mode
interface RecordingModeProps {
  recordingDuration: number;
  isDark: boolean;
  t: ChatTheme;
  onCancel: () => void;
  onSend: () => void;
}

function RecordingMode({
  recordingDuration,
  isDark,
  t,
  onCancel,
  onSend,
}: RecordingModeProps) {
  return (
    <>
      <button
        onClick={onCancel}
        style={{
          flexShrink: 0,
          width: 32,
          height: 32,
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        title="Batalkan rekaman"
      >
        <X size={15} color={isDark ? "#6b7280" : "#9ca3af"} />
      </button>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 0",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#ef4444",
            flexShrink: 0,
            animation: "recPulse 1s ease-in-out infinite",
          }}
        />
        <span
          style={{
            fontSize: 13,
            color: isDark ? "#e2e8f0" : "#111827",
            fontFamily: "'DM Mono',monospace",
            letterSpacing: "0.05em",
          }}
        >
          {formatDuration(recordingDuration)}
        </span>
        <span style={{ fontSize: 12, color: isDark ? "#4b5563" : "#9ca3af" }}>
          Merekam...
        </span>
      </div>

      <button
        onClick={onSend}
        className="mic-btn is-recording"
        style={{
          flexShrink: 0,
          width: 36,
          height: 36,
          borderRadius: 10,
          background: t.micActiveBg,
          boxShadow: t.micActiveShadow,
        }}
        title="Kirim pesan suara"
      >
        <Send size={14} color="#fff" />
      </button>
    </>
  );
}

// Normal mode
interface NormalModeProps {
  input: string;
  isSendingAudio: boolean;
  hasAttachment: boolean;
  isUploading: boolean;
  hasImage: boolean;
  hasFile: boolean;
  isDark: boolean;
  t: ChatTheme;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onStartRecording: () => void;
  onOpenImagePicker: () => void;
  onOpenFilePicker: () => void;
}

function NormalMode({
  input,
  isSendingAudio,
  hasAttachment,
  isUploading,
  hasImage,
  hasFile,
  isDark,
  t,
  textareaRef,
  onInputChange,
  onKeyDown,
  onSend,
  onStartRecording,
  onOpenImagePicker,
  onOpenFilePicker,
}: NormalModeProps) {
  const canSend = (input.trim().length > 0 || hasAttachment) && !isUploading;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <button
          type="button"
          onClick={onOpenImagePicker}
          disabled={isUploading || isSendingAudio}
          style={{
            flexShrink: 0,
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "none",
            background: hasImage
              ? isDark
                ? "rgba(139,92,246,0.25)"
                : "rgba(124,58,237,0.15)"
              : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
            color: hasImage
              ? isDark
                ? "#a78bfa"
                : "#7c3aed"
              : isDark
              ? "#8a8a9a"
              : "#6b7280",
          }}
          title="Kirim gambar"
        >
          <ImageIcon size={16} />
        </button>

        <button
          type="button"
          onClick={onOpenFilePicker}
          disabled={isUploading || isSendingAudio}
          style={{
            flexShrink: 0,
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "none",
            background: hasFile
              ? isDark
                ? "rgba(139,92,246,0.25)"
                : "rgba(124,58,237,0.15)"
              : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
            color: hasFile
              ? isDark
                ? "#a78bfa"
                : "#7c3aed"
              : isDark
              ? "#8a8a9a"
              : "#6b7280",
          }}
          title="Kirim berkas dokumen / file"
        >
          <Paperclip size={16} />
        </button>
      </div>

      <textarea
        ref={textareaRef}
        value={input}
        onChange={onInputChange}
        onKeyDown={onKeyDown}
        placeholder={
          hasImage
            ? "Tambah keterangan gambar..."
            : hasFile
            ? "Tambah keterangan berkas..."
            : "Ketik aja sob..."
        }
        rows={1}
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          color: t.inputColor,
          fontSize: 13,
          resize: "none",
          padding: "6px 0 6px 4px",
          maxHeight: 120,
          caretColor: t.inputCaret,
          fontFamily: "'DM Sans',sans-serif",
          lineHeight: 1.6,
        }}
      />

      <button
        type="button"
        onClick={onStartRecording}
        disabled={isSendingAudio || hasAttachment}
        className="mic-btn"
        style={{
          flexShrink: 0,
          width: 36,
          height: 36,
          borderRadius: 12,
          background: t.micBtnBg,
          border: `1px solid ${t.micBtnBorder}`,
          opacity: isSendingAudio || hasAttachment ? 0.5 : 1,
        }}
        title="Rekam pesan suara"
      >
        {isSendingAudio ? (
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              border: `2px solid ${t.micBtnColor}33`,
              borderTop: `2px solid ${t.micBtnColor}`,
              animation: "spin 0.8s linear infinite",
            }}
          />
        ) : (
          <Mic size={15} color={t.micBtnColor} />
        )}
      </button>

      <button
        type="button"
        onClick={onSend}
        disabled={!canSend}
        className="send-btn"
        style={{
          flexShrink: 0,
          width: 36,
          height: 36,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: canSend ? t.sendBtnActiveBg : t.sendBtnInactiveBg,
          boxShadow: canSend ? t.sendBtnActiveShadow : "none",
          opacity: canSend ? 1 : 0.4,
          cursor: canSend ? "pointer" : "default",
        }}
      >
        {isUploading ? (
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              border: "2px solid #fff",
              borderTop: "2px solid transparent",
              animation: "spin 0.8s linear infinite",
            }}
          />
        ) : (
          <Send
            size={14}
            color={canSend ? "#fff" : isDark ? "#4b5563" : "#9ca3af"}
          />
        )}
      </button>
    </>
  );
}