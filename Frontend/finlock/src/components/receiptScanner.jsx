import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from 'react-toastify';
import axios from "../utils/axios";
import { useTheme } from "../context/ThemeContext";

export function ReceiptScanner({ onScanComplete }) {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();

  const handleReceiptScan = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      setLoading(true);
      const res = await axios.post("/api/v1/transaction/scan-receipt", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data) {
        toast.success("Receipt scanned successfully");
        onScanComplete(res.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to scan receipt. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <input
        type="file" ref={fileInputRef} className="hidden"
        accept="image/*" capture="environment"
        onChange={(e) => { const file = e.target.files?.[0]; if (file) handleReceiptScan(file); }}
      />
      <button
        type="button"
        className={`flex items-center justify-center w-full h-10 px-4 rounded-lg text-sm font-medium transition-all duration-200 border
          ${isDark
            ? 'bg-[#191C21] border-[#3C4A42]/40 text-[#4EDEA3] hover:bg-[#272A30]'
            : 'bg-[#F5F5F4] border-[#D1D5DB] text-[#10B981] hover:bg-[#E5E7EB]'
          } disabled:opacity-50`}
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /><span>Scanning Receipt...</span></>
        ) : (
          <><Camera className="w-4 h-4 mr-2" /><span>Scan Receipt with AI</span></>
        )}
      </button>
    </div>
  );
}
