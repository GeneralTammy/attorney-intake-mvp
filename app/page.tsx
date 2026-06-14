"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Download,
  Link2,
  Menu,
  X,
  BarChart3,
  ClipboardList,
  Briefcase,
  Shield,
  FileDown,
  Users,
} from "lucide-react";

const B = "#3B5BDB";
const SERIF = "'DM Serif Display', Georgia, serif";
const MONO = "'DM Mono', ui-monospace, monospace";

function scoreColor(score: number) {
  return score >= 80 ? "#12A06E" : score >= 50 ? "#C97A0A" : "#C93B3B";
}

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

  const mockRows = [
    { name: "Sarah Chen", type: "Personal Injury", score: 94, status: "Ready" },
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
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-[#E8EAF1] shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#3B5BDB] flex items-center justify-center">
                <Briefcase size={15} className="text-white" />
              </div>
              <span className="font-semibold text-lg text-[#0E1320]">
                Case<span className="text-[#3B5BDB]">Ready</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {["Features", "Workflow"].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollTo(item.toLowerCase())}
                  className="text-sm font-medium text-[#64748B] hover:text-[#0E1320] transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-[#475569] hover:text-[#0E1320] transition-colors"
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
              className="md:hidden p-2 text-[#475569] hover:bg-[#F7F8FB] rounded-lg"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-96" : "max-h-0"}`}
        >
          <div className="bg-white/95 backdrop-blur-xl border-t border-[#E8EAF1] px-6 py-4 flex flex-col gap-2">
            {["Features", "Workflow"].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase())}
                className="py-3 text-base font-medium text-[#475569] hover:text-[#0E1320] text-left"
              >
                {item}
              </button>
            ))}
            <div className="border-t border-[#EEF0F6] pt-4 mt-2 flex gap-3">
              <Link
                href="/login"
                className="flex-1 py-2.5 text-center text-sm font-medium text-[#475569] border border-[#E0E4EE] rounded-lg"
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

      {/* Hero */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden bg-white">
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div
            ref={hero.ref}
            className={`text-center transition-all duration-700 ${hero.inView ? "opacity-100" : "opacity-0"}`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EEF2FF] border border-blue-100 mb-6">
              <span className="text-xs font-medium text-[#3B5BDB]">
                Built for solo attorneys
              </span>
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl text-[#0E1320] tracking-tight leading-[1.08] mb-5"
              style={{ fontFamily: SERIF }}
            >
              Know if a case is ready
              <span className="block mt-2 text-[#3B5BDB]">
                before the consultation
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#64748B] max-w-2xl mx-auto mb-8 leading-relaxed">
              Collect structured client intake, identify missing details
              instantly, and generate professional readiness reports — before
              you meet.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#3B5BDB] text-white font-semibold rounded-lg transition shadow-sm hover:shadow-md"
              >
                Get started <ArrowRight size={16} />
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-[#94A3B8]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-[#12A06E]" /> No setup
                required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-[#12A06E]" /> Start
                collecting intakes instantly
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-[#12A06E]" /> Built for
                solo attorneys
              </span>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl border border-[#E8EAF1] shadow-xl overflow-hidden">
              <div className="bg-[#0E1320] px-4 py-2.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <div
                  className="flex-1 bg-white/10 rounded px-3 py-1 text-[11px] text-[#94A3B8] text-center"
                  style={{ fontFamily: MONO }}
                >
                  app.caseready.io/dashboard
                </div>
              </div>
              <div className="p-5 bg-[#F7F8FB]">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-semibold text-[#0E1320]">
                      Intake Dashboard
                    </h3>
                    <p className="text-xs text-[#94A3B8]">4 active cases</p>
                  </div>
                  <div
                    className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg"
                    style={{ background: B }}
                  >
                    + New intake
                  </div>
                </div>
                <div className="space-y-2">
                  {mockRows.map((row) => {
                    const c = scoreColor(row.score);
                    return (
                      <div
                        key={row.name}
                        className="bg-white rounded-lg border border-[#EEF0F6] p-3 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-[#0E1320] text-sm">
                            {row.name}
                          </div>
                          <div className="text-xs text-[#94A3B8]">
                            {row.type}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-16">
                            <div className="h-1.5 bg-[#EEF0F6] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${row.score}%`,
                                  background: c,
                                }}
                              />
                            </div>
                            <div
                              className="text-xs mt-1"
                              style={{ fontFamily: MONO, color: c }}
                            >
                              {row.score}%
                            </div>
                          </div>
                          <span
                            className="text-xs px-2 py-1 rounded-full font-medium"
                            style={{
                              color: c,
                              background:
                                row.score >= 80
                                  ? "#ECFDF3"
                                  : row.score >= 50
                                    ? "#FFF8EB"
                                    : "#FEF2F2",
                            }}
                          >
                            {row.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="py-16 lg:py-20 px-6 bg-[#F7F8FB]">
        <div className="max-w-5xl mx-auto">
          <div
            ref={workflow.ref}
            className={`text-center mb-12 transition-all duration-700 ${workflow.inView ? "opacity-100" : "opacity-0"}`}
          >
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#3B5BDB] uppercase tracking-[0.14em] mb-3">
              Workflow
            </div>
            <h2
              className="text-3xl lg:text-4xl text-[#0E1320] mb-3"
              style={{ fontFamily: SERIF }}
            >
              From intake to consultation, in three steps
            </h2>
            <p className="text-[#64748B] max-w-xl mx-auto">
              A structured workflow designed for legal professionals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Link2,
                n: 1,
                title: "Client submits intake",
                desc: "Send a secure link. Client fills out a structured form from any device.",
              },
              {
                icon: BarChart3,
                n: 2,
                title: "System scores readiness",
                desc: "Automatic readiness score flags missing documents and incomplete fields.",
              },
              {
                icon: Download,
                n: 3,
                title: "Attorney downloads report",
                desc: "One-click report. Walk into the consultation completely prepared.",
              },
            ].map((step) => (
              <div key={step.n} className="text-center">
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0E1320] mb-4 shadow-sm">
                  <step.icon size={24} className="text-white" />
                  <span
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-[#F7F8FB]"
                    style={{ background: "#EEF2FF", color: B }}
                  >
                    {step.n}
                  </span>
                </div>
                <h3 className="font-semibold text-[#0E1320] mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-[#64748B]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 lg:py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div
            ref={features.ref}
            className={`text-center mb-12 transition-all duration-700 ${features.inView ? "opacity-100" : "opacity-0"}`}
          >
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#3B5BDB] uppercase tracking-[0.14em] mb-3">
              Features
            </div>
            <h2
              className="text-3xl lg:text-4xl text-[#0E1320] mb-3"
              style={{ fontFamily: SERIF }}
            >
              Everything you need. Nothing you don&rsquo;t.
            </h2>
            <p className="text-[#64748B] max-w-xl mx-auto">
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
                title: "Report generation",
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
                className="bg-white border border-[#E8EAF1] rounded-2xl p-5 hover:shadow-md hover:border-[#D7DCE7] transition"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 bg-[#EEF2FF]">
                  <feature.icon size={16} className="text-[#3B5BDB]" />
                </div>
                <h3 className="font-semibold text-[#0E1320] mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Designed for */}
      <section className="py-16 lg:py-20 px-6 bg-[#F7F8FB]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#3B5BDB] uppercase tracking-[0.14em] mb-3">
            Designed for
          </div>
          <h2
            className="text-3xl lg:text-4xl text-[#0E1320] mb-4"
            style={{ fontFamily: SERIF }}
          >
            Solo practice workflows
          </h2>
          <p className="text-[#64748B] mb-8">
            Built specifically for how solo attorneys work — no bloat, no
            complexity.
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-left">
            {[
              {
                icon: AlertCircle,
                title: "Personal Injury",
                desc: "Incident details, medical records, liability assessment",
              },
              {
                icon: Users,
                title: "Family Law",
                desc: "Marriage dates, children info, asset disclosure",
              },
              {
                icon: Shield,
                title: "Criminal Defense",
                desc: "Charges, arrest details, court dates, evidence",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-2xl border border-[#E8EAF1] p-4"
              >
                <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center mb-2">
                  <card.icon size={14} className="text-[#3B5BDB]" />
                </div>
                <p className="text-sm font-medium text-[#0E1320]">
                  {card.title}
                </p>
                <p className="text-xs text-[#94A3B8] mt-0.5">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-24 px-6 bg-[#0E1320]">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-3xl lg:text-4xl text-white mb-3"
            style={{ fontFamily: SERIF }}
          >
            Walk into every consultation prepared
          </h2>
          <p className="text-[#94A3B8] mb-7">
            Stop chasing missing information. Start every case with confidence.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#0E1320] font-semibold rounded-lg shadow-md hover:shadow-lg transition"
          >
            Get started <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E8EAF1] px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#3B5BDB] flex items-center justify-center">
              <Briefcase size={13} className="text-white" />
            </div>
            <span className="font-semibold text-[#0E1320]">
              Case<span className="text-[#3B5BDB]">Ready</span>
            </span>
          </div>
          <div className="flex gap-5 text-xs text-[#94A3B8]">
            <a href="#" className="hover:text-[#475569]">
              Terms
            </a>
            <a href="#" className="hover:text-[#475569]">
              Privacy
            </a>
            <a href="#" className="hover:text-[#475569]">
              Contact
            </a>
          </div>
          <div className="text-xs text-[#94A3B8]">
            © {new Date().getFullYear()} CaseReady. Built for attorneys.
          </div>
        </div>
      </footer>
    </div>
  );
}
