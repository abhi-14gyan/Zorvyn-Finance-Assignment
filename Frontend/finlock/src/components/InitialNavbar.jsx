import React from "react";
import logo from "../assets/Finlocklogo.png";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";

export default function Navbar() {
  const { isDark, toggleTheme, t } = useTheme();
  const navigate = useNavigate();

  return (
    <nav className={`w-full px-6 py-4 ${isDark ? 'bg-[#0B0E13]/95' : 'bg-white/95'} backdrop-blur-xl border-b ${t.border} transition-colors duration-200 fixed top-0 z-50`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div onClick={() => navigate("/")} className="flex items-center space-x-3 cursor-pointer group">
          <img src={logo} alt="Finlock Logo" className="h-9 w-9 group-hover:scale-105 transition-transform" />
          <span className={`text-xl font-bold ${t.text.primary} tracking-tight`}>Finlock</span>
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
