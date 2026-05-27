"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, CheckCircle2, XCircle } from "lucide-react";

const B = "#3B5BDB";

interface ReadinessReport {
  id: string;
  overall_score: number;
  missing_fields: Array<{ field: string; reason: string }>;
  completed_fields: Array<{ field: string; value: any }>;
  generated_at: string;
}

export default function ReadinessReportPage() {
  const params = useParams();
  const [report, setReport] = useState<ReadinessReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [params.id]);

  const fetchReport = async () => {
    const response = await fetch(`/api/intakes/${params.id}/readiness`);
    if (response.ok) {
      const data = await response.json();
      setReport(data);
    }
    setLoading(false);
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    const response = await fetch(`/api/intakes/${params.id}/pdf`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `case-readiness-report-${params.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    setDownloading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading report...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No report generated yet</p>
        <Link
          href={`/dashboard/intakes/${params.id}`}
          className="text-[#3B5BDB] hover:underline"
        >
          Go back and generate report
        </Link>
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

      <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Case Readiness Report
          </h1>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3B5BDB] text-white font-semibold rounded-xl hover:bg-[#2F4AC2] transition shadow-md"
            style={{ background: B }}
          >
            <Download size={16} />
            {downloading ? "Generating..." : "Download PDF"}
          </button>
        </div>

        {/* Score Section */}
        <div className="text-center mb-8">
          <div className="text-7xl font-bold text-[#3B5BDB] mb-3">
            {report.overall_score}%
          </div>
          <div
            className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(report.overall_score)}`}
          >
            {getStatusText(report.overall_score)}
          </div>
          <div className="mt-4 w-full bg-gray-100 rounded-full h-3 max-w-md mx-auto">
            <div
              className="bg-[#3B5BDB] h-3 rounded-full transition-all"
              style={{ width: `${report.overall_score}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Generated on {new Date(report.generated_at).toLocaleDateString()}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Completed Fields */}
          <div>
            <h2 className="text-lg font-bold text-green-600 mb-4 flex items-center gap-2">
              <CheckCircle2 size={20} /> Completed (
              {report.completed_fields.length})
            </h2>
            <div className="space-y-3">
              {report.completed_fields.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-green-50 p-3 rounded-lg border border-green-100"
                >
                  <p className="font-medium text-green-800 capitalize">
                    {item.field.replace(/_/g, " ")}
                  </p>
                  <p className="text-sm text-green-700 mt-1">
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
                <p className="text-gray-400">No completed fields</p>
              )}
            </div>
          </div>

          {/* Missing Fields */}
          <div>
            <h2 className="text-lg font-bold text-rose-600 mb-4 flex items-center gap-2">
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
                <div className="bg-emerald-50 p-6 rounded-lg text-center">
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
      </div>
    </div>
  );
}
