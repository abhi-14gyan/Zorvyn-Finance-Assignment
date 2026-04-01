import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/InitialNavbar';
import axios from "../utils/axios";
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';


export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { isDark, t } = useTheme();
  const [formData, setFormData] = useState({ username: '', email: '', password: '', image: null });
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();
  const { user, setUser, checkingAuth } = useAuth();

  useEffect(() => {
    if (!checkingAuth && user) {
      toast.success("Already Logged In!");
      navigate("/dashboard");
    }
  }, [checkingAuth, user, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    const { username, email, password, image } = formData;
    if (!username || !email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      data.append("username", username);
      data.append("email", email);
      data.append("password", password);
      if (image) data.append("imageUrl", image);
      await axios.post("/api/v1/users/register", data, { headers: { "Content-Type": "multipart/form-data" } });
      setRegisteredEmail(email);
      setRegistrationSuccess(true);
      toast.success("Registration successful! Check your email for verification.");
    } catch (error) {
      if (error.response?.status === 409) { toast.error("Email already registered. Please login."); navigate("/signin"); }
      else if (error.response?.status === 400) toast.error("Invalid data. Please check your inputs.");
      else toast.error("Registration failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    setResendLoading(true);
    try {
      await axios.post("/api/v1/users/resend-verification", { email: registeredEmail });
      toast.success("Verification email sent!");
      setResendCooldown(120); // 2 minute cooldown
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
    window.location.href = `${process.env.REACT_APP_BACKEND_URL || ''}/api/v1/auth/google`;
  };

  // ===== SUCCESS STATE: Show "Check your email" =====
  if (registrationSuccess) {
    return (
      <div className={`min-h-screen ${t.background} relative`}>
        <Navbar />
        <div className="relative z-10 flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="w-full max-w-md animate-fade-in-up">
            <div className={`${t.card} backdrop-blur-xl rounded-2xl p-8 shadow-lg border text-center`}>
              {/* Success Icon */}
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#10B981] to-[#4EDEA3] rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              <h1 className={`${t.text.primary} text-2xl font-bold mb-2 tracking-tight`}>Check Your Email ✉️</h1>
              <p className={`${t.text.secondary} text-sm mb-2`}>
                We've sent a verification link to:
              </p>
              <p className="text-[#10B981] font-semibold text-sm mb-6">{registeredEmail}</p>

              <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-[#272A30]' : 'bg-[#F0FDF4]'}`}>
                <p className={`${t.text.secondary} text-xs leading-relaxed`}>
                  Click the link in the email to verify your account. The link expires in 24 hours. 
                  Check your spam folder if you don't see it.
                </p>
              </div>

              <button
                onClick={handleResendVerification}
                disabled={resendLoading || resendCooldown > 0}
                className="w-full bg-gradient-to-r from-[#10B981] to-[#4EDEA3] hover:from-[#059669] hover:to-[#10B981] text-[#003824] font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm disabled:opacity-50 mb-3"
              >
                {resendLoading ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Verification Email'}
              </button>

              <button
                onClick={() => navigate("/signin")}
                className={`w-full font-medium py-2.5 px-4 rounded-xl border transition-colors duration-200 text-sm
                  ${isDark ? 'bg-[#1D2025] hover:bg-[#272A30] text-[#E1E2EA] border-[#3C4A42]/40' : 'bg-white hover:bg-[#F5F5F4] text-[#111827] border-[#D1D5DB]'}`}
              >
                Go to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== NORMAL STATE: Registration Form =====
  return (
    <div className={`min-h-screen ${t.background} relative`}>
      <Navbar />

      <div className="relative z-10 flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className={`${t.card} backdrop-blur-xl rounded-2xl p-8 shadow-lg border`}>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-[#10B981] to-[#4EDEA3] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-md">
                <span className="text-2xl font-black text-[#003824]">Z</span>
              </div>
              <h1 className={`${t.text.primary} text-2xl font-bold mb-2 tracking-tight`}>Create Account</h1>
              <p className={`${t.text.secondary} text-sm`}>Join us today and start your journey</p>
            </div>

            {/* Guest Login — Prominent */}
            <button
              onClick={handleGuestLogin}
              disabled={guestLoading}
              id="guest-login-register"
              className={`w-full mb-6 font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm border-2 border-[#10B981] disabled:opacity-50
                ${isDark
                  ? 'bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#4EDEA3]'
                  : 'bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#059669]'
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
                  🚀 Explore as Guest
                </span>
              )}
            </button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${t.border}`} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${isDark ? 'bg-[#1D2025]' : 'bg-white'} ${t.text.secondary}`}>or create an account</span>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {/* Image Upload */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#10B981] to-[#4EDEA3] p-[2px] mx-auto mb-3 shadow-md">
                    <div className={`w-full h-full rounded-full ${isDark ? 'bg-[#272A30]' : 'bg-[#F5F5F4]'} flex items-center justify-center overflow-hidden`}>
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <svg className={`w-8 h-8 ${t.text.secondary}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
                <p className={`${t.text.muted} text-xs`}>Click to upload profile picture (optional)</p>
              </div>

              <div>
                <label htmlFor="username" className={`block ${t.text.primary} text-sm font-medium mb-2`}>Username *</label>
                <input
                  type="text" id="username" name="username" value={formData.username} onChange={handleInputChange}
                  className={`w-full px-4 py-3 ${t.input} rounded-xl focus:outline-none focus:ring-2 transition-all duration-200`}
                  placeholder="Enter your username" required
                />
              </div>

              <div>
                <label htmlFor="email" className={`block ${t.text.primary} text-sm font-medium mb-2`}>Email Address *</label>
                <input
                  type="email" id="email" name="email" value={formData.email} onChange={handleInputChange}
                  className={`w-full px-4 py-3 ${t.input} rounded-xl focus:outline-none focus:ring-2 transition-all duration-200`}
                  placeholder="Enter your email" required
                />
              </div>

              <div>
                <label htmlFor="password" className={`block ${t.text.primary} text-sm font-medium mb-2`}>Password *</label>
                <input
                  type="password" id="password" name="password" value={formData.password} onChange={handleInputChange}
                  className={`w-full px-4 py-3 ${t.input} rounded-xl focus:outline-none focus:ring-2 transition-all duration-200`}
                  placeholder="Create a strong password" required
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#10B981] to-[#4EDEA3] hover:from-[#059669] hover:to-[#10B981] text-[#003824] font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Account'}
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

              <button
                onClick={handleGoogleLogin}
                className={`w-full font-medium py-2.5 px-4 rounded-xl border transition-colors duration-200 text-sm
                  ${isDark ? 'bg-[#1D2025] hover:bg-[#272A30] text-[#E1E2EA] border-[#3C4A42]/40' : 'bg-white hover:bg-[#F5F5F4] text-[#111827] border-[#D1D5DB]'}`}
              >
                Continue with Google
              </button>

              <div className="text-center">
                <p className={`${t.text.secondary} text-sm`}>
                  Already have an account?{' '}
                  <button onClick={() => navigate("/signin")} className="text-[#4EDEA3] hover:text-[#10B981] font-medium hover:underline transition-colors duration-200">Sign In</button>
                </p>
              </div>
            </div>

            <div className={`mt-8 pt-6 border-t ${t.border}`}>
              <p className={`text-center ${t.text.muted} text-xs`}>
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
