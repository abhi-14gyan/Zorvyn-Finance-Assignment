import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";

const ZorvynLogo = () => (
  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#10B981] to-[#4EDEA3] flex items-center justify-center font-black text-[#003824] text-lg shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
    Z
  </div>
);

export default function LandingNav() {
  const { user } = useAuth();
  const { isDark, toggleTheme, t } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className={`w-full px-6 py-4 ${isDark ? 'bg-[#0B0E13]/95' : 'bg-white/95'} backdrop-blur-xl border-b ${t.border} transition-colors duration-200 sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div onClick={() => navigate("/")} className="flex items-center space-x-3 cursor-pointer group">
          <ZorvynLogo />
          <span className={`text-xl font-bold ${t.text.primary} tracking-tight`}>Zorvyn</span>
        </div>

        <div className="hidden md:flex items-center space-x-3">
          <button onClick={toggleTheme} className={`p-2 rounded-lg transition-colors ${t.text.secondary} ${isDark ? 'hover:bg-[#272A30]' : 'hover:bg-[#F5F5F4]'}`}>
            {isDark ? <Sun className="w-4 h-4 text-[#FBBF24]" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => navigate(user ? "/dashboard" : "/signin")}
            className="px-5 py-2 bg-gradient-to-r from-[#10B981] to-[#4EDEA3] text-[#003824] font-semibold rounded-xl hover:from-[#059669] hover:to-[#10B981] transition-all duration-200 text-sm shadow-sm"
          >
            {user ? "Dashboard" : "Login"}
          </button>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <button onClick={toggleTheme} className={`p-2 rounded-lg ${t.text.secondary}`}>
            {isDark ? <Sun className="w-4 h-4 text-[#FBBF24]" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`p-2 rounded-lg ${isDark ? 'bg-[#272A30]' : 'bg-[#F5F5F4]'}`}>
            {mobileMenuOpen ? <X className={`w-5 h-5 ${t.text.primary}`} /> : <Menu className={`w-5 h-5 ${t.text.primary}`} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mt-4 md:hidden px-4 pb-4">
          <button
            onClick={() => { navigate(user ? "/dashboard" : "/signin"); setMobileMenuOpen(false); }}
            className="w-full px-5 py-2.5 bg-gradient-to-r from-[#10B981] to-[#4EDEA3] text-[#003824] font-semibold rounded-xl text-sm"
          >
            {user ? "Dashboard" : "Login"}
          </button>
        </div>
      )}
    </nav>
  );
}
