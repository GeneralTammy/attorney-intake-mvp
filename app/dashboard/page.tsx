"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Briefcase,
  Menu,
  X,
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  LayoutDashboard,
  PlusCircle,
} from "lucide-react";
import {
  getNotifications,
  saveNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  addNotification,
  Notification,
} from "@/lib/notifications";

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

function getReadinessColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-500";
}

function getReadinessBarColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-400";
  return "bg-red-400";
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
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "ready_for_review":
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-emerald-700">
            Ready for Review
          </span>
        </div>
      );
    case "consultation_booked":
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-xs font-medium text-blue-700">
            Consultation Booked
          </span>
        </div>
      );
    default:
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          <span className="text-xs font-medium text-gray-500">Draft</span>
        </div>
      );
  }
}

function ReadinessIndicator({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${getReadinessBarColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-sm font-medium w-9 ${getReadinessColor(score)}`}>
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
}: {
  label: string;
  value: string | number;
  subtext: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <p className="text-sm font-medium text-gray-700 mt-1">{label}</p>
      <p className="text-xs text-gray-400 mt-1">{subtext}</p>
    </div>
  );
}

// Notification Bell Component
function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = getUnreadCount();

  useEffect(() => {
    setNotifications(getNotifications());
    const handleStorageChange = () => {
      setNotifications(getNotifications());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    setNotifications(getNotifications());
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    setNotifications(getNotifications());
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition"
      >
        <Bell size={14} className="text-gray-500" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-medium flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-gray-100 shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-[#3B5BDB] hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No notifications</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleMarkAsRead(notif.id)}
                    className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${!notif.read ? "bg-blue-50/30" : ""}`}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 ${
                          notif.type === "ready"
                            ? "bg-emerald-500"
                            : notif.type === "missing"
                              ? "bg-amber-500"
                              : notif.type === "success"
                                ? "bg-blue-500"
                                : "bg-gray-400"
                        }`}
                      />
                      <div className="flex-1">
                        <p
                          className={`text-sm ${!notif.read ? "font-medium text-gray-900" : "text-gray-700"}`}
                        >
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notif.time}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#3B5BDB] mt-1.5" />
                      )}
                    </div>
                    {notif.intakeId && (
                      <Link
                        href={`/dashboard/intakes/${notif.intakeId}`}
                        className="text-xs text-[#3B5BDB] mt-2 inline-block hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View case →
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Sidebar Component
function Sidebar({
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
    <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-50 flex flex-col">
      <div className="px-5 py-5 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#3B5BDB] flex items-center justify-center">
            <Briefcase size={15} className="text-white" />
          </div>
          <span className="font-semibold text-base text-gray-900">
            Case<span className="text-[#3B5BDB]">Ready</span>
          </span>
        </Link>
      </div>

      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center">
            <span className="text-[#3B5BDB] text-sm font-medium">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userName}
            </p>
            <p className="text-xs text-gray-400">Solo Practitioner</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5">
        <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-3 pb-2">
          Main
        </div>
        {navItems.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-[#EEF2FF] text-[#3B5BDB] font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon
                size={16}
                className={isActive ? "text-[#3B5BDB]" : "text-gray-400"}
              />
              {item.label}
            </Link>
          );
        })}

        <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-3 pb-2 pt-6">
          Account
        </div>
        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
            currentPath === "/dashboard/settings"
              ? "bg-[#EEF2FF] text-[#3B5BDB] font-medium"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <Settings
            size={16}
            className={
              currentPath === "/dashboard/settings"
                ? "text-[#3B5BDB]"
                : "text-gray-400"
            }
          />
          Settings
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
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
}: {
  userName: string;
  onSignOut: () => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/intakes/new", label: "New Intake", icon: PlusCircle },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        onClick={onClose}
      />
      <aside className="fixed top-0 left-0 h-full w-72 bg-white z-50 flex flex-col shadow-xl lg:hidden">
        <div className="px-5 py-5 border-b border-gray-100 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3B5BDB] flex items-center justify-center">
              <Briefcase size={15} className="text-white" />
            </div>
            <span className="font-semibold text-base text-gray-900">
              Case<span className="text-[#3B5BDB]">Ready</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center">
              <span className="text-[#3B5BDB] text-sm font-medium">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-400">Solo Practitioner</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-0.5">
          <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-3 pb-2">
            Main
          </div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
            >
              <item.icon size={16} className="text-gray-400" /> {item.label}
            </Link>
          ))}
          <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-3 pb-2 pt-6">
            Account
          </div>
          <Link
            href="/dashboard/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
          >
            <Settings size={16} className="text-gray-400" /> Settings
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => {
              onSignOut();
              onClose();
            }}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
    </>
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
      <Sidebar
        userName={userName}
        onSignOut={handleSignOut}
        currentPath="/dashboard"
      />

      <div className="lg:pl-64">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="px-5 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                >
                  <Menu size={20} />
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    Dashboard
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Welcome back, {userName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative hidden sm:block">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search cases..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3B5BDB] focus:border-[#3B5BDB]"
                  />
                </div>
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
              icon={<FileText size={16} className="text-gray-500" />}
            />
            <StatCard
              label="Ready for Review"
              value={ready}
              subtext={`${Math.round((ready / (total || 1)) * 100)}% of total cases`}
              icon={<CheckCircle2 size={16} className="text-emerald-500" />}
            />
            <StatCard
              label="Needs Attention"
              value={inProgress}
              subtext="Missing information"
              icon={<AlertCircle size={16} className="text-amber-500" />}
            />
            <StatCard
              label="Avg. Readiness"
              value={`${avgScore}%`}
              subtext="Across all active cases"
              icon={<Clock size={16} className="text-gray-500" />}
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-900">
                  Active Cases
                </h2>
                <span className="text-xs text-gray-400">
                  {filtered.length} case{filtered.length !== 1 ? "s" : ""}
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
                    className={`text-xs font-medium px-2.5 py-1 rounded-md transition ${activeFilter === f.key ? "bg-[#EEF2FF] text-[#3B5BDB]" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {loading && (
              <div className="px-5 py-12 text-center">
                <div className="animate-pulse space-y-3 max-w-sm mx-auto">
                  <div className="h-3 bg-gray-100 rounded w-3/4 mx-auto" />
                  <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto" />
                </div>
              </div>
            )}
            {!loading && error && (
              <div className="px-5 py-6 flex items-start gap-3 bg-red-50">
                <AlertCircle
                  size={16}
                  className="text-red-500 flex-shrink-0 mt-0.5"
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
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <FileText size={20} className="text-gray-300" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  No cases yet
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  Create your first client intake to get started.
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
                    <div className="p-4 lg:hidden">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full ${bg} ${text} text-sm font-medium flex items-center justify-center`}
                          >
                            {initials || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
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
                      <div className="flex items-center justify-between">
                        <ReadinessIndicator score={score} />
                        <p className="text-xs text-gray-400">
                          {formatDate(intake.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="hidden lg:grid lg:grid-cols-[1.8fr_1.2fr_1.2fr_100px_100px_40px] gap-4 px-5 py-3.5 items-center">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full ${bg} ${text} text-xs font-medium flex items-center justify-center flex-shrink-0`}
                        >
                          {initials || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {intake.client_first_name} {intake.client_last_name}
                          </p>
                          {intake.client_email && (
                            <p className="text-xs text-gray-400 truncate">
                              {intake.client_email}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {formatCaseType(intake.case_type)}
                      </p>
                      <ReadinessIndicator score={score} />
                      <StatusBadge status={intake.status} />
                      <p className="text-xs text-gray-500">
                        {formatDate(intake.created_at)}
                      </p>
                      <ChevronRight size={14} className="text-gray-300" />
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
