import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/InitialNavbar';
import axios from '../utils/axios';


export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();
  const { isDark, t } = useTheme();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || !email) {
        setStatus('error');
        setMessage('Invalid verification link. Missing token or email.');
        return;
      }

      try {
        const res = await axios.get(`/api/v1/users/verify-email?token=${token}&email=${encodeURIComponent(email)}`);
        setStatus('success');
        setMessage(res.data?.message || 'Email verified successfully!');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
      }
    };

    verifyEmail();
  }, [token, email]);

  // Countdown redirect on success
  useEffect(() => {
    if (status === 'success') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/signin');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, navigate]);

  const handleResend = async () => {
    if (!email) return;
    try {
      await axios.post('/api/v1/users/resend-verification', { email: decodeURIComponent(email) });
      setMessage('A new verification email has been sent! Check your inbox.');
      setStatus('resent');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to resend. Please try again.');
    }
  };

  return (
    <div className={`min-h-screen ${t.background}`}>
      <Navbar />
      <div className="flex items-center justify-center px-4 pt-28">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className={`${t.card} backdrop-blur-xl rounded-2xl p-8 shadow-lg border text-center`}>

            {/* Logo */}
            <div className="w-14 h-14 bg-gradient-to-br from-[#10B981] to-[#4EDEA3] rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-md">
              <span className="text-2xl font-black text-[#003824]">Z</span>
            </div>

            {/* Verifying State */}
            {status === 'verifying' && (
              <>
                <div className="mb-6">
                  <svg className="animate-spin h-12 w-12 mx-auto text-[#10B981]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                </div>
                <h1 className={`${t.text.primary} text-2xl font-bold mb-2`}>Verifying Your Email</h1>
                <p className={`${t.text.secondary} text-sm`}>Please wait while we verify your email address...</p>
              </>
            )}

            {/* Success State */}
            {status === 'success' && (
              <>
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#10B981] to-[#4EDEA3] rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h1 className={`${t.text.primary} text-2xl font-bold mb-2`}>Email Verified! 🎉</h1>
                <p className={`${t.text.secondary} text-sm mb-6`}>{message}</p>
                <p className={`${t.text.muted} text-xs mb-4`}>
                  Redirecting to sign in in <span className="font-bold text-[#10B981]">{countdown}s</span>...
                </p>
                <button
                  onClick={() => navigate('/signin')}
                  className="w-full bg-gradient-to-r from-[#10B981] to-[#4EDEA3] hover:from-[#059669] hover:to-[#10B981] text-[#003824] font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm"
                >
                  Sign In Now
                </button>
              </>
            )}

            {/* Error State */}
            {(status === 'error' || status === 'resent') && (
              <>
                <div className="mb-6">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center shadow-lg ${
                    status === 'resent'
                      ? 'bg-gradient-to-br from-[#10B981] to-[#4EDEA3]'
                      : 'bg-gradient-to-br from-[#EF4444] to-[#F87171]'
                  }`}>
                    {status === 'resent' ? (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                </div>
                <h1 className={`${t.text.primary} text-2xl font-bold mb-2`}>
                  {status === 'resent' ? 'Email Sent! ✉️' : 'Verification Failed'}
                </h1>
                <p className={`${t.text.secondary} text-sm mb-6`}>{message}</p>

                {status === 'error' && email && (
                  <button
                    onClick={handleResend}
                    className="w-full bg-gradient-to-r from-[#10B981] to-[#4EDEA3] hover:from-[#059669] hover:to-[#10B981] text-[#003824] font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm mb-3"
                  >
                    Resend Verification Email
                  </button>
                )}

                <button
                  onClick={() => navigate('/signin')}
                  className={`w-full font-medium py-2.5 px-4 rounded-xl border transition-colors duration-200 text-sm
                    ${isDark ? 'bg-[#1D2025] hover:bg-[#272A30] text-[#E1E2EA] border-[#3C4A42]/40' : 'bg-white hover:bg-[#F5F5F4] text-[#111827] border-[#D1D5DB]'}`}
                >
                  Go to Sign In
                </button>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
