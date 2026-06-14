"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Menu,
  X,
  Search,
  Settings,
  LogOut,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  LayoutDashboard,
  PlusCircle,
  Link2,
} from "lucide-react";

import NotificationBell from "@/components/NotificationBell";

const MONO = "'DM Mono', ui-monospace, monospace";
const SERIF = "'DM Serif Display', Georgia, serif";

interface Intake {
  id: string;
  client_first_name: string;
  client_last_name: string;
  case_type: string;
  client_email?: string;
  status: string;
  created_at: string;
  readiness_score?: number | null;
  case_data?: Record<string, any>;
}

function getInitials(first: string, last: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

function formatCaseType(raw: string) {
  const types: Record<string, string> = {
    personal_injury: "Personal Injury",
    family: "Family Law",
    criminal_defense: "Criminal Defense",
    immigration: "Immigration",
    estate_planning: "Estate Planning",
  };
  return (
    types[raw] ||
    raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Readiness score comes from the database — never invent it client-side.
function getReadinessScore(intake: Intake): number {
  return intake.readiness_score ?? 0;
}

function scoreColor(score: number) {
  return score >= 80 ? "#12A06E" : score >= 50 ? "#C97A0A" : "#C93B3B";
}

function getAvatarColors(name: string): { bg: string; text: string } {
  const colors = [
    { bg: "bg-blue-50", text: "text-blue-700" },
    { bg: "bg-amber-50", text: "text-amber-700" },
    { bg: "bg-purple-50", text: "text-purple-700" },
    { bg: "bg-emerald-50", text: "text-emerald-700" },
    { bg: "bg-pink-50", text: "text-pink-700" },
    { bg: "bg-indigo-50", text: "text-indigo-700" },
  ];
  const idx = (name?.charCodeAt(0) ?? 0) % colors.length;
  return colors[idx];
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "ready_for_review":
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#12A06E]" />
          <span className="text-xs font-medium text-emerald-700">
            Ready for Review
          </span>
        </div>
      );
    case "consultation_booked":
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#3B5BDB]" />
          <span className="text-xs font-medium text-[#3B5BDB]">
            Consultation Booked
          </span>
        </div>
      );
    default:
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#A9B1C2]" />
          <span className="text-xs font-medium text-[#64748B]">Draft</span>
        </div>
      );
  }
}

