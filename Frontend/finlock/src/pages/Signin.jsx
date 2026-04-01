import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/InitialNavbar';
import axios from "../utils/axios";
import { toast } from 'react-toastify';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/Finlocklogo.png';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const { isDark, t } = useTheme();
  const { setUser, user, checkingAuth } = useAuth();

  useEffect(() => {
    if (!checkingAuth && user) navigate("/dashboard");
  }, [checkingAuth, user, navigate]);

  const handleSubmit = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    setLoading(true);
    setShowResend(false);
    try {
      const response = await axios.post("/api/v1/users/login", { email, password }, { withCredentials: true });
      setUser(response.data.data.user);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      if (error.response?.status === 404) {
        toast.info("Email not registered. Redirecting to Sign Up...");
        navigate("/register");
      } else if (error.response?.status === 403) {
        // Email not verified
        setUnverifiedEmail(email);
        setShowResend(true);
        toast.warning("Please verify your email first.");
      } else if (error.response?.status === 401) {
        toast.error("Incorrect password. Please try again.");
      } else {
        toast.error("Login failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      await axios.post("/api/v1/users/resend-verification", { email: unverifiedEmail });
      toast.success("Verification email sent! Check your inbox.");
      setShowResend(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend. Try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    try {
      const response = await axios.post("/api/v1/users/guest-login", {}, { withCredentials: true });
      setUser(response.data.data.user);
      toast.success("Welcome! Exploring as a guest.");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Guest login unavailable right now. Please try again.");
    } finally {
      setGuestLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (user) toast.success("Already Signed in");
    window.location.href = "https://finlock-backend-oo7z.onrender.com/api/v1/auth/google";
  };

  return (
    <>
      <Navbar />
      <div className={`min-h-screen ${t.background} pt-28 relative`}>
        <div className="relative z-10 flex justify-center items-center px-4">
          <div className="w-full max-w-md animate-fade-in-up">
            <div className={`${t.card} backdrop-blur-xl rounded-2xl p-8 shadow-lg border`}>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#10B981] to-[#4EDEA3] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-md">
                  <img src={logo} alt="Finlock" className="h-8 w-8" />
                </div>
                <h1 className={`${t.text.primary} text-2xl font-bold mb-2 tracking-tight`}>Sign In</h1>
                <p className={`${t.text.secondary} text-sm`}>Welcome back! Please login to your account.</p>
              </div>

              {/* ============ GUEST LOGIN — HERO BUTTON ============ */}
              <button
                onClick={handleGuestLogin}
                disabled={guestLoading}
                id="guest-login-button"
                className={`w-full mb-3 font-bold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-md border-2 border-[#10B981] disabled:opacity-50 text-base
                  ${isDark
                    ? 'bg-gradient-to-r from-[#10B981]/20 to-[#4EDEA3]/10 hover:from-[#10B981]/30 hover:to-[#4EDEA3]/20 text-[#4EDEA3] hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                    : 'bg-gradient-to-r from-[#F0FDF4] to-[#DCFCE7] hover:from-[#DCFCE7] hover:to-[#BBF7D0] text-[#059669] hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]'
                  }`}
              >
                {guestLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Loading Demo...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    🚀 Login as Guest
                  </span>
                )}
              </button>
              <p className={`text-center ${t.text.muted} text-xs mb-6`}>
                Explore with pre-populated demo data — no signup needed
              </p>

              {/* ============ DIVIDER ============ */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${t.border}`} />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`px-2 ${isDark ? 'bg-[#1D2025]' : 'bg-white'} ${t.text.secondary}`}>or sign in with email</span>
                </div>
              </div>

              {/* ============ EMAIL VERIFICATION BANNER ============ */}
              {showResend && (
                <div className={`mb-5 p-4 rounded-xl border ${isDark ? 'bg-[#422006]/30 border-[#F59E0B]/30' : 'bg-[#FFFBEB] border-[#FCD34D]'}`}>
                  <p className={`text-sm font-medium mb-2 ${isDark ? 'text-[#FCD34D]' : 'text-[#92400E]'}`}>
                    ⚠️ Email not verified
                  </p>
                  <p className={`text-xs mb-3 ${isDark ? 'text-[#FDE68A]/70' : 'text-[#92400E]/70'}`}>
                    Check your inbox for the verification link, or request a new one.
                  </p>
                  <button
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="w-full bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-[#78350F] font-semibold py-2 px-4 rounded-lg text-sm transition-all duration-200 disabled:opacity-50"
                  >
                    {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                </div>
              )}

              {/* Form */}
              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className={`block ${t.text.primary} text-sm font-medium mb-2`}>Email</label>
                  <input
                    type="email" id="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-3 ${t.input} rounded-xl focus:outline-none focus:ring-2 transition-all duration-200`}
                    placeholder="Enter your email" required
                  />
                </div>

                <div>
                  <label htmlFor="password" className={`block ${t.text.primary} text-sm font-medium mb-2`}>Password</label>
                  <input
                    type="password" id="password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-3 ${t.input} rounded-xl focus:outline-none focus:ring-2 transition-all duration-200`}
                    placeholder="Enter your password" required
                  />
                </div>

                <div className="text-right">
                  <button className="text-sm text-[#4EDEA3] hover:text-[#10B981] hover:underline transition-colors duration-200">Forgot password?</button>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#10B981] to-[#4EDEA3] hover:from-[#059669] hover:to-[#10B981] text-[#003824] font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm disabled:opacity-50"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : 'Login'}
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className={`w-full border-t ${t.border}`} />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className={`px-2 ${isDark ? 'bg-[#1D2025]' : 'bg-white'} ${t.text.secondary}`}>or</span>
                  </div>
                </div>

                {/* Google Login */}
                <button
                  onClick={handleGoogleLogin}
                  className={`w-full font-medium py-2.5 px-4 rounded-xl border transition-colors duration-200 text-sm
                    ${isDark ? 'bg-[#1D2025] hover:bg-[#272A30] text-[#E1E2EA] border-[#3C4A42]/40' : 'bg-white hover:bg-[#F5F5F4] text-[#111827] border-[#D1D5DB]'}`}
                >
                  Login with Google
                </button>

                {/* Sign Up Redirect */}
                <div className="text-center">
                  <p className={`${t.text.secondary} text-sm`}>
                    Don't have an account?{' '}
                    <button onClick={() => navigate("/register")} className="text-[#4EDEA3] hover:text-[#10B981] font-medium hover:underline transition-colors duration-200">
                      Sign Up
                    </button>
                  </p>
                </div>

                <div className={`mt-8 pt-6 border-t ${t.border}`}>
                  <p className={`text-center ${t.text.muted} text-xs`}>
                    By signing in, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
