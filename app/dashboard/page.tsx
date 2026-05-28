"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Briefcase, Menu, X } from "lucide-react";

const B = "#3B5BDB";
const BT = "#EEF2FF";

interface Intake {
  id: string;
  client_first_name: string;
  client_last_name: string;
  case_type: string;
  client_email?: string;
  status: string;
  created_at: string;
  case_data?: Record<string, any>;
}

function getInitials(first: string, last: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

function formatCaseType(raw: string) {
  return raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function calculateReadinessScore(intake: Intake): number {
  const caseData = intake.case_data || {};
  const requiredFields = [
    "incident_date",
    "injury_description",
    "medical_providers",
    "liability_description",
  ];
  const filledFields = requiredFields.filter(
    (field) => caseData[field] && caseData[field] !== "",
  );

  if (intake.status === "ready_for_review") return 85;
  if (intake.status === "consultation_booked") return 100;
  if (filledFields.length === 0) return 25;

  return Math.min(
    95,
    Math.max(
      30,
      Math.floor((filledFields.length / requiredFields.length) * 90) + 10,
    ),
  );
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-500";
}

function getScoreBarColor(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-400";
  return "bg-red-400";
}

function getAvatarColors(name: string): { bg: string; text: string } {
  const colors = [
    { bg: "bg-blue-100", text: "text-blue-700" },
    { bg: "bg-amber-100", text: "text-amber-700" },
    { bg: "bg-purple-100", text: "text-purple-700" },
    { bg: "bg-emerald-100", text: "text-emerald-700" },
    { bg: "bg-pink-100", text: "text-pink-700" },
    { bg: "bg-indigo-100", text: "text-indigo-700" },
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "ready_for_review":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Ready
        </span>
      );
    case "consultation_booked":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full bg-blue-50 text-blue-700">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Booked
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full bg-gray-100 text-gray-500">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          Draft
        </span>
      );
  }
}

function StatCard({
  label,
  value,
  delta,
  icon,
}: {
  label: string;
  value: string | number;
  delta: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-500">
            {label}
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
            {value}
          </p>
        </div>
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
      </div>
      <p className="text-[10px] sm:text-xs text-gray-400">{delta}</p>
    </div>
  );
}