function ReadinessIndicator({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-20 h-1.5 bg-[#EEF0F6] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, background: scoreColor(score) }}
        />
      </div>
      <span
        className="text-sm w-11"
        style={{ fontFamily: MONO, color: scoreColor(score) }}
      >
        {score}%
      </span>
    </div>
  );
}

function StatCard({
  label,
  value,
  subtext,
  icon,
  iconBg,
}: {
  label: string;
  value: string | number;
  subtext: string;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8EAF1] p-5">
      <div
        className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center mb-4`}
      >
        {icon}
      </div>
      <p
        className="text-[26px] leading-none text-[#0E1320]"
        style={{ fontFamily: MONO }}
      >
        {value}
      </p>
      <p className="text-sm font-medium text-[#334155] mt-2">{label}</p>
      <p className="text-xs text-[#94A3B8] mt-0.5">{subtext}</p>
    </div>
  );
}

function DesktopSidebar({
  userName,
  onSignOut,
  currentPath,
}: {
  userName: string;
  onSignOut: () => void;
  currentPath: string;
}) {
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/intakes/new", label: "New Intake", icon: PlusCircle },
  ];

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r border-[#E8EAF1] z-50 flex-col hidden lg:flex">
      <div className="px-5 py-5 border-b border-[#EEF0F6]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#3B5BDB] flex items-center justify-center">
            <Briefcase size={15} className="text-white" />
          </div>
          <span className="font-semibold text-base text-[#0E1320]">
            Case<span className="text-[#3B5BDB]">Ready</span>
          </span>
        </Link>
      </div>
      <div className="px-4 py-4 border-b border-[#EEF0F6]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center">
            <span className="text-[#3B5BDB] text-sm font-medium">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#0E1320] truncate">
              {userName}
            </p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        <div className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.14em] px-3 pb-2">
          Main
        </div>
        {navItems.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${isActive ? "bg-[#EEF2FF] text-[#3B5BDB] font-medium" : "text-[#475569] hover:bg-[#F7F8FB] hover:text-[#0E1320]"}`}
            >
              <item.icon
                size={16}
                className={isActive ? "text-[#3B5BDB]" : "text-[#94A3B8]"}
              />{" "}
              {item.label}
            </Link>
          );
        })}
        <div className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.14em] px-3 pb-2 pt-6">
          Account
        </div>
        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${currentPath === "/dashboard/settings" ? "bg-[#EEF2FF] text-[#3B5BDB] font-medium" : "text-[#475569] hover:bg-[#F7F8FB] hover:text-[#0E1320]"}`}
        >
          <Settings
            size={16}
            className={
              currentPath === "/dashboard/settings"
                ? "text-[#3B5BDB]"
                : "text-[#94A3B8]"
            }
          />{" "}
          Settings
        </Link>
      </nav>
      <div className="p-4 border-t border-[#EEF0F6]">
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-[#64748B] hover:bg-red-50 hover:text-[#C93B3B] transition-all"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  );
}

function MobileSidebar({
  userName,
  onSignOut,
  isOpen,
  onClose,
  currentPath,
}: {
  userName: string;
  onSignOut: () => void;
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
}) {
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/intakes/new", label: "New Intake", icon: PlusCircle },
  ];

  const handleNavigation = (href: string) => {
    onClose();
    setTimeout(() => {
      if (href === currentPath) {
        window.location.reload();
      } else {
        window.location.href = href;
      }
    }, 50);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      <aside className="fixed top-0 left-0 h-full w-72 bg-white z-50 flex flex-col shadow-xl lg:hidden">
        <div className="px-5 py-5 border-b border-[#EEF0F6] flex justify-between items-center">
          <div
            onClick={() => handleNavigation("/dashboard")}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#3B5BDB] flex items-center justify-center">
                <Briefcase size={15} className="text-white" />
              </div>
              <span className="font-semibold text-base text-[#0E1320]">
                Case<span className="text-[#3B5BDB]">Ready</span>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-[#F7F8FB] transition"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-4 py-4 border-b border-[#EEF0F6]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center">
              <span className="text-[#3B5BDB] text-sm font-medium">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#0E1320]">{userName}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-0.5">
          <div className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.14em] px-3 pb-2">
            Main
          </div>
          {navItems.map((item) => (
            <div
              key={item.href}
              onClick={() => handleNavigation(item.href)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${currentPath === item.href ? "bg-[#EEF2FF] text-[#3B5BDB] font-medium" : "text-[#475569] hover:bg-[#F7F8FB] hover:text-[#0E1320]"}`}
            >
              <item.icon
                size={16}
                className={
                  currentPath === item.href
                    ? "text-[#3B5BDB]"
                    : "text-[#94A3B8]"
                }
              />{" "}
              {item.label}
            </div>
          ))}
          <div className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.14em] px-3 pb-2 pt-6">
            Account
          </div>
          <div
            onClick={() => handleNavigation("/dashboard/settings")}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${currentPath === "/dashboard/settings" ? "bg-[#EEF2FF] text-[#3B5BDB] font-medium" : "text-[#475569] hover:bg-[#F7F8FB] hover:text-[#0E1320]"}`}
          >
            <Settings
              size={16}
              className={
                currentPath === "/dashboard/settings"
                  ? "text-[#3B5BDB]"
                  : "text-[#94A3B8]"
              }
            />{" "}
            Settings
          </div>
        </nav>
        <div className="p-4 border-t border-[#EEF0F6]">
          <button
            onClick={() => {
              onSignOut();
              onClose();
            }}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-[#64748B] hover:bg-red-50 hover:text-[#C93B3B] transition-all"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

export default function DashboardPage() {
  const pathname = usePathname();
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Attorney");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "ready_for_review" | "draft"
  >("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const name =
          data.user.user_metadata?.full_name ??
          data.user.email?.split("@")[0] ??
          "Attorney";
        setUserName(name);
      }
    });
    fetchIntakes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchIntakes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/intakes");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setIntakes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Could not load intakes. Please refresh.");
      setIntakes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleGenerateShareLink = async () => {
    setGeneratingLink(true);
    setError(null);
    try {
      const response = await fetch("/api/intakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_first_name: "Client",
          client_last_name: "Name",
          client_email: null,
          client_phone: null,
          case_type: "personal_injury",
          case_data: {},
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create intake (HTTP ${response.status})`);
      }

      const intake = await response.json();

      if (!intake?.id) {
        throw new Error("Intake created but no id returned by /api/intakes");
      }

      const shareResponse = await fetch(`/api/intakes/${intake.id}/share`);

      if (!shareResponse.ok) {
        throw new Error(
          `Failed to get share token (HTTP ${shareResponse.status})`,
        );
      }

      const shareData = await shareResponse.json();

      if (!shareData?.share_token) {
        throw new Error("Share endpoint returned no share_token");
      }

      const shareUrl = `${window.location.origin}/intake/${shareData.share_token}`;

      await navigator.clipboard.writeText(shareUrl);

      alert(
        `Share link created and copied to clipboard!\n\n${shareUrl}\n\nSend this link to your client. They can fill out their case information without logging in.`,
      );

      fetchIntakes();
    } catch (err) {
      console.error("Error generating share link:", err);
      alert(
        err instanceof Error
          ? `Failed to generate share link: ${err.message}`
          : "Failed to generate share link. Please try again.",
      );
    } finally {
      setGeneratingLink(false);
    }
  };

  const total = intakes.length;
  const ready = intakes.filter((i) => i.status === "ready_for_review").length;
  const inProgress = intakes.filter(
    (i) => !["ready_for_review", "consultation_booked"].includes(i.status),
  ).length;
  const avgScore =
    intakes.length > 0
      ? Math.round(
          intakes.reduce((acc, i) => acc + getReadinessScore(i), 0) /
            intakes.length,
        )
      : 0;

  const filtered = intakes.filter((i) => {
    const fullName =
      `${i.client_first_name} ${i.client_last_name}`.toLowerCase();
    const matchSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      i.case_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = activeFilter === "all" || i.status === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-[#F7F8FB]">
      <MobileSidebar
        userName={userName}
        onSignOut={handleSignOut}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentPath={pathname}
      />
      <DesktopSidebar
        userName={userName}
        onSignOut={handleSignOut}
        currentPath={pathname}
      />

      <div className="lg:pl-64">
        <header className="bg-white/90 backdrop-blur border-b border-[#E8EAF1] sticky top-0 z-30">
          <div className="px-5 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 text-[#64748B] hover:bg-[#F7F8FB] rounded-lg transition"
                >
                  <Menu size={20} />
                </button>
                <div>
                  <h1
                    className="text-xl text-[#0E1320]"
                    style={{ fontFamily: SERIF }}
                  >
                    Dashboard
                  </h1>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Welcome back, {userName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative hidden sm:block">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                  />
                  <input
                    type="text"
                    placeholder="Search cases..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 pl-9 pr-3 py-1.5 text-sm border border-[#E0E4EE] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3B5BDB] focus:border-[#3B5BDB] placeholder:text-[#9AA3B5]"
                  />
                </div>
                <button
                  onClick={handleGenerateShareLink}
                  disabled={generatingLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E0E4EE] text-[#334155] text-sm font-medium rounded-lg hover:bg-[#F7F8FB] transition disabled:opacity-50"
                >
                  <Link2 size={14} />
                  {generatingLink ? "Creating..." : "Share Link"}
                </button>
                <NotificationBell />
                <Link
                  href="/dashboard/intakes/new"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3B5BDB] hover:bg-[#2F4AC2] text-white text-sm font-medium rounded-lg transition shadow-sm"
                >
                  <PlusCircle size={14} /> New Intake
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="px-5 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Cases"
              value={total}
              subtext={`${total} active case${total !== 1 ? "s" : ""}`}
              icon={<FileText size={16} className="text-[#3B5BDB]" />}
              iconBg="bg-[#EEF2FF]"
            />
            <StatCard
              label="Ready for Review"
              value={ready}
              subtext={`${Math.round((ready / (total || 1)) * 100)}% of total cases`}
              icon={<CheckCircle2 size={16} className="text-[#12A06E]" />}
              iconBg="bg-emerald-50"
            />
            <StatCard
              label="Needs Attention"
              value={inProgress}
              subtext="Missing information"
              icon={<AlertCircle size={16} className="text-[#C97A0A]" />}
              iconBg="bg-amber-50"
            />
            <StatCard
              label="Avg. Readiness"
              value={`${avgScore}%`}
              subtext="Across all active cases"
              icon={<Clock size={16} className="text-[#64748B]" />}
              iconBg="bg-[#F1F3F8]"
            />
          </div>

          <div className="bg-white rounded-2xl border border-[#E8EAF1] overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-[#EEF0F6] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm font-semibold text-[#0E1320]">
                  Active Cases
                </h2>
                <span
                  className="text-xs text-[#94A3B8]"
                  style={{ fontFamily: MONO }}
                >
                  {filtered.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {[
                  { key: "all", label: "All cases" },
                  { key: "ready_for_review", label: "Ready" },
                  { key: "draft", label: "Draft" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key as any)}
                    className={`text-xs font-medium px-2.5 py-1 rounded-md transition ${activeFilter === f.key ? "bg-[#EEF2FF] text-[#3B5BDB]" : "text-[#64748B] hover:bg-[#F7F8FB] hover:text-[#334155]"}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Column headers (desktop) */}
            {!loading && !error && filtered.length > 0 && (
              <div className="hidden lg:grid lg:grid-cols-[1.8fr_1.2fr_1.2fr_140px_100px_40px] gap-4 px-5 py-2.5 border-b border-[#EEF0F6] bg-[#FAFBFD]">
                {[
                  "Client",
                  "Case type",
                  "Readiness",
                  "Status",
                  "Created",
                  "",
                ].map((h, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]"
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}

            {loading && (
              <div className="px-5 py-12 text-center">
                <div className="animate-pulse space-y-3 max-w-sm mx-auto">
                  <div className="h-3 bg-[#EEF0F6] rounded w-3/4 mx-auto" />
                  <div className="h-3 bg-[#EEF0F6] rounded w-1/2 mx-auto" />
                </div>
              </div>
            )}
            {!loading && error && (
              <div className="px-5 py-6 flex items-start gap-3 bg-red-50">
                <AlertCircle
                  size={16}
                  className="text-[#C93B3B] flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Could not load cases
                  </p>
                  <p className="text-xs text-red-600 mt-0.5">{error}</p>
                  <button
                    onClick={fetchIntakes}
                    className="text-xs font-medium text-[#3B5BDB] mt-2 hover:underline"
                  >
                    Try again →
                  </button>
                </div>
              </div>
            )}
            {!loading && !error && intakes.length === 0 && (
              <div className="px-5 py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-[#F1F3F8] flex items-center justify-center mx-auto mb-3">
                  <FileText size={20} className="text-[#C2C9D6]" />
                </div>
                <h3 className="text-sm font-medium text-[#0E1320] mb-1">
                  No cases yet
                </h3>
                <p className="text-xs text-[#94A3B8] mb-4 max-w-xs mx-auto">
                  Create an intake yourself, or use Share Link to send a form
                  your client can fill out without logging in.
                </p>
                <Link
                  href="/dashboard/intakes/new"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3B5BDB] text-white text-sm font-medium rounded-lg hover:bg-[#2F4AC2] transition"
                >
                  <PlusCircle size={14} /> New Intake
                </Link>
              </div>
            )}

            {!loading &&
              !error &&
              filtered.map((intake, idx) => {
                const score = getReadinessScore(intake);
                const initials = getInitials(
                  intake.client_first_name,
                  intake.client_last_name,
                );
                const { bg, text } = getAvatarColors(intake.client_first_name);
                return (
                  <Link
                    key={intake.id}
                    href={`/dashboard/intakes/${intake.id}`}
                    className="block hover:bg-[#FAFBFD] transition-colors"
                  >
                    <div
                      className={`${idx < filtered.length - 1 ? "border-b border-[#F1F3F8]" : ""}`}
                    >
                      <div className="p-4 lg:hidden">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full ${bg} ${text} text-sm font-medium flex items-center justify-center`}
                            >
                              {initials || "?"}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#0E1320]">
                                {intake.client_first_name}{" "}
                                {intake.client_last_name}
                              </p>
                              <p className="text-xs text-[#94A3B8]">
                                {formatCaseType(intake.case_type)}
                              </p>
                            </div>
                          </div>
                          <StatusBadge status={intake.status} />
                        </div>
                        <div className="flex items-center justify-between">
                          <ReadinessIndicator score={score} />
                          <p
                            className="text-xs text-[#94A3B8]"
                            style={{ fontFamily: MONO }}
                          >
                            {formatDate(intake.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="hidden lg:grid lg:grid-cols-[1.8fr_1.2fr_1.2fr_140px_100px_40px] gap-4 px-5 py-3.5 items-center">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full ${bg} ${text} text-xs font-medium flex items-center justify-center flex-shrink-0`}
                          >
                            {initials || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#0E1320] truncate">
                              {intake.client_first_name}{" "}
                              {intake.client_last_name}
                            </p>
                            {intake.client_email && (
                              <p className="text-xs text-[#94A3B8] truncate">
                                {intake.client_email}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-[#475569] truncate">
                          {formatCaseType(intake.case_type)}
                        </p>
                        <ReadinessIndicator score={score} />
                        <StatusBadge status={intake.status} />
                        <p
                          className="text-xs text-[#64748B]"
                          style={{ fontFamily: MONO }}
                        >
                          {formatDate(intake.created_at)}
                        </p>
                        <ChevronRight size={14} className="text-[#C2C9D6]" />
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        </main>
      </div>
    </div>
  );
}
