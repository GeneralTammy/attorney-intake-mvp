"use client";

import { createClient } from "@/lib/supabase/client";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  AlertCircle,
  Menu,
  Loader2,
} from "lucide-react";

import { DesktopSidebar, MobileSidebar } from "@/components/Sidebar";

const SERIF = "'DM Serif Display', Georgia, serif";
const MONO = "'DM Mono', ui-monospace, monospace";

interface ReadinessReport {
  id: string;
  overall_score: number;
  missing_fields: Array<{ field: string; reason: string }>;
  completed_fields: Array<{ field: string; value: any }>;
  generated_at: string;
}

interface Intake {
  id: string;
  client_first_name: string;
  client_last_name: string;
  case_type: string;
}

function scoreColor(score: number) {
  return score >= 80 ? "#12A06E" : score >= 50 ? "#C97A0A" : "#C93B3B";
}

function getStatusText(score: number) {
  if (score >= 80) return "Ready for Consultation";
  if (score >= 50) return "Partially Ready";
  return "Not Ready";
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

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = scoreColor(score);

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg viewBox="0 0 124 124" className="w-full h-full -rotate-90">
        <circle
          cx="62"
          cy="62"
          r={r}
          fill="none"
          stroke="#EEF0F6"
          strokeWidth="10"
        />
        <circle
          cx="62"
          cy="62"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 600ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-medium leading-none"
          style={{ color, fontFamily: MONO }}
        >
          {score}%
        </span>
        <span className="text-[10px] text-[#94A3B8] font-medium uppercase tracking-[0.12em] mt-1.5">
          Readiness
        </span>
      </div>
    </div>
  );
}

