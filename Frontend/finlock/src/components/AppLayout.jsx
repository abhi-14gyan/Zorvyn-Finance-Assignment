import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import axios from '../utils/axios';
import {
  LayoutGrid, LogOut, Sun, Moon, Menu, X,
  User, ArrowLeftRight, Shield,
} from 'lucide-react';
import logo from '../assets/Finlocklogo.png';
import UsernameCard from './UsernameCard';

const ROLE_BADGE = {
  admin: { label: 'Admin', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  analyst: { label: 'Analyst', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  viewer: { label: 'Viewer', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuth();
  const { isDark, toggleTheme, t } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Build nav items dynamically based on role
  const navItems = [
    { icon: LayoutGrid, label: 'Dashboard', path: '/dashboard' },
    // Only show Add Transaction for admin
    ...(isAdmin ? [{ icon: ArrowLeftRight, label: 'Add Transaction', path: '/transaction' }] : []),
    // Admin panel link
    ...(isAdmin ? [{ icon: Shield, label: 'Admin Panel', path: '/admin' }] : []),
  ];

  const handleLogout = async () => {
    try {
      const res = await axios.post("/api/v1/users/logout", {}, {
        withCredentials: true,
      });
      if (res.status === 200) {
        setUser(null);
        toast.success(res.data?.message || "Logout successful");
        navigate("/");
      }
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const roleBadge = ROLE_BADGE[user?.role] || ROLE_BADGE.viewer;

  return (
    <div className={`min-h-screen ${t.background} flex transition-colors duration-200`}>
      {/* ── Desktop Sidebar ── */}
      <aside className={`hidden lg:flex flex-col w-[72px] ${t.sidebar} border-r ${t.border} fixed h-full z-30`}>
        {/* Logo */}
        <div
          className="flex items-center justify-center h-[72px] cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="Zorvyn" className="h-9 w-9" />
        </div>

        {/* Nav Items */}
        <nav className="flex-1 flex flex-col items-center pt-4 gap-1">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path, item.path === '/transaction' ? { state: { from: location.pathname } } : undefined)}
                className={`group relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200
                  ${active
                    ? item.path === '/admin'
                      ? 'bg-purple-500/15 text-purple-400'
                      : 'bg-[#10B981]/15 text-[#4EDEA3]'
                    : `${t.text.secondary} hover:bg-[#272A30] hover:text-[#E1E2EA]`
                  }`}
                title={item.label}
              >
                <item.icon className="w-5 h-5" />
                {/* Active indicator */}
                {active && (
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 ${item.path === '/admin' ? 'bg-purple-400' : 'bg-[#4EDEA3]'} rounded-r-full`} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="flex flex-col items-center gap-1 pb-4">
          {/* Role Badge */}
          <div className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider border ${roleBadge.color} mb-2`}>
            {roleBadge.label}
          </div>

          <button
            onClick={toggleTheme}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${t.text.secondary} hover:bg-[#272A30]`}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? <Sun className="w-5 h-5 text-[#FBBF24]" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={handleLogout}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${t.text.secondary} hover:bg-[#272A30] hover:text-[#FFB3AF]`}
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>

          {/* User Avatar */}
          <button
            onClick={() => setShowDropdown(true)}
            className="w-10 h-10 rounded-full overflow-hidden mt-2 ring-2 ring-transparent hover:ring-[#4EDEA3]/40 transition-all duration-200"
          >
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt="Avatar"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#10B981] to-[#4EDEA3] flex items-center justify-center">
                <User className="w-5 h-5 text-[#003824]" />
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-30 ${t.sidebar} border-b ${t.border} backdrop-blur-xl`}>
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <img src={logo} alt="Zorvyn" className="h-7 w-7" />
            <span className={`text-lg font-semibold ${t.text.primary}`}>Zorvyn</span>
            {/* Mobile role badge */}
            <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-semibold uppercase tracking-wider border ${roleBadge.color}`}>
              {roleBadge.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${t.text.secondary}`}
            >
              {isDark ? <Sun className="w-4 h-4 text-[#FBBF24]" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${t.text.secondary}`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className={`px-4 pb-4 space-y-1 border-t ${t.border}`}>
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path, item.path === '/transaction' ? { state: { from: location.pathname } } : undefined);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${active
                      ? item.path === '/admin'
                        ? 'bg-purple-500/15 text-purple-400'
                        : 'bg-[#10B981]/15 text-[#4EDEA3]'
                      : `${t.text.secondary} hover:bg-[#272A30] hover:text-[#E1E2EA]`
                    }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
            <button
              onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${t.text.secondary} hover:bg-[#272A30] hover:text-[#FFB3AF]`}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>

      {/* ── User Profile Overlay ── */}
      {showDropdown && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end items-start z-50 p-6" onClick={() => setShowDropdown(false)}>
          <div className="mt-12 mr-4" onClick={(e) => e.stopPropagation()}>
            <UsernameCard onClose={() => setShowDropdown(false)} />
          </div>
        </div>
      )}

      {/* ── Main Content (offset for sidebar/topbar) ── */}
      <main className="flex-1 lg:ml-[72px] pt-14 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
