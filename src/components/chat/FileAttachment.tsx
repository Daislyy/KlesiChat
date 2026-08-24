import { useState, useEffect } from "react";
import {
  FileText,
  FileCode,
  FileArchive,
  FileSpreadsheet,
  FileAudio,
  FileVideo,
  File,
  Download,
  CheckCheck,
} from "lucide-react";

interface FileAttachmentProps {
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  fileUrl: string;
  isMe: boolean;
  isDark: boolean;
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isFileDownloadedLocally(url: string): boolean {
  try {
    const raw = localStorage.getItem("klesi_downloaded_files");
    if (!raw) return false;
    const list = JSON.parse(raw);
    return Array.isArray(list) && list.includes(url);
  } catch {
    return false;
  }
}

function markFileDownloadedLocally(url: string) {
  try {
    const raw = localStorage.getItem("klesi_downloaded_files");
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(url)) {
      list.push(url);
      // Keep at most 200 items in history
      if (list.length > 200) list.shift();
      localStorage.setItem("klesi_downloaded_files", JSON.stringify(list));
    }
  } catch (err) {
    console.error(err);
  }
}

function getFileMeta(fileName: string = "", fileType: string = "") {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const type = fileType.toLowerCase();

  if (ext === "pdf" || type.includes("pdf")) {
    return {
      icon: <FileText size={20} color="#ef4444" />,
      bg: "rgba(239, 68, 68, 0.12)",
      label: "PDF",
      badgeColor: "#ef4444",
    };
  }
  if (["doc", "docx"].includes(ext) || type.includes("word")) {
    return {
      icon: <FileText size={20} color="#3b82f6" />,
      bg: "rgba(59, 130, 246, 0.12)",
      label: "DOC",
      badgeColor: "#3b82f6",
    };
  }
  if (["xls", "xlsx", "csv"].includes(ext) || type.includes("spreadsheet") || type.includes("csv")) {
    return {
      icon: <FileSpreadsheet size={20} color="#10b981" />,
      bg: "rgba(16, 185, 129, 0.12)",
      label: "XLS",
      badgeColor: "#10b981",
    };
  }
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext) || type.includes("zip") || type.includes("archive")) {
    return {
      icon: <FileArchive size={20} color="#f59e0b" />,
      bg: "rgba(245, 158, 11, 0.12)",
      label: "ZIP",
      badgeColor: "#f59e0b",
    };
  }
  if (["js", "ts", "jsx", "tsx", "html", "css", "py", "json", "sql", "c", "cpp", "java"].includes(ext)) {
    return {
      icon: <FileCode size={20} color="#8b5cf6" />,
      bg: "rgba(139, 92, 246, 0.12)",
      label: ext.toUpperCase(),
      badgeColor: "#8b5cf6",
    };
  }
  if (["mp3", "wav", "ogg", "m4a", "flac"].includes(ext) || type.includes("audio")) {
    return {
      icon: <FileAudio size={20} color="#ec4899" />,
      bg: "rgba(236, 72, 153, 0.12)",
      label: "AUDIO",
      badgeColor: "#ec4899",
    };
  }
  if (["mp4", "mkv", "webm", "mov", "avi"].includes(ext) || type.includes("video")) {
    return {
      icon: <FileVideo size={20} color="#06b6d4" />,
      bg: "rgba(6, 182, 212, 0.12)",
      label: "VIDEO",
      badgeColor: "#06b6d4",
    };
  }

  return {
    icon: <File size={20} color="#8a8a9a" />,
    bg: "rgba(138, 138, 154, 0.12)",
    label: (ext || "FILE").toUpperCase().slice(0, 4),
    badgeColor: "#8a8a9a",
  };
}

export default function FileAttachment({
  fileName = "Berkas",
  fileSize,
  fileType,
  fileUrl,
  isMe,
  isDark,
}: FileAttachmentProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(() => isFileDownloadedLocally(fileUrl));
  const meta = getFileMeta(fileName, fileType);

  useEffect(() => {
    setIsDownloaded(isFileDownloadedLocally(fileUrl));
  }, [fileUrl]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      markFileDownloadedLocally(fileUrl);
      setIsDownloaded(true);
    } catch {
      // Fallback direct link download
      const link = document.createElement("a");
      link.href = fileUrl;
      link.target = "_blank";
      link.download = fileName;
      link.rel = "noopener noreferrer";
      link.click();

      markFileDownloadedLocally(fileUrl);
      setIsDownloaded(true);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        borderRadius: 14,
        background: isMe
          ? isDark
            ? "rgba(0, 0, 0, 0.25)"
            : "rgba(255, 255, 255, 0.15)"
          : isDark
          ? "rgba(255, 255, 255, 0.04)"
          : "rgba(0, 0, 0, 0.03)",
        border: `1px solid ${
          isMe
            ? "rgba(255, 255, 255, 0.15)"
            : isDark
            ? "rgba(255, 255, 255, 0.08)"
            : "rgba(0, 0, 0, 0.06)"
        }`,
        maxWidth: 320,
        minWidth: 220,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {/* File Type Icon */}
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          background: meta.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {meta.icon}
      </div>

      {/* File Details */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: isMe ? "#ffffff" : isDark ? "#f0f0f0" : "#1e1e2e",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: 1.3,
          }}
          title={fileName}
        >
          {fileName}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              padding: "1px 5px",
              borderRadius: 4,
              background: meta.bg,
              color: meta.badgeColor,
              letterSpacing: "0.03em",
            }}
          >
            {meta.label}
          </span>
          <span
            style={{
              fontSize: 11,
              color: isMe ? "rgba(255,255,255,0.7)" : isDark ? "#9ca3af" : "#6b7280",
              fontFamily: "'DM Mono',monospace",
            }}
          >
            {formatFileSize(fileSize)}
          </span>
        </div>
      </div>

      {/* Download Action Button with persistent downloaded indicator */}
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        title={
          isDownloaded
            ? "Sudah diunduh (Klik untuk unduh lagi)"
            : "Unduh berkas"
        }
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          border: isDownloaded
            ? `1px solid rgba(16, 185, 129, 0.4)`
            : "none",
          background: isDownloaded
            ? isDark
              ? "rgba(16, 185, 129, 0.18)"
              : "rgba(16, 185, 129, 0.12)"
            : isMe
            ? "rgba(255, 255, 255, 0.2)"
            : isDark
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.06)",
          color: isDownloaded
            ? "#10b981"
            : isMe
            ? "#ffffff"
            : isDark
            ? "#e2e8f0"
            : "#111827",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: isDownloading ? "wait" : "pointer",
          flexShrink: 0,
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {isDownloading ? (
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              border: "2px solid currentColor",
              borderTop: "2px solid transparent",
              animation: "spin 0.8s linear infinite",
            }}
          />
        ) : isDownloaded ? (
          <CheckCheck size={17} color="#10b981" />
        ) : (
          <Download size={16} />
        )}
      </button>
    </div>
  );
}
