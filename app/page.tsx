"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Download,
  Link2,
  Clock,
  Menu,
  X,
  FileText,
  BarChart3,
  ClipboardList,
  Briefcase,
  FileCheck,
  Users,
  Shield,
  Star,
  Eye,
  FileDown,
  LayoutDashboard,
  Activity,
  Calendar,
  Mail,
  Bell,
  Plus,
  Search,
  Settings,
  Home,
  ChevronRight,
  Zap,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Rocket,
} from "lucide-react";

// Brand color
const B = "#3B5BDB";
const BH = "#2F4AC2";

// ─────────────────────────────────────────────────────────────
// Custom Components
// ─────────────────────────────────────────────────────────────

function FloatingCard({ children, delay, className = "" }: any) {
  return (
    <div
      className={`absolute animate-float ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes glow {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.8;
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }
        .animate-slide-left {
          animation: slide-in-left 0.6s ease-out forwards;
        }
        .animate-slide-right {
          animation: slide-in-right 0.6s ease-out forwards;
        }
        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition:
            opacity 0.8s ease,
            transform 0.8s ease;
        }
        .reveal-on-scroll.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      {/* ────────────────────────────────────────────────────────── */}
      {/* NAVIGATION - Premium Glassmorphism */}
      {/* ────────────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#3B5BDB] to-[#2F4AC2] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                <Briefcase size={16} className="text-white" />
              </div>
              <span className="font-semibold text-xl text-gray-900">
                Case<span className="text-[#3B5BDB]">Ready</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {["Features", "How it works", "Pricing"].map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    scrollTo(item.toLowerCase().replace(/\s/g, "-"))
                  }
                  className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                style={{ background: B }}
                onMouseEnter={(e) => (e.currentTarget.style.background = BH)}
                onMouseLeave={(e) => (e.currentTarget.style.background = B)}
              >
                Start free trial
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            menuOpen ? "max-h-96" : "max-h-0"
          }`}
        >
          <div className="bg-white/95 backdrop-blur-xl border-t border-gray-100 px-6 py-4 flex flex-col gap-2">
            {["Features", "How it works", "Pricing"].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase().replace(/\s/g, "-"))}
                className="py-3 text-base font-medium text-gray-600 hover:text-gray-900 text-left"
              >
                {item}
              </button>
            ))}
            <div className="border-t border-gray-100 pt-4 mt-2 flex gap-3">
              <Link
                href="/login"
                className="flex-1 py-2.5 text-center text-sm font-medium text-gray-600 border border-gray-200 rounded-xl"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="flex-1 py-2.5 text-center text-sm font-semibold text-white rounded-xl"
                style={{ background: B }}
              >
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ────────────────────────────────────────────────────────── */}
      {/* HERO SECTION - Premium with Glow Effects */}
      {/* ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/10 rounded-full blur-3xl animate-glow" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -left-48 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          {/* Badge */}
          <div className="flex justify-center mb-6 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100">
              <Sparkles size={12} className="text-[#3B5BDB]" />
              <span className="text-xs font-medium text-[#3B5BDB]">
                Built for solo attorneys
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-center tracking-tighter leading-[1.08] mb-6 animate-slide-up">
            Know if a case is ready
            <span className="block bg-gradient-to-r from-[#3B5BDB] to-[#5B7BEB] bg-clip-text text-transparent">
              before the consultation
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-500 text-center max-w-2xl mx-auto mb-10 animate-slide-up leading-relaxed">
            Collect structured client intake, identify missing details
            instantly, and generate professional readiness reports — before you
            meet.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              style={{ background: B }}
              onMouseEnter={(e) => (e.currentTarget.style.background = BH)}
              onMouseLeave={(e) => (e.currentTarget.style.background = B)}
            >
              Start free trial <ArrowRight size={16} />
            </Link>
            <button
              onClick={() => scrollTo("how-it-works")}
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
            >
              Watch demo
            </button>
          </div>

          {/* Floating Dashboard Mockup */}
          <div className="relative mx-auto max-w-6xl animate-slide-up">
            {/* Floating UI Cards */}
            <FloatingCard delay={0} className="-top-8 -left-4 lg:-left-8 z-10">
              <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-xl border border-gray-100 p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                    <CheckCircle2 size={14} className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">
                      94% complete
                    </p>
                    <p className="text-[10px] text-gray-400">Sarah Chen</p>
                  </div>
                </div>
              </div>
            </FloatingCard>

            <FloatingCard delay={1} className="-top-12 right-0 lg:right-8 z-10">
              <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-xl border border-gray-100 p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <AlertCircle size={14} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">
                      3 items missing
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Michael Rodriguez
                    </p>
                  </div>
                </div>
              </div>
            </FloatingCard>

            <FloatingCard
              delay={0.5}
              className="-bottom-8 -right-4 lg:-right-12 z-10"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-xl border border-gray-100 p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Download size={14} className="text-[#3B5BDB]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">
                      PDF ready
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Ready for review
                    </p>
                  </div>
                </div>
              </div>
            </FloatingCard>

            {/* Main Dashboard Mockup */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
              {/* Mockup Browser Bar */}
              <div className="bg-gray-900 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <div className="flex-1 bg-gray-800 rounded-lg px-3 py-1 text-[11px] text-gray-400 font-mono text-center">
                  app.caseready.io/dashboard
                </div>
                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#3B5BDB] to-[#2F4AC2]" />
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="flex h-[480px] lg:h-[540px]">
                {/* Sidebar */}
                <div className="w-16 bg-gray-50 border-r border-gray-100 flex flex-col items-center py-4 gap-5">
                  <Home size={18} className="text-[#3B5BDB]" />
                  <LayoutDashboard size={18} className="text-gray-400" />
                  <FileText size={18} className="text-gray-400" />
                  <Users size={18} className="text-gray-400" />
                  <Settings size={18} className="text-gray-400" />
                </div>

                {/* Main Content */}
                <div className="flex-1 p-5 overflow-auto">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Intake Dashboard
                      </h2>
                      <p className="text-xs text-gray-400">
                        12 active cases this month
                      </p>
                    </div>
                    <button
                      className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg flex items-center gap-1"
                      style={{ background: B }}
                    >
                      <Plus size={12} /> New intake
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-2xl font-bold text-gray-900">12</p>
                      <p className="text-[10px] text-gray-400">Total cases</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-2xl font-bold text-[#3B5BDB]">7</p>
                      <p className="text-[10px] text-gray-400">
                        Ready for review
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-2xl font-bold text-amber-600">5</p>
                      <p className="text-[10px] text-gray-400">Needs info</p>
                    </div>
                  </div>

                  {/* Intake Table */}
                  <div className="border border-gray-100 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-[2fr_1.2fr_1fr_80px] gap-3 px-4 py-2 bg-gray-50 border-b border-gray-100 text-[10px] font-semibold text-gray-400 uppercase">
                      <span>Client</span>
                      <span>Case type</span>
                      <span>Readiness</span>
                      <span>Status</span>
                    </div>
                    {[
                      {
                        name: "Sarah Chen",
                        type: "Personal Injury",
                        score: 94,
                        status: "Ready",
                        bar: "bg-emerald-500",
                      },
                      {
                        name: "Michael Rodriguez",
                        type: "Family Law",
                        score: 62,
                        status: "Partial",
                        bar: "bg-amber-400",
                      },
                      {
                        name: "Jennifer Walsh",
                        type: "Criminal Defense",
                        score: 31,
                        status: "Not ready",
                        bar: "bg-rose-400",
                      },
                      {
                        name: "David Kim",
                        type: "Immigration",
                        score: 100,
                        status: "Ready",
                        bar: "bg-emerald-500",
                      },
                    ].map((row, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[2fr_1.2fr_1fr_80px] gap-3 px-4 py-2.5 items-center border-b border-gray-50"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold">
                            {row.name.charAt(0)}
                          </div>
                          <span className="text-xs font-medium text-gray-900">
                            {row.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {row.type}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${row.bar}`}
                              style={{ width: `${row.score}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-600 w-7 text-right">
                            {row.score}%
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            row.status === "Ready"
                              ? "bg-emerald-50 text-emerald-700"
                              : row.status === "Partial"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {row.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Panel - PDF Preview */}
                <div className="w-64 bg-gray-50 border-l border-gray-100 p-4">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xs font-bold text-gray-700">
                      Ready to review
                    </p>
                    <FileDown size={12} className="text-[#3B5BDB]" />
                  </div>
                  <div className="bg-white rounded-lg border border-gray-100 p-3 mb-3">
                    <p className="text-[10px] font-semibold text-gray-900 mb-1">
                      Sarah Chen
                    </p>
                    <p className="text-[9px] text-gray-400 mb-2">
                      Personal Injury
                    </p>
                    <div className="h-1.5 bg-gray-100 rounded-full mb-2">
                      <div className="h-full rounded-full bg-emerald-500 w-[94%]" />
                    </div>
                    <p className="text-[9px] font-medium text-emerald-600 text-right">
                      94% ready
                    </p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-100 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle size={10} className="text-rose-500" />
                      <p className="text-[9px] font-semibold text-rose-600">
                        Missing items
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        <p className="text-[8px] text-gray-500">
                          Police report
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        <p className="text-[8px] text-gray-500">
                          Medical records
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        <p className="text-[8px] text-gray-500">Witness info</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* FEATURES SECTION - Alternating Layout with Mockups */}
      {/* ────────────────────────────────────────────────────────── */}

      {/* Feature 1 - Left */}
      <section className="py-24 lg:py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 mb-6">
                <Zap size={12} className="text-[#3B5BDB]" />
                <span className="text-xs font-medium text-[#3B5BDB]">
                  Intelligent intake
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                Structured forms that adapt to your practice
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                Each case type has purpose-built fields. Personal Injury
                requires incident details. Family Law needs marriage dates.
                Immigration asks about visa status. No more chasing basic
                information.
              </p>
              <div className="space-y-3">
                {[
                  "5+ practice areas supported",
                  "Dynamic fields per case type",
                  "Required vs optional markers",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className="text-sm text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl blur-xl" />
                <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">
                        Case type
                      </label>
                      <div className="flex gap-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-[#EEF2FF] text-[#3B5BDB] font-medium">
                          Personal Injury
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                          Family Law
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                          Immigration
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Incident date *
                        </label>
                        <div className="h-8 bg-gray-50 rounded border border-gray-200" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Injury description *
                        </label>
                        <div className="h-16 bg-gray-50 rounded border border-gray-200" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Medical providers *
                        </label>
                        <div className="h-8 bg-gray-50 rounded border border-gray-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 2 - Right */}
      <section className="py-24 lg:py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 mb-6">
                <TrendingUp size={12} className="text-emerald-600" />
                <span className="text-xs font-medium text-emerald-600">
                  Readiness scoring
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                See exactly what's missing before you meet
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                Every intake gets an instant readiness score. Red items need
                attention. Green items are complete. You walk into every
                consultation knowing exactly what's missing.
              </p>
              <div className="space-y-3">
                {[
                  "Real-time scoring (0-100%)",
                  "Missing document detection",
                  "Automatic checklist generation",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className="text-sm text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-2xl blur-xl" />
                <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-5">
                  <div className="text-center mb-4">
                    <div className="text-5xl font-bold text-[#3B5BDB] mb-1">
                      85<span className="text-2xl">%</span>
                    </div>
                    <p className="text-xs text-gray-500">Overall readiness</p>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Required fields</span>
                      <span className="text-emerald-600 font-medium">
                        4/7 complete
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500 w-[57%]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 size={12} className="text-emerald-500" />
                      <span className="text-gray-600">Incident date</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <AlertCircle size={12} className="text-rose-500" />
                      <span className="text-gray-600">Police report</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <AlertCircle size={12} className="text-rose-500" />
                      <span className="text-gray-600">Medical records</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3 - Left */}
      <section className="py-24 lg:py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 mb-6">
                <FileDown size={12} className="text-purple-600" />
                <span className="text-xs font-medium text-purple-600">
                  PDF reports
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                One-click professional reports
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                Generate a clean, professional PDF summary with one click.
                Perfect for case files, client communication, or consultation
                preparation. Download, print, or share instantly.
              </p>
              <div className="space-y-3">
                {[
                  "Client information summary",
                  "Readiness score and checklist",
                  "Missing items highlighted",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className="text-sm text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl blur-xl" />
                <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600">
                      Sarah Chen - Readiness Report.pdf
                    </span>
                    <Download size={12} className="text-[#3B5BDB]" />
                  </div>
                  <div className="p-5">
                    <div className="border-b border-gray-100 pb-3 mb-3">
                      <p className="text-sm font-bold text-gray-900">
                        Case Readiness Report
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Generated May 27, 2024
                      </p>
                    </div>
                    <div className="text-center mb-3">
                      <div className="text-2xl font-bold text-[#3B5BDB]">
                        85%
                      </div>
                      <p className="text-[9px] text-gray-500">
                        Ready for review
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={8} className="text-emerald-500" />
                        <span className="text-[9px] text-gray-600">
                          Incident date provided
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <AlertCircle size={8} className="text-rose-500" />
                        <span className="text-[9px] text-rose-600">
                          Missing: police report
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* HOW IT WORKS - 3 Steps */}
      {/* ────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 lg:py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 mb-4">
              <Rocket size={12} className="text-[#3B5BDB]" />
              <span className="text-xs font-medium text-[#3B5BDB]">
                Simple workflow
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Three steps to a prepared consultation
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              No training required. Start in minutes, not hours.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Link2,
                title: "Send intake link",
                description:
                  "Choose case type, generate a link, and send to your client via email or text.",
                color: "#3B5BDB",
              },
              {
                step: "02",
                icon: BarChart3,
                title: "Review readiness",
                description:
                  "See the readiness score and exactly what's missing before the consultation.",
                color: "#3B5BDB",
              },
              {
                step: "03",
                icon: Download,
                title: "Download report",
                description:
                  "Export a clean PDF summary. Walk in prepared every single time.",
                color: "#3B5BDB",
              },
            ].map((step, i) => (
              <div key={i} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#3B5BDB]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3B5BDB] to-[#2F4AC2] flex items-center justify-center mb-5 shadow-md">
                    <step.icon size={20} className="text-white" />
                  </div>
                  <div className="text-4xl font-bold text-gray-100 absolute top-6 right-6">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* TRUST SECTION - Testimonials */}
      {/* ────────────────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 mb-4">
              <Star size={12} className="text-amber-600" />
              <span className="text-xs font-medium text-amber-600">
                Trusted by attorneys
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              What attorneys are saying
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Rachel Conley",
                role: "Solo Personal Injury Attorney",
                quote:
                  "The readiness score alone is worth it. I know which cases are ready and which need follow-up before I walk in.",
                rating: 5,
              },
              {
                name: "David Marchand",
                role: "Managing Partner, Marchand Family Law",
                quote:
                  "My clients are actually more prepared now. The intake form sets clear expectations about what information I need.",
                rating: 5,
              },
              {
                name: "Tanya Perez",
                role: "Immigration Attorney",
                quote:
                  "Missing document detection means I'm never blindsided. The PDF report stays in the case file permanently.",
                rating: 5,
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star
                      key={j}
                      size={14}
                      className="text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* PRICING SECTION */}
      {/* ────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 lg:py-32 px-6 bg-gray-50">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 mb-4">
              <Shield size={12} className="text-[#3B5BDB]" />
              <span className="text-xs font-medium text-[#3B5BDB]">
                Pricing
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Simple, flat pricing
            </h2>
            <p className="text-gray-500">
              No per-case fees. No seat limits. One plan.
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#3B5BDB] to-[#2F4AC2] rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition duration-500" />
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 px-8 py-8 text-center">
                <div className="inline-block px-3 py-1 rounded-full bg-[#EEF2FF] text-[#3B5BDB] text-xs font-semibold mb-4">
                  CaseReady Pro
                </div>
                <div className="text-5xl font-bold text-white mb-2">$29</div>
                <div className="text-gray-400 text-sm">
                  per month · billed monthly
                </div>
              </div>
              <div className="px-8 py-8">
                <div className="space-y-3 mb-8">
                  {[
                    "Unlimited client intakes",
                    "All case type templates",
                    "Readiness scoring & checklists",
                    "Downloadable PDF reports",
                    "Public intake links",
                    "Missing information alerts",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/signup"
                  className="block w-full py-3 text-center text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5"
                  style={{ background: B }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = BH)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = B)}
                >
                  Start free trial
                </Link>
                <p className="text-xs text-center text-gray-400 mt-4">
                  14-day free trial · No credit card required
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* FINAL CTA */}
      {/* ────────────────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32 px-6 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#3B5BDB]/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight">
            Walk into every consultation prepared
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Stop chasing missing information. Start every case with confidence.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-gray-900 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            Start free trial <ArrowRight size={16} />
          </Link>
          <p className="text-gray-500 text-sm mt-4">
            Free for 14 days. No commitment. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 px-6 py-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#3B5BDB] to-[#2F4AC2] flex items-center justify-center">
              <Briefcase size={13} className="text-white" />
            </div>
            <span className="font-semibold text-gray-900">
              Case<span className="text-[#3B5BDB]">Ready</span>
            </span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-600 transition">
              Terms
            </a>
            <a href="#" className="hover:text-gray-600 transition">
              Privacy
            </a>
            <a href="#" className="hover:text-gray-600 transition">
              Contact
            </a>
          </div>
          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} CaseReady. Built for attorneys.
          </div>
        </div>
      </footer>
    </div>
  );
}