// Mobile Sidebar Component - Auto closes on navigation
function MobileSidebar({
  userName,
  onSignOut,
  isOpen,
  onClose,
}: {
  userName: string;
  onSignOut: () => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const handleLinkClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      <aside className="fixed top-0 left-0 h-full w-64 bg-white z-50 flex flex-col shadow-xl lg:hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3B5BDB] flex items-center justify-center">
              <Briefcase size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">
              Case<span className="text-[#3B5BDB]">Ready</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#EEF2FF] flex items-center justify-center">
              <span className="text-[#3B5BDB] text-sm font-semibold">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{userName}</p>
              <p className="text-xs text-gray-400">Solo Practitioner</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          <Link
            href="/dashboard"
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-[#EEF2FF] text-[#3B5BDB] transition-all"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Dashboard
          </Link>
          <Link
            href="/dashboard/intakes/new"
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Intake
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => {
              onSignOut();
              onClose();
            }}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

// Desktop Sidebar
function DesktopSidebar({
  userName,
  onSignOut,
}: {
  userName: string;
  onSignOut: () => void;
}) {
  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-50 flex-col hidden lg:flex">
      <div className="px-6 py-5 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#3B5BDB] flex items-center justify-center">
            <Briefcase size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">
            Case<span className="text-[#3B5BDB]">Ready</span>
          </span>
        </Link>
      </div>

      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#EEF2FF] flex items-center justify-center">
            <span className="text-[#3B5BDB] text-sm font-semibold">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{userName}</p>
            <p className="text-xs text-gray-400">Solo Practitioner</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-[#EEF2FF] text-[#3B5BDB] transition-all"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          Dashboard
        </Link>
        <Link
          href="/dashboard/intakes/new"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Intake
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default function DashboardPage() {
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Attorney");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "ready_for_review" | "draft"
  >("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const total = intakes.length;
  const ready = intakes.filter((i) => i.status === "ready_for_review").length;
  const inProgress = intakes.filter(
    (i) => !["ready_for_review", "consultation_booked"].includes(i.status),
  ).length;
  const avgScore =
    intakes.length > 0
      ? Math.round(
          intakes.reduce((acc, i) => acc + calculateReadinessScore(i), 0) /
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
    <div className="min-h-screen bg-gray-50">
      <MobileSidebar
        userName={userName}
        onSignOut={handleSignOut}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <DesktopSidebar userName={userName} onSignOut={handleSignOut} />

      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Title and Mobile Menu Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                  >
                    <Menu size={20} />
                  </button>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Dashboard
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                      Welcome back, {userName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Search and New Intake */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent"
                  />
                </div>
                <Link
                  href="/dashboard/intakes/new"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[#3B5BDB] hover:bg-[#2F4AC2] text-white text-sm font-semibold rounded-lg transition shadow-sm"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  New Intake
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">
            <StatCard
              label="Total Cases"
              value={total}
              delta={`${total} active case${total !== 1 ? "s" : ""}`}
              icon={
                <svg
                  className="w-5 h-5 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              }
            />
            <StatCard
              label="Ready for Review"
              value={ready}
              delta={`${Math.round((ready / (total || 1)) * 100)}% of total cases`}
              icon={
                <svg
                  className="w-5 h-5 text-emerald-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              }
            />
            <StatCard
              label="Needs Attention"
              value={inProgress}
              delta="Missing information"
              icon={
                <svg
                  className="w-5 h-5 text-amber-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              }
            />
            <StatCard
              label="Avg. Readiness"
              value={`${avgScore}%`}
              delta="Across all active cases"
              icon={
                <svg
                  className="w-5 h-5 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              }
            />
          </div>

          {/* Intakes Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                  Client Intakes
                </h2>
                <span className="text-xs sm:text-sm text-gray-400">
                  {filtered.length} case{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {[
                  { key: "all", label: "All" },
                  { key: "ready_for_review", label: "Ready" },
                  { key: "draft", label: "Draft" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key as any)}
                    className={`text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-lg transition ${
                      activeFilter === f.key
                        ? "bg-[#EEF2FF] text-[#3B5BDB]"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="px-4 sm:px-6 py-12 text-center">
                <div className="animate-pulse space-y-3 max-w-sm mx-auto">
                  <div className="h-4 bg-gray-100 rounded w-3/4 mx-auto" />
                  <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto" />
                </div>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="px-4 sm:px-6 py-6 flex items-start gap-3 bg-red-50">
                <svg
                  className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-red-700">
                    Could not load intakes
                  </p>
                  <p className="text-xs text-red-500 mt-0.5">{error}</p>
                  <button
                    onClick={fetchIntakes}
                    className="text-xs font-semibold text-[#3B5BDB] mt-2 hover:underline"
                  >
                    Try again →
                  </button>
                </div>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && intakes.length === 0 && (
              <div className="px-4 sm:px-6 py-12 sm:py-16 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  No intakes yet
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  Create your first client intake to start tracking readiness
                  scores.
                </p>
                <Link
                  href="/dashboard/intakes/new"
                  className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 bg-[#3B5BDB] hover:bg-[#2F4AC2] text-white text-sm font-semibold rounded-lg transition"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Create first intake
                </Link>
              </div>
            )}

            {/* Table Rows - Mobile Card Layout */}
            {!loading &&
              !error &&
              filtered.map((intake, idx) => {
                const score = calculateReadinessScore(intake);
                const initials = getInitials(
                  intake.client_first_name,
                  intake.client_last_name,
                );
                const { bg, text } = getAvatarColors(intake.client_first_name);

                return (
                  <Link
                    key={intake.id}
                    href={`/dashboard/intakes/${intake.id}`}
                    className={`block hover:bg-gray-50 transition-colors ${idx < filtered.length - 1 ? "border-b border-gray-50" : ""}`}
                  >
                    {/* Mobile Card Layout */}
                    <div className="p-4 sm:p-6 lg:hidden">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full ${bg} ${text} text-sm font-bold flex items-center justify-center`}
                          >
                            {initials || "?"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {intake.client_first_name}{" "}
                              {intake.client_last_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatCaseType(intake.case_type)}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={intake.status} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <p className="text-xs text-gray-400">Readiness</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${getScoreBarColor(score)}`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                            <span
                              className={`text-xs font-semibold ${getScoreColor(score)}`}
                            >
                              {score}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Created</p>
                          <p className="text-xs text-gray-600">
                            {formatDate(intake.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Table Layout */}
                    <div className="hidden lg:grid lg:grid-cols-[2fr_1.2fr_130px_100px_100px_80px] gap-4 px-6 py-4 items-center">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full ${bg} ${text} text-sm font-bold flex items-center justify-center`}
                        >
                          {initials || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {intake.client_first_name} {intake.client_last_name}
                          </p>
                          {intake.client_email && (
                            <p className="text-xs text-gray-400">
                              {intake.client_email}
                            </p>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600">
                        {formatCaseType(intake.case_type)}
                      </p>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getScoreBarColor(score)}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span
                          className={`text-sm font-semibold w-8 text-right ${getScoreColor(score)}`}
                        >
                          {score}%
                        </span>
                      </div>

                      <StatusBadge status={intake.status} />
                      <p className="text-sm text-gray-500">
                        {formatDate(intake.created_at)}
                      </p>

                      <div className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
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
