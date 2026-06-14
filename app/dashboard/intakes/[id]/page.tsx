"use client";

import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  Link2,
  Check,
  Menu,
} from "lucide-react";

import { DesktopSidebar, MobileSidebar } from "@/components/Sidebar";

const SERIF = "'DM Serif Display', Georgia, serif";
const MONO = "'DM Mono', ui-monospace, monospace";

interface Intake {
  id: string;
  client_first_name: string;
  client_last_name: string;
  client_email: string | null;
  client_phone: string | null;
  case_type: string;
  case_data: Record<string, any>;
  status: string;
  created_at: string;
}

function scoreColor(score: number) {
  return score >= 80 ? "#12A06E" : score >= 50 ? "#C97A0A" : "#C93B3B";
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
    raw?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "ready_for_review":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF3] text-xs font-medium text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-[#12A06E]" /> Ready for
          Review
        </span>
      );
    case "consultation_booked":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EEF2FF] text-xs font-medium text-[#3B5BDB]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3B5BDB]" />{" "}
          Consultation Booked
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F1F3F8] text-xs font-medium text-[#64748B]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A9B1C2]" /> Draft
        </span>
      );
  }
}

function MiniRing({ score }: { score: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = scoreColor(score);

  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#EEF0F6"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 600ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-2xl font-medium"
          style={{ color, fontFamily: MONO }}
        >
          {score}%
        </span>
      </div>
    </div>
  );
}

