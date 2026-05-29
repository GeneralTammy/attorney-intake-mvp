"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  Link2,
  Copy,
  Check,
} from "lucide-react";

const B = "#3B5BDB";
const BH = "#2F4AC2";

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
  documents?: Document[];
}

interface Document {
  id: string;
  file_name: string;
  file_path: string;
  uploaded_at: string;
}

export default function IntakeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [intake, setIntake] = useState<Intake | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);

  const intakeId = params.id as string;

  useEffect(() => {
    if (intakeId) {
      fetchIntake();
    }
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

  const handleDownloadPDF = async () => {
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
        alert("Failed to generate PDF");
      }
    } catch (err) {
      console.error("Error downloading PDF:", err);
      alert("Error downloading PDF");
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
      // First, get or create share token
      const tokenResponse = await fetch(`/api/intakes/${intakeId}/share`);
      if (!tokenResponse.ok) {
        throw new Error("Failed to get share link");
      }

      const tokenData = await tokenResponse.json();
      const shareUrl = `${window.location.origin}/intake/${tokenData.share_token}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);

      // Also store the token for reference
      setShareToken(tokenData.share_token);
    } catch (err) {
      console.error("Error getting share link:", err);
      alert("Failed to generate share link. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !intake) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            {error || "Intake not found"}
          </h2>
          <Link
            href="/dashboard"
            className="inline-block mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Intake
            </h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete the intake for{" "}
              <strong>
                {intake.client_first_name} {intake.client_last_name}
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Link Success Toast */}
      {shareCopied && (
        <div className="fixed bottom-4 right-4 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center gap-2 shadow-lg z-50">
          <Check size={16} className="text-emerald-500" />
          <span className="text-sm text-emerald-700">
            Share link copied to clipboard!
          </span>
        </div>
      )}

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {intake.client_first_name} {intake.client_last_name}
            </h1>
            <p className="text-gray-500 mt-1">
              {intake.case_type.replace(/_/g, " ")} • Created{" "}
              {new Date(intake.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleShareLink}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition flex items-center gap-2"
            >
              <Link2 size={16} />
              {shareCopied ? "Copied!" : "Share Link"}
            </button>
            <button
              onClick={generateReport}
              disabled={generating}
              className="px-5 py-2.5 bg-[#3B5BDB] text-white font-semibold rounded-xl hover:bg-[#2F4AC2] transition shadow-md disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate Report"}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-5 py-2.5 border border-red-300 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition"
            >
              <Trash2 size={16} className="inline mr-1" /> Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Client Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase">Full Name</p>
                <p className="text-gray-900 font-medium">
                  {intake.client_first_name} {intake.client_last_name}
                </p>
              </div>
              {intake.client_email && (
                <div>
                  <p className="text-xs text-gray-400 uppercase">Email</p>
                  <p className="text-gray-900">{intake.client_email}</p>
                </div>
              )}
              {intake.client_phone && (
                <div>
                  <p className="text-xs text-gray-400 uppercase">Phone</p>
                  <p className="text-gray-900">{intake.client_phone}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 uppercase">Case Type</p>
                <p className="text-gray-900">
                  {intake.case_type.replace(/_/g, " ")}
                </p>
              </div>
            </div>
          </div>

          {/* Case Data */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Case Details
            </h2>
            {Object.keys(intake.case_data).length === 0 ? (
              <p className="text-gray-400">No case data entered yet</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(intake.case_data).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-sm font-semibold text-gray-700 capitalize">
                      {key.replace(/_/g, " ")}
                    </p>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {String(value)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Readiness Report
            </h2>

            {report ? (
              <div>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-[#3B5BDB]">
                    {report.overall_score}%
                  </div>
                  <p className="text-sm text-gray-500">Readiness Score</p>
                </div>

                {report.missing_fields && report.missing_fields.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-red-600 mb-2">
                      Missing ({report.missing_fields.length})
                    </p>
                    <div className="space-y-1">
                      {report.missing_fields.map((item: any, idx: number) => (
                        <div key={idx} className="text-sm text-gray-600">
                          • {item.field.replace(/_/g, " ")}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleDownloadPDF}
                  className="w-full mt-3 px-4 py-2 bg-[#3B5BDB] text-white font-semibold rounded-lg hover:bg-[#2F4AC2] transition"
                >
                  <Download size={16} className="inline mr-1" /> Download PDF
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <FileText size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No report generated yet</p>
                <button
                  onClick={generateReport}
                  disabled={generating}
                  className="px-4 py-2 bg-[#3B5BDB] text-white rounded-lg hover:bg-[#2F4AC2] transition"
                >
                  Generate Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
