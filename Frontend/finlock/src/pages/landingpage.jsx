import React from "react";
import LandingNav from "../components/LandingNav";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  BarChart3, PieChart, TrendingUp, Shield, Zap, Target,
  ArrowRight, Star,
} from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();
  const { isDark, t } = useTheme();
  const navigate = useNavigate();

  const features = [
    { icon: BarChart3, title: "Smart Analytics", desc: "Visualize spending patterns with elegant charts and intelligent categorization." },
    { icon: PieChart, title: "Expense Tracking", desc: "Categorize every transaction with precision. See where your money flows." },
    { icon: TrendingUp, title: "Budget Goals", desc: "Set monthly budgets and track progress with real-time visual indicators." },
    { icon: Shield, title: "Bank-Grade Security", desc: "Your financial data is encrypted end-to-end with enterprise-grade protection." },
    { icon: Zap, title: "Receipt Scanner", desc: "Snap a photo and auto-fill transactions using AI-powered scanning." },
    { icon: Target, title: "Multi-Account", desc: "Manage checking, savings, and investment accounts in one unified view." },
  ];

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "₹2.5Cr+", label: "Tracked" },
    { value: "99.9%", label: "Uptime" },
    { value: "4.9★", label: "Rating" },
  ];

  return (
    <div className={`min-h-screen ${t.background} transition-colors duration-200`}>
      <LandingNav />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Subtle ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#10B981]/[0.04] rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#4EDEA3]/[0.03] rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-medium mb-8 animate-fade-in-up"
            style={{
              background: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.06)',
              borderColor: isDark ? 'rgba(78, 222, 163, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: '#4EDEA3',
            }}
          >
            <Zap className="w-3.5 h-3.5" />
            Intelligent Personal Finance
          </div>

          <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold ${t.text.primary} tracking-tight leading-tight mb-6 animate-fade-in-up`} style={{ animationDelay: '0.1s' }}>
            Your money,<br />
            <span className="bg-gradient-to-r from-[#10B981] to-[#4EDEA3] bg-clip-text text-transparent">
              beautifully managed.
            </span>
          </h1>

          <p className={`text-lg ${t.text.secondary} max-w-2xl mx-auto mb-10 animate-fade-in-up`} style={{ animationDelay: '0.2s' }}>
            Track expenses, set budgets, and gain actionable insights into your financial life.
            Built for people who value clarity and precision.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={() => navigate(user ? "/dashboard" : "/register")}
              className="group px-7 py-3.5 bg-gradient-to-r from-[#10B981] to-[#4EDEA3] text-[#003824] font-semibold rounded-xl hover:from-[#059669] hover:to-[#10B981] transition-all duration-200 shadow-sm flex items-center gap-2 text-sm"
            >
              {user ? "Go to Dashboard" : "Get Started Free"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/signin")}
              className={`px-7 py-3.5 border rounded-xl text-sm font-medium transition-all duration-200
                ${isDark ? 'border-[#3C4A42]/40 text-[#E1E2EA] hover:bg-[#272A30]' : 'border-[#D1D5DB] text-[#111827] hover:bg-[#F5F5F4]'}`}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className={`border-y ${t.border} py-12`}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className={`text-2xl sm:text-3xl font-bold text-tabular ${t.text.primary} tracking-tight`}>{stat.value}</p>
              <p className={`text-xs ${t.text.muted} mt-1 text-label-upper`}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-bold ${t.text.primary} tracking-tight mb-4`}>
              Everything you need to
              <span className="text-[#4EDEA3]"> take control</span>
            </h2>
            <p className={`${t.text.secondary} max-w-2xl mx-auto`}>
              Powerful tools designed with simplicity in mind.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`group ${t.card} border rounded-xl p-6 transition-all duration-200 ${t.cardHover}`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center mb-4
                  group-hover:bg-[#10B981]/20 transition-colors duration-200">
                  <feature.icon className="w-5 h-5 text-[#4EDEA3]" />
                </div>
                <h3 className={`text-base font-semibold ${t.text.primary} mb-2`}>{feature.title}</h3>
                <p className={`text-sm ${t.text.secondary} leading-relaxed`}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className={`py-20 ${isDark ? 'bg-[#0B0E13]' : 'bg-[#F5F5F4]'}`}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-bold ${t.text.primary} tracking-tight mb-4`}>
              Get started in <span className="text-[#4EDEA3]">3 steps</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create Account", desc: "Sign up in seconds with email or Google. No credit card required." },
              { step: "02", title: "Add Accounts", desc: "Set up your checking, savings, or investment accounts with initial balances." },
              { step: "03", title: "Track & Grow", desc: "Log transactions, set budgets, and watch your financial picture come together." },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-sm font-bold text-[#4EDEA3] text-tabular">{item.step}</span>
                </div>
                <h3 className={`text-base font-semibold ${t.text.primary} mb-2`}>{item.title}</h3>
                <p className={`text-sm ${t.text.secondary} leading-relaxed`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-bold ${t.text.primary} tracking-tight mb-4`}>
              Loved by <span className="text-[#4EDEA3]">thousands</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: "Priya S.", role: "Freelancer", quote: "Finally a finance app that feels premium and actually works. The dark mode is stunning." },
              { name: "Rahul M.", role: "Startup Founder", quote: "I manage 4 accounts seamlessly. Budget tracking saved me from overspending every month." },
              { name: "Ananya K.", role: "Student", quote: "The receipt scanner is magic. I just snap and everything fills in automatically." },
            ].map((review, i) => (
              <div key={i} className={`${t.card} border rounded-xl p-6`}>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-[#FBBF24] text-[#FBBF24]" />
                  ))}
                </div>
                <p className={`text-sm ${t.text.secondary} mb-4 leading-relaxed italic`}>"{review.quote}"</p>
                <div>
                  <p className={`text-sm font-semibold ${t.text.primary}`}>{review.name}</p>
                  <p className={`text-xs ${t.text.muted}`}>{review.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={`py-20 ${isDark ? 'bg-[#0B0E13]' : 'bg-[#F5F5F4]'}`}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className={`text-3xl sm:text-4xl font-bold ${t.text.primary} tracking-tight mb-4`}>
            Ready to take control?
          </h2>
          <p className={`${t.text.secondary} mb-8 max-w-xl mx-auto`}>
            Join thousands who are building better financial habits with Zorvyn.
          </p>
          <button
            onClick={() => navigate(user ? "/dashboard" : "/register")}
            className="group px-7 py-3.5 bg-gradient-to-r from-[#10B981] to-[#4EDEA3] text-[#003824] font-semibold rounded-xl hover:from-[#059669] hover:to-[#10B981] transition-all duration-200 shadow-sm flex items-center gap-2 text-sm mx-auto"
          >
            {user ? "Go to Dashboard" : "Start For Free"}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={`border-t ${t.border} py-8`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${t.text.primary}`}>Zorvyn</span>
            <span className={`text-xs ${t.text.muted}`}>© 2025</span>
          </div>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Contact"].map((link) => (
              <button key={link} className={`text-xs ${t.text.muted} hover:${t.text.secondary} transition-colors`}>{link}</button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}