export default function ReadinessReportPage() {
  const params = useParams();
  const pathname = usePathname();
  const [report, setReport] = useState<ReadinessReport | null>(null);
  const [intake, setIntake] = useState<Intake | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("Attorney");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createClient();

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
    fetchIntakeAndReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchIntakeAndReport = async () => {
    setLoading(true);
    try {
      const intakeRes = await fetch(`/api/intakes/${params.id}`);
      if (intakeRes.ok) {
        const intakeData = await intakeRes.json();
        setIntake(intakeData);
      }

      const reportRes = await fetch(`/api/intakes/${params.id}/readiness`);
      if (reportRes.ok) {
        const reportData = await reportRes.json();
        if (reportData && reportData.id) {
          setReport(reportData);
        } else {
          await generateReport();
        }
      } else {
        await generateReport();
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const response = await fetch(`/api/intakes/${params.id}/readiness`, {
        method: "POST",
      });
      if (response.ok) {
        const reportData = await response.json();
        setReport(reportData);
      } else {
        setError("Failed to generate report");
      }
    } catch (err) {
      console.error("Error generating report:", err);
      setError("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await fetch(`/api/intakes/${params.id}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `case-readiness-report-${params.id}.html`;
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const color = report ? scoreColor(report.overall_score) : "#3B5BDB";

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
          <div className="px-5 lg:px-8 py-3 flex items-center justify-between">
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
                  Readiness Report
                </h1>
                {intake && (
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    {intake.client_first_name} {intake.client_last_name}{" "}
                    &middot; {formatCaseType(intake.case_type)}
                  </p>
                )}
              </div>
            </div>
            {report && (
              <button
                onClick={handleDownloadReport}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#3B5BDB] text-white text-sm font-medium rounded-lg hover:bg-[#2F4AC2] transition shadow-sm"
              >
                <Download size={15} />{" "}
                <span className="hidden sm:inline">Download report</span>
              </button>
            )}
          </div>
        </header>

        <main className="px-5 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <Link
              href={`/dashboard/intakes/${params.id}`}
              className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0E1320] mb-6 transition"
            >
              <ArrowLeft size={15} /> Back to intake
            </Link>

            {(loading || generating) && (
              <div className="bg-white rounded-2xl border border-[#E8EAF1] shadow-sm py-20 flex flex-col items-center gap-4">
                <Loader2 size={28} className="animate-spin text-[#3B5BDB]" />
                <p className="text-sm text-[#64748B]">
                  {generating
                    ? "Generating readiness report..."
                    : "Loading readiness report..."}
                </p>
              </div>
            )}

            {!loading && !generating && (error || !report) && (
              <div className="bg-white rounded-2xl border border-[#E8EAF1] shadow-sm p-10 text-center">
                <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={24} className="text-[#C97A0A]" />
                </div>
                <h2 className="text-lg font-semibold text-[#0E1320] mb-1.5">
                  Unable to load report
                </h2>
                <p className="text-sm text-[#64748B] mb-6">
                  {error || "Report not found"}
                </p>
                <Link
                  href={`/dashboard/intakes/${params.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3B5BDB] text-white text-sm font-medium rounded-lg hover:bg-[#2F4AC2] transition"
                >
                  Go to intake details
                </Link>
              </div>
            )}

            {!loading && !generating && report && (
              <div className="bg-white rounded-2xl border border-[#E8EAF1] shadow-sm overflow-hidden">
                <div className="px-8 py-10 border-b border-[#EEF0F6] text-center">
                  <ScoreRing score={report.overall_score} />
                  <div
                    className="inline-block mt-5 px-4 py-1.5 rounded-full text-sm font-semibold"
                    style={{
                      color,
                      background:
                        report.overall_score >= 80
                          ? "#ECFDF3"
                          : report.overall_score >= 50
                            ? "#FFF8EB"
                            : "#FEF2F2",
                    }}
                  >
                    {getStatusText(report.overall_score)}
                  </div>
                  <p
                    className="text-xs text-[#94A3B8] mt-4"
                    style={{ fontFamily: MONO }}
                  >
                    Generated{" "}
                    {new Date(report.generated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 p-8">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 size={16} className="text-[#12A06E]" />
                      <h2 className="text-sm font-semibold text-[#0E1320]">
                        Completed
                      </h2>
                      <span
                        className="text-xs text-[#94A3B8]"
                        style={{ fontFamily: MONO }}
                      >
                        {report.completed_fields.length}
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {report.completed_fields.map((item, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-3 rounded-xl border border-[#EEF0F6] bg-[#FAFBFD]"
                        >
                          <p className="text-sm font-medium text-[#0E1320] capitalize">
                            {item.field.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                            {typeof item.value === "string"
                              ? item.value.substring(0, 100)
                              : "Provided"}
                            {typeof item.value === "string" &&
                              item.value.length > 100 &&
                              "..."}
                          </p>
                        </div>
                      ))}
                      {report.completed_fields.length === 0 && (
                        <p className="text-sm text-[#94A3B8] text-center py-6">
                          No completed fields yet
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle size={16} className="text-[#C97A0A]" />
                      <h2 className="text-sm font-semibold text-[#0E1320]">
                        Missing
                      </h2>
                      <span
                        className="text-xs text-[#94A3B8]"
                        style={{ fontFamily: MONO }}
                      >
                        {report.missing_fields.length}
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {report.missing_fields.map((item, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-3 rounded-xl border border-amber-100 bg-[#FFF8EB]"
                        >
                          <p className="text-sm font-medium text-[#7A5008] capitalize">
                            {item.field.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs text-[#9A6B14] mt-1">
                            {item.reason}
                          </p>
                        </div>
                      ))}
                      {report.missing_fields.length === 0 && (
                        <div className="px-6 py-8 rounded-xl text-center border border-emerald-100 bg-[#ECFDF3]">
                          <CheckCircle2
                            size={28}
                            className="text-[#12A06E] mx-auto mb-2"
                          />
                          <p className="text-sm font-semibold text-emerald-800">
                            All required fields complete
                          </p>
                          <p className="text-xs text-emerald-700 mt-1">
                            This case is ready for consultation.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {report.missing_fields.length > 0 && (
                  <div className="px-8 py-4 border-t border-[#EEF0F6] flex justify-end">
                    <Link
                      href={`/dashboard/intakes/${params.id}`}
                      className="text-sm font-medium text-[#3B5BDB] hover:text-[#2F4AC2]"
                    >
                      Add missing information →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
