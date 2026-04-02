import React from "react";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";

// Zorvyn text logo
const ZorvynLogo = () => (
  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#10B981] to-[#4EDEA3] flex items-center justify-center font-black text-[#003824] text-lg shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
    Z
  </div>
);

export default function Navbar() {
  const { isDark, toggleTheme, t } = useTheme();
  const navigate = useNavigate();

  return (
    <nav className={`w-full px-6 py-4 ${isDark ? 'bg-[#0B0E13]/95' : 'bg-white/95'} backdrop-blur-xl border-b ${t.border} transition-colors duration-200 fixed top-0 z-50`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div onClick={() => navigate("/")} className="flex items-center space-x-3 cursor-pointer group">
          <ZorvynLogo />
          <span className={`text-xl font-bold ${t.text.primary} tracking-tight`}>Zorvyn</span>
        </div>

        <div className="flex items-center space-x-3">
          <a href="/" className={`text-sm ${t.text.secondary} hover:${t.text.primary} transition-colors hidden md:block`}>Home</a>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${t.text.secondary} ${isDark ? 'hover:bg-[#272A30]' : 'hover:bg-[#F5F5F4]'}`}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-[#FBBF24]" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </nav>
  );
}
