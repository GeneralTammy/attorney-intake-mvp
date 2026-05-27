"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, CheckCircle2, AlertCircle, FileText } from "lucide-react";

const B = "#3B5BDB";

interface IntakeData {
  id: string;
  client_first_name: string;
  client_last_name: string;
  case_type: string;
  case_data: Record<string, any>;
  status: string;
}

export default function PublicIntakePage() {
  const params = useParams();
  const token = params.token as string;
  const [intake, setIntake] = useState<IntakeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchIntake();
  }, [token]);

  const fetchIntake = async () => {
    try {
      const response = await fetch(`/api/public/intake/${token}`);
      if (response.ok) {
        const data = await response.json();
        setIntake(data);
        setFormData(data.case_data || {});
      }
    } catch (error) {
      console.error("Error fetching intake:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch(`/api/public/intake/${token}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ case_data: formData }),
    });
    if (response.ok) {
      setSubmitted(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!intake) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Intake Not Found
          </h1>
          <p className="text-gray-500">
            This intake link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-500 mb-6">
            Your information has been submitted successfully. The attorney will
            review your case and reach out shortly.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 bg-[#3B5BDB] text-white font-semibold rounded-xl hover:bg-[#2F4AC2] transition"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <Briefcase size={15} className="text-white" />
            </div>
            <span className="font-display text-lg font-bold text-gray-900">
              Case<span style={{ color: B }}>Ready</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Client Intake Form
            </h1>
            <p className="text-gray-500">
              Please provide the following information for your{" "}
              {intake.case_type.replace(/_/g, " ")} case.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Info Section */}
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Your Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={intake.client_first_name}
                    disabled
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={intake.client_last_name}
                    disabled
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Case Fields */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Case Information
              </h2>
              {Object.keys(formData).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {key.replace(/_/g, " ")}
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent"
                    value={formData[key] || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [key]: e.target.value })
                    }
                    placeholder={`Please provide ${key.replace(/_/g, " ")}`}
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#3B5BDB] hover:bg-[#2F4AC2] text-white font-semibold rounded-xl transition shadow-md"
            >
              Submit Information
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
