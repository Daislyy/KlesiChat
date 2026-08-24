import { useEffect } from "react";
import { X, Download, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MediaModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
  altText?: string;
}

export default function MediaModal({
  isOpen,
  imageUrl,
  onClose,
  altText = "Gambar",
}: MediaModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        {/* Action buttons header */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
            zIndex: 10000,
          }}
        >
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Buka di tab baru"
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              textDecoration: "none",
              transition: "background-color 0.2s",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <ExternalLink size={16} />
          </a>
          <a
            href={imageUrl}
            download={`klesichat-${Date.now()}`}
            title="Unduh gambar"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              textDecoration: "none",
              transition: "background-color 0.2s",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Download size={16} />
          </a>
          <button
            onClick={onClose}
            title="Tutup"
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              border: "1px solid rgba(255,255,255,0.3)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              transition: "background-color 0.2s",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal content / Image container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: "92vw",
            maxHeight: "88vh",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={imageUrl}
            alt={altText}
            style={{
              maxWidth: "100%",
              maxHeight: "88vh",
              objectFit: "contain",
              borderRadius: 12,
              boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
            }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