export default function IntakeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const [intake, setIntake] = useState<Intake | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [userName, setUserName] = useState("Attorney");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createClient();

  const intakeId = params.id as string;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserName(
          data.user.user_metadata?.full_name ??
            data.user.email?.split("@")[0] ??
            "Attorney",
        );
      }
    });
    if (intakeId) {
      fetchIntake();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intakeId]);

  const fetchIntake = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/intakes/${intakeId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("Intake not found");
        } else if (response.status === 401) {
          setError("Please log in to view this intake");
          router.push("/login");
        } else {
          setError("Failed to load intake");
        }
        return;
      }

      const data = await response.json();
      setIntake(data);

      const reportResponse = await fetch(`/api/intakes/${intakeId}/readiness`);
      if (reportResponse.ok) {
        const reportData = await reportResponse.json();
        if (reportData && reportData.id) {
          setReport(reportData);
        }
      }
    } catch (err) {
      console.error("Error fetching intake:", err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setGenerating(true);
      const response = await fetch(`/api/intakes/${intakeId}/readiness`, {
        method: "POST",
      });
      if (response.ok) {
        const reportData = await response.json();
        setReport(reportData);
      } else {
        alert("Failed to generate report");
      }
    } catch (err) {
      console.error("Error generating report:", err);
      alert("Error generating report");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await fetch(`/api/intakes/${intakeId}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `intake-${intakeId}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert("Failed to generate report file");
      }
    } catch (err) {
      console.error("Error downloading report:", err);
      alert("Error downloading report");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/intakes/${intakeId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        router.push("/dashboard");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete intake");
      }
    } catch (err) {
      console.error("Error deleting intake:", err);
      alert("Error deleting intake");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleShareLink = async () => {
    try {
      const tokenResponse = await fetch(`/api/intakes/${intakeId}/share`);
      if (!tokenResponse.ok) {
        throw new Error("Failed to get share link");
      }

      const tokenData = await tokenResponse.json();
      const shareUrl = `${window.location.origin}/intake/${tokenData.share_token}`;

      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    } catch (err) {
      console.error("Error getting share link:", err);
      alert("Failed to generate share link. Please try again.");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

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

      {/* Delete confirmation */}
      {showDeleteConfirm && intake && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] px-4">
          <div className="bg-white rounded-2xl border border-[#E8EAF1] p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-[#0E1320] mb-2">
              Delete this intake?
            </h3>
            <p className="text-sm text-[#475569] mb-6">
              This permanently removes the intake for{" "}
              <strong>
                {intake.client_first_name} {intake.client_last_name}
              </strong>{" "}
              and its readiness report. This can&rsquo;t be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-[#E0E4EE] rounded-lg text-sm font-medium text-[#334155] hover:bg-[#F7F8FB]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-[#C93B3B] text-white text-sm font-medium rounded-lg hover:bg-[#B22F2F] disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete intake"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copied toast */}
      {shareCopied && (
        <div className="fixed bottom-4 right-4 bg-white border border-[#E8EAF1] rounded-xl px-4 py-3 flex items-center gap-2 shadow-lg z-[60]">
          <Check size={16} className="text-[#12A06E]" />
          <span className="text-sm text-[#0E1320]">
            Share link copied to clipboard
          </span>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="bg-white/90 backdrop-blur border-b border-[#E8EAF1] sticky top-0 z-30">
          <div className="px-5 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-[#64748B] hover:bg-[#F7F8FB] rounded-lg transition"
              >
                <Menu size={20} />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <h1
                    className="text-xl text-[#0E1320] truncate"
                    style={{ fontFamily: SERIF }}
                  >
                    {intake
                      ? `${intake.client_first_name} ${intake.client_last_name}`
                      : "Intake"}
                  </h1>
                  {intake && <StatusBadge status={intake.status} />}
                </div>
                {intake && (
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    {formatCaseType(intake.case_type)} &middot; Created{" "}
                    <span style={{ fontFamily: MONO }}>
                      {new Date(intake.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </p>
                )}
              </div>
            </div>
            {intake && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E0E4EE] text-[#334155] text-sm font-medium rounded-lg hover:bg-[#F7F8FB] transition"
                >
                  <Link2 size={14} />
                  <span className="hidden sm:inline">
                    {shareCopied ? "Copied!" : "Share link"}
                  </span>
                </button>
                <button
                  onClick={generateReport}
                  disabled={generating}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3B5BDB] hover:bg-[#2F4AC2] text-white text-sm font-medium rounded-lg transition shadow-sm disabled:opacity-50"
                >
                  <FileText size={14} />
                  <span className="hidden sm:inline">
                    {generating ? "Generating..." : "Generate report"}
                  </span>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  aria-label="Delete intake"
                  className="p-2 text-[#94A3B8] hover:text-[#C93B3B] hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="px-5 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0E1320] mb-6 transition"
            >
              <ArrowLeft size={15} /> Back to dashboard
            </Link>

            {loading && (
              <div className="bg-white rounded-2xl border border-[#E8EAF1] shadow-sm py-20 flex items-center justify-center gap-3 text-[#64748B]">
                <div className="w-4 h-4 border-2 border-[#3B5BDB] border-t-transparent rounded-full animate-spin" />
                Loading intake...
              </div>
            )}

            {!loading && (error || !intake) && (
              <div className="bg-white rounded-2xl border border-[#E8EAF1] shadow-sm p-10 text-center">
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={24} className="text-[#C93B3B]" />
                </div>
                <h2 className="text-lg font-semibold text-[#0E1320] mb-1.5">
                  {error || "Intake not found"}
                </h2>
                <Link
                  href="/dashboard"
                  className="inline-block mt-4 px-4 py-2.5 bg-[#3B5BDB] text-white text-sm font-medium rounded-lg hover:bg-[#2F4AC2] transition"
                >
                  Back to dashboard
                </Link>
              </div>
            )}

            {!loading && intake && (
              <div className="grid lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-6">
                  <section className="bg-white rounded-2xl border border-[#E8EAF1] shadow-sm p-6 sm:p-7">
                    <h2 className="text-sm font-semibold text-[#0E1320] mb-5">
                      Client Information
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.12em] mb-1">
                          Full name
                        </p>
                        <p className="text-sm font-medium text-[#0E1320]">
                          {intake.client_first_name} {intake.client_last_name}
                        </p>
                      </div>
                      {intake.client_email && (
                        <div>
                          <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.12em] mb-1">
                            Email
                          </p>
                          <p
                            className="text-sm text-[#0E1320]"
                            style={{ fontFamily: MONO }}
                          >
                            {intake.client_email}
                          </p>
                        </div>
                      )}
                      {intake.client_phone && (
                        <div>
                          <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.12em] mb-1">
                            Phone
                          </p>
                          <p
                            className="text-sm text-[#0E1320]"
                            style={{ fontFamily: MONO }}
                          >
                            {intake.client_phone}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.12em] mb-1">
                          Case type
                        </p>
                        <p className="text-sm text-[#0E1320]">
                          {formatCaseType(intake.case_type)}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="bg-white rounded-2xl border border-[#E8EAF1] shadow-sm p-6 sm:p-7">
                    <h2 className="text-sm font-semibold text-[#0E1320] mb-5">
                      Case Details
                    </h2>
                    {Object.keys(intake.case_data || {}).length === 0 ? (
                      <p className="text-sm text-[#94A3B8] py-4 text-center">
                        Nothing here yet — share the intake link with your
                        client to collect case details.
                      </p>
                    ) : (
                      <div className="space-y-5">
                        {Object.entries(intake.case_data).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="pb-5 border-b border-[#F1F3F8] last:border-0 last:pb-0"
                            >
                              <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.12em] mb-1.5">
                                {key.replace(/_/g, " ")}
                              </p>
                              <p className="text-sm text-[#334155] leading-relaxed whitespace-pre-wrap">
                                {String(value)}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </section>
                </div>

                <aside className="bg-white rounded-2xl border border-[#E8EAF1] shadow-sm overflow-hidden lg:sticky lg:top-24">
                  <div className="px-6 py-4 border-b border-[#EEF0F6]">
                    <h2 className="text-sm font-semibold text-[#0E1320]">
                      Readiness Report
                    </h2>
                  </div>

                  {report ? (
                    <div className="p-6">
                      <MiniRing score={report.overall_score} />

                      {report.missing_fields &&
                      report.missing_fields.length > 0 ? (
                        <div className="mt-5">
                          <div className="flex items-center gap-2 mb-2.5">
                            <AlertCircle size={14} className="text-[#C97A0A]" />
                            <p className="text-xs font-semibold text-[#0E1320]">
                              Missing
                            </p>
                            <span
                              className="text-xs text-[#94A3B8]"
                              style={{ fontFamily: MONO }}
                            >
                              {report.missing_fields.length}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {report.missing_fields.map(
                              (item: any, idx: number) => (
                                <p
                                  key={idx}
                                  className="text-xs text-[#9A6B14] bg-[#FFF8EB] border border-amber-100 rounded-lg px-3 py-2 capitalize"
                                >
                                  {item.field.replace(/_/g, " ")}
                                </p>
                              ),
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-5 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#ECFDF3] text-xs font-medium text-emerald-700">
                          <CheckCircle2 size={14} className="text-[#12A06E]" />
                          All required fields complete
                        </div>
                      )}

                      <Link
                        href={`/dashboard/intakes/${intakeId}/readiness`}
                        className="block mt-5 text-center text-sm font-medium text-[#3B5BDB] hover:text-[#2F4AC2]"
                      >
                        View full report →
                      </Link>

                      <button
                        onClick={handleDownloadReport}
                        className="w-full mt-4 px-4 py-2.5 bg-[#3B5BDB] text-white text-sm font-medium rounded-lg hover:bg-[#2F4AC2] transition flex items-center justify-center gap-2"
                      >
                        <Download size={15} /> Download report
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-[#F1F3F8] flex items-center justify-center mx-auto mb-3">
                        <FileText size={18} className="text-[#C2C9D6]" />
                      </div>
                      <p className="text-sm text-[#64748B] mb-4">
                        No report yet — generate one to see what&rsquo;s
                        missing.
                      </p>
                      <button
                        onClick={generateReport}
                        disabled={generating}
                        className="px-4 py-2.5 bg-[#3B5BDB] text-white text-sm font-medium rounded-lg hover:bg-[#2F4AC2] transition disabled:opacity-50"
                      >
                        {generating ? "Generating..." : "Generate report"}
                      </button>
                    </div>
                  )}
                </aside>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
