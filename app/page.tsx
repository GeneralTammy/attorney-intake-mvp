"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
  Shield,
  Eye,
  FileDown,
  User,
  Mail,
  Phone,
  Users,
} from "lucide-react";

const B = "#3B5BDB";

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const hero = useInView(0.05);
  const features = useInView();
  const workflow = useInView();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#3B5BDB] flex items-center justify-center">
                <Briefcase size={15} className="text-white" />
              </div>
              <span className="font-semibold text-lg text-gray-900">
                Case<span className="text-[#3B5BDB]">Ready</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {["Features", "Workflow"].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollTo(item.toLowerCase())}
                  className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition shadow-sm hover:shadow-md"
                style={{ background: B }}
              >
                Get started
              </Link>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-96" : "max-h-0"}`}
        >
          <div className="bg-white/95 backdrop-blur-xl border-t border-gray-100 px-6 py-4 flex flex-col gap-2">
            {["Features", "Workflow"].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase())}
                className="py-3 text-base font-medium text-gray-600 hover:text-gray-900 text-left"
              >
                {item}
              </button>
            ))}
            <div className="border-t border-gray-100 pt-4 mt-2 flex gap-3">
              <Link
                href="/login"
                className="flex-1 py-2.5 text-center text-sm font-medium text-gray-600 border border-gray-200 rounded-lg"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="flex-1 py-2.5 text-center text-sm font-semibold text-white rounded-lg"
                style={{ background: B }}
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden bg-white">
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div
            ref={hero.ref}
            className={`text-center transition-all duration-700 ${hero.inView ? "opacity-100" : "opacity-0"}`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6">
              <span className="text-xs font-medium text-[#3B5BDB]">
                Built for solo attorneys
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-5">
              Know if a case is ready
              <span className="block mt-2 text-[#3B5BDB]">
                before the consultation
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
              Collect structured client intake, identify missing details
              instantly, and generate professional readiness reports — before
              you meet.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#3B5BDB] text-white font-semibold rounded-lg transition shadow-sm hover:shadow-md"
              >
                Get started <ArrowRight size={16} />
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-500" /> No setup
                required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-500" /> Start
                collecting intakes instantly
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-500" /> Built
                for solo attorneys
              </span>
            </div>
          </div>

          {/* Dashboard + PDF Preview Panel */}
          <div className="mt-16 max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Dashboard Preview */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="bg-gray-900 px-4 py-2.5 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                  </div>
                  <div className="flex-1 bg-gray-800 rounded px-3 py-1 text-[11px] text-gray-400 font-mono text-center">
                    app.caseready.io/dashboard
                  </div>
                </div>
                <div className="p-5 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Intake Dashboard
                      </h3>
                      <p className="text-xs text-gray-400">4 active cases</p>
                    </div>
                    <div
                      className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg"
                      style={{ background: B }}
                    >
                      + New intake
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      {
                        name: "Sarah Chen",
                        type: "Personal Injury",
                        score: 94,
                        status: "Ready",
                      },
                      {
                        name: "Michael Rodriguez",
                        type: "Family Law",
                        score: 62,
                        status: "Partial",
                      },
                      {
                        name: "Jennifer Walsh",
                        type: "Criminal Defense",
                        score: 31,
                        status: "Not ready",
                      },
                    ].map((row) => (
                      <div
                        key={row.name}
                        className="bg-white rounded-lg border border-gray-100 p-3 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {row.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {row.type}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-16">
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{ width: `${row.score}%` }}
                              />
                            </div>
                            <div className="text-xs font-medium text-emerald-600 mt-1">
                              {row.score}%
                            </div>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${row.status === "Ready" ? "bg-emerald-50 text-emerald-700" : row.status === "Partial" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}
                          >
                            {row.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* PDF Preview Panel */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="bg-gray-100 px-4 py-2.5 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <FileDown size={14} className="text-[#3B5BDB]" />
                    <span className="text-xs font-medium text-gray-700">
                      Case Readiness Report
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  {/* Client Info */}
                  <div className="mb-4 pb-3 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-900 mb-2">
                      Sarah Chen
                    </p>
                    <div className="flex items-center gap-4 text-[10px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <User size={10} /> Personal Injury
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail size={10} /> sarah@example.com
                      </span>
                    </div>
                  </div>
                  {/* Readiness Score */}
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-[#3B5BDB]">94%</div>
                    <p className="text-[10px] text-gray-400">Readiness Score</p>
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500 w-[94%]" />
                    </div>
                  </div>
                  {/* Missing Documents */}
                  <div className="mb-4">
                    <p className="text-[10px] font-semibold text-rose-600 mb-2">
                      Missing Items
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        <span className="text-[10px] text-gray-600">
                          Police report
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        <span className="text-[10px] text-gray-600">
                          Medical records
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Attorney Notes */}
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-[10px] font-semibold text-gray-700 mb-1">
                      Attorney Notes
                    </p>
                    <p className="text-[9px] text-gray-500 italic">
                      Request police report before consultation
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <button
                      className="w-full py-1.5 text-[10px] font-medium text-white rounded-lg flex items-center justify-center gap-1"
                      style={{ background: B }}
                    >
                      <Download size={10} /> Download PDF Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Strip - Product Narrative */}
      <section id="workflow" className="py-16 lg:py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div
            ref={workflow.ref}
            className={`text-center mb-12 transition-all duration-700 ${workflow.inView ? "opacity-100" : "opacity-0"}`}
          >
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-3">
              Workflow
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
              From intake to consultation, in three steps
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              A structured workflow designed for legal professionals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-900 mb-4 shadow-sm">
                <Link2 size={24} className="text-white" />
                <span
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white"
                  style={{ background: "#EEF2FF", color: B }}
                >
                  1
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Client submits intake
              </h3>
              <p className="text-sm text-gray-500">
                Send a secure link. Client fills out structured form from any
                device.
              </p>
            </div>
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-900 mb-4 shadow-sm">
                <BarChart3 size={24} className="text-white" />
                <span
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white"
                  style={{ background: "#EEF2FF", color: B }}
                >
                  2
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                System scores readiness
              </h3>
              <p className="text-sm text-gray-500">
                Automatic readiness score. Flags missing documents and
                incomplete fields.
              </p>
            </div>
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-900 mb-4 shadow-sm">
                <Download size={24} className="text-white" />
                <span
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white"
                  style={{ background: "#EEF2FF", color: B }}
                >
                  3
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Attorney downloads report
              </h3>
              <p className="text-sm text-gray-500">
                One-click PDF report. Walk into consultation completely
                prepared.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 lg:py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div
            ref={features.ref}
            className={`text-center mb-12 transition-all duration-700 ${features.inView ? "opacity-100" : "opacity-0"}`}
          >
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#3B5BDB] uppercase tracking-wider mb-3">
              Features
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
              Everything you need. Nothing you don't.
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              A focused tool for solo attorneys. Does one thing extremely well.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: ClipboardList,
                title: "Structured intake forms",
                desc: "Purpose-built forms for each case type capture exactly what you need.",
              },
              {
                icon: BarChart3,
                title: "Readiness scoring",
                desc: "Instant readiness percentage based on your case-type rules.",
              },
              {
                icon: AlertCircle,
                title: "Missing document detection",
                desc: "Flags every gap — know exactly what to request before the meeting.",
              },
              {
                icon: FileDown,
                title: "PDF report generation",
                desc: "One-click professional summary ready to print or attach to your case file.",
              },
              {
                icon: Link2,
                title: "Secure intake links",
                desc: "Send clients a direct link. No login required. Works on any device.",
              },
              {
                icon: Shield,
                title: "Case type templates",
                desc: "Pre-built for Personal Injury, Family Law, Immigration, Criminal Defense, and Estate Planning.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 bg-blue-50">
                  <feature.icon size={16} className="text-[#3B5BDB]" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Attorney Workflows */}
      <section className="py-16 lg:py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#3B5BDB] uppercase tracking-wider mb-3">
            Designed for
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            Solo practice workflows
          </h2>
          <p className="text-gray-500 mb-8">
            Built specifically for how solo attorneys work — no bloat, no
            complexity.
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-left">
            <div className="bg-white rounded-lg border border-gray-100 p-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mb-2">
                <AlertCircle size={14} className="text-[#3B5BDB]" />
              </div>
              <p className="text-sm font-medium text-gray-900">
                Personal Injury
              </p>
              <p className="text-xs text-gray-400">
                Incident details, medical records, liability assessment
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 p-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mb-2">
                <Users size={14} className="text-[#3B5BDB]" />
              </div>
              <p className="text-sm font-medium text-gray-900">Family Law</p>
              <p className="text-xs text-gray-400">
                Marriage dates, children info, asset disclosure
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 p-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mb-2">
                <Shield size={14} className="text-[#3B5BDB]" />
              </div>
              <p className="text-sm font-medium text-gray-900">
                Criminal Defense
              </p>
              <p className="text-xs text-gray-400">
                Charges, arrest details, court dates, evidence
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-20 px-6 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
            Walk into every consultation prepared
          </h2>
          <p className="text-gray-400 mb-6">
            Stop chasing missing information. Start every case with confidence.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-gray-900 font-semibold rounded-lg shadow-md hover:shadow-lg transition"
          >
            Get started <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#3B5BDB] flex items-center justify-center">
              <Briefcase size={13} className="text-white" />
            </div>
            <span className="font-semibold text-gray-900">
              Case<span className="text-[#3B5BDB]">Ready</span>
            </span>
          </div>
          <div className="flex gap-5 text-xs text-gray-400">
            <a href="#" className="hover:text-gray-600">
              Terms
            </a>
            <a href="#" className="hover:text-gray-600">
              Privacy
            </a>
            <a href="#" className="hover:text-gray-600">
              Contact
            </a>
          </div>
          <div className="text-xs text-gray-400">
            © {new Date().getFullYear()} CaseReady. Built for attorneys.
          </div>
        </div>
      </footer>
    </div>
  );
}
