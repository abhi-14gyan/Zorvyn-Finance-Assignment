import { useState } from "react";
import axios from "../utils/axios";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function UsernameCard({ onClose }) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { isDark, t } = useTheme();

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await axios.put("/api/v1/users/update-username", { username }, { withCredentials: true });
      toast.success("Username updated!");
      onClose();
      navigate("/dashboard");
      setTimeout(() => window.location.reload(), 300);
    } catch (error) {
      setMessage("Failed to update username");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-6 rounded-xl shadow-xl w-96 border ${isDark ? 'bg-[#1D2025] border-[#3C4A42]/20' : 'bg-white border-[#E5E7EB]'}`}>
      <h2 className={`text-lg font-semibold ${t.text.primary} mb-4`}>Edit Username</h2>
      <input
        type="text"
        placeholder="Enter new username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className={`w-full px-3 py-2.5 rounded-lg text-sm border mb-4 transition-all duration-200 ${t.input}`}
      />
      <div className="flex justify-between items-center">
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="bg-gradient-to-r from-[#10B981] to-[#4EDEA3] text-[#003824] font-semibold px-4 py-2 rounded-xl text-sm hover:from-[#059669] hover:to-[#10B981] transition-all disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update"}
        </button>
        <button onClick={onClose} className={`text-sm ${t.text.muted} hover:underline`}>Cancel</button>
      </div>
      {message && <p className="mt-4 text-sm text-[#FFB3AF]">{message}</p>}
    </div>
  );
}
