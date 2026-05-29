"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { addNotification } from "@/lib/notifications";

const B = "#3B5BDB";

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

export default function ReadinessReportPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<ReadinessReport | null>(null);
  const [intake, setIntake] = useState<Intake | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIntakeAndReport();
  }, [params.id]);

  const fetchIntakeAndReport = async () => {
    setLoading(true);
    try {
      // Fetch intake
      const intakeRes = await fetch(`/api/intakes/${params.id}`);
      if (intakeRes.ok) {
        const intakeData = await intakeRes.json();
        setIntake(intakeData);
      }

      // Fetch report
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

        // Add notification when report is generated
        if (intake) {
          addNotification({
            message: `Readiness report for ${intake.client_first_name} ${intake.client_last_name} is ready`,
            type: "success",
            intakeId: intake.id,
          });
        }
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

  const handleDownloadPDF = async () => {
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
        alert("Failed to generate PDF");
      }
    } catch (err) {
      console.error("Error downloading PDF:", err);
      alert("Error downloading report");
    }
  };

  if (loading || generating) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 size={32} className="animate-spin text-[#3B5BDB]" />
        <p className="text-gray-500">Loading your readiness report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8">
          <AlertCircle size={32} className="text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-amber-800 mb-2">
            Unable to load report
          </h2>
          <p className="text-amber-600 mb-6">{error || "Report not found"}</p>
          <Link
            href={`/dashboard/intakes/${params.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3B5BDB] text-white font-semibold rounded-lg hover:bg-[#2F4AC2] transition"
          >
            Go to Intake Details
          </Link>
        </div>
      </div>
    );
  }

  const getStatusText = (score: number) => {
    if (score === 100) return "Ready for Consultation";
    if (score >= 50) return "Partially Ready";
    return "Not Ready";
  };

  const getStatusColor = (score: number) => {
    if (score === 100) return "bg-emerald-50 text-emerald-700";
    if (score >= 50) return "bg-amber-50 text-amber-700";
    return "bg-rose-50 text-rose-700";
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href={`/dashboard/intakes/${params.id}`}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition"
      >
        <ArrowLeft size={16} /> Back to Intake
      </Link>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Case Readiness Report
          </h1>
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3B5BDB] text-white font-semibold rounded-lg hover:bg-[#2F4AC2] transition shadow-sm"
          >
            <Download size={16} /> Download PDF
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-[#3B5BDB] mb-2">
            {report.overall_score}%
          </div>
          <div
            className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(report.overall_score)}`}
          >
            {getStatusText(report.overall_score)}
          </div>
          <div className="mt-4 w-full bg-gray-100 rounded-full h-2 max-w-md mx-auto">
            <div
              className="bg-[#3B5BDB] h-2 rounded-full transition-all"
              style={{ width: `${report.overall_score}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 mt-3">
            Generated on {new Date(report.generated_at).toLocaleDateString()}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-emerald-600 mb-4 flex items-center gap-2">
              <CheckCircle2 size={20} /> Completed (
              {report.completed_fields.length})
            </h2>
            <div className="space-y-3">
              {report.completed_fields.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-emerald-50 p-3 rounded-lg border border-emerald-100"
                >
                  <p className="font-medium text-emerald-800 capitalize">
                    {item.field.replace(/_/g, " ")}
                  </p>
                  <p className="text-sm text-emerald-700 mt-1">
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
                <p className="text-gray-400 text-center py-4">
                  No completed fields
                </p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-rose-600 mb-4 flex items-center gap-2">
              <XCircle size={20} /> Missing ({report.missing_fields.length})
            </h2>
            <div className="space-y-3">
              {report.missing_fields.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-rose-50 p-3 rounded-lg border border-rose-100"
                >
                  <p className="font-medium text-rose-800 capitalize">
                    {item.field.replace(/_/g, " ")}
                  </p>
                  <p className="text-sm text-rose-700 mt-1">{item.reason}</p>
                </div>
              ))}
              {report.missing_fields.length === 0 && (
                <div className="bg-emerald-50 p-6 rounded-lg text-center border border-emerald-100">
                  <CheckCircle2
                    size={32}
                    className="text-emerald-500 mx-auto mb-2"
                  />
                  <p className="text-emerald-700 font-semibold">
                    All fields completed!
                  </p>
                  <p className="text-sm text-emerald-600">
                    This case is ready for consultation
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between">
          <Link
            href={`/dashboard/intakes/${params.id}`}
            className="text-[#3B5BDB] hover:text-[#2F4AC2] text-sm font-medium"
          >
            ← Back to Intake Details
          </Link>
          {report.missing_fields.length > 0 && (
            <Link
              href={`/dashboard/intakes/${params.id}`}
              className="text-[#3B5BDB] hover:text-[#2F4AC2] text-sm font-medium"
            >
              Add Missing Information →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
