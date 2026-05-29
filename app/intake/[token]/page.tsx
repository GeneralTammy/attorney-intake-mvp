"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Briefcase,
  Mail,
  Phone,
  User,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  FileText,
  Save,
  ArrowRight,
} from "lucide-react";

const B = "#3B5BDB";

// Case type configurations
const caseTypeConfigs: Record<
  string,
  {
    label: string;
    required: string[];
    optional: string[];
    description: string;
    fieldTypes: Record<string, "text" | "date" | "textarea">;
    fieldPlaceholders: Record<string, string>;
  }
> = {
  personal_injury: {
    label: "Personal Injury",
    description: "Accidents, injuries, liability claims",
    required: [
      "incident_date",
      "injury_description",
      "medical_providers",
      "liability_description",
    ],
    optional: ["police_report_number", "witnesses", "insurance_info"],
    fieldTypes: {
      incident_date: "date",
      injury_description: "textarea",
      medical_providers: "text",
      liability_description: "textarea",
      police_report_number: "text",
      witnesses: "textarea",
      insurance_info: "text",
    },
    fieldPlaceholders: {
      injury_description:
        "Describe the injuries sustained, severity, body parts affected...",
      medical_providers: "e.g., General Hospital, Dr. Smith",
      liability_description:
        "Describe how the accident occurred and who was at fault...",
      police_report_number: "e.g., RPT-2024-00123",
      witnesses: "Names and phone numbers of any witnesses...",
      insurance_info: "e.g., State Farm, Policy #12345",
    },
  },
  family: {
    label: "Family Law",
    description: "Divorce, custody, child support",
    required: [
      "opposing_party_name",
      "marriage_date",
      "children_info",
      "asset_description",
    ],
    optional: [
      "prenuptial_agreement",
      "separation_date",
      "custody_preferences",
    ],
    fieldTypes: {
      opposing_party_name: "text",
      marriage_date: "date",
      children_info: "textarea",
      asset_description: "textarea",
      prenuptial_agreement: "text",
      separation_date: "date",
      custody_preferences: "textarea",
    },
    fieldPlaceholders: {
      opposing_party_name: "e.g., Jane Smith",
      children_info: "Names and ages of children involved...",
      asset_description: "Describe shared property, accounts, or assets...",
      prenuptial_agreement: "e.g., Yes — signed, or None",
      custody_preferences: "Describe desired custody arrangement...",
    },
  },
  criminal_defense: {
    label: "Criminal Defense",
    description: "Charges, arrests, defense strategy",
    required: ["charges", "arrest_date", "incident_description", "court_date"],
    optional: ["prior_convictions", "bail_status", "evidence_notes"],
    fieldTypes: {
      charges: "text",
      arrest_date: "date",
      incident_description: "textarea",
      court_date: "date",
      prior_convictions: "textarea",
      bail_status: "text",
      evidence_notes: "textarea",
    },
    fieldPlaceholders: {
      charges: "e.g., DUI, Assault, Possession",
      incident_description:
        "Describe what happened from the client's perspective...",
      prior_convictions: "List any prior criminal history...",
      bail_status: "e.g., Released on bail, Held in custody",
      evidence_notes: "Any known evidence or witnesses...",
    },
  },
  immigration: {
    label: "Immigration",
    description: "Visas, green cards, citizenship",
    required: [
      "visa_type",
      "country_of_origin",
      "current_status",
      "filing_deadline",
    ],
    optional: ["prior_applications", "dependents_info", "criminal_history"],
    fieldTypes: {
      visa_type: "text",
      country_of_origin: "text",
      current_status: "text",
      filing_deadline: "date",
      prior_applications: "textarea",
      dependents_info: "textarea",
      criminal_history: "text",
    },
    fieldPlaceholders: {
      visa_type: "e.g., H-1B, F-1, Green Card, Asylum",
      country_of_origin: "e.g., Mexico, India, Nigeria",
      current_status: "e.g., Undocumented, F-1 student, H-1B worker",
      prior_applications: "Any previous USCIS applications or denials...",
      dependents_info: "Names and relationship of any dependents...",
      criminal_history: "e.g., None, or describe briefly",
    },
  },
  estate_planning: {
    label: "Estate Planning",
    description: "Wills, trusts, power of attorney",
    required: [
      "assets_description",
      "beneficiaries",
      "executor_name",
      "will_exists",
    ],
    optional: ["trust_info", "healthcare_directive", "power_of_attorney"],
    fieldTypes: {
      assets_description: "textarea",
      beneficiaries: "textarea",
      executor_name: "text",
      will_exists: "text",
      trust_info: "textarea",
      healthcare_directive: "text",
      power_of_attorney: "text",
    },
    fieldPlaceholders: {
      assets_description:
        "Real estate, bank accounts, investments, vehicles...",
      beneficiaries: "Names and relationship to client...",
      executor_name: "Full name of the executor",
      will_exists: "e.g., No existing will / Yes — needs updating",
      trust_info: "Details about any existing or desired trusts...",
      healthcare_directive: "e.g., Not needed / Needed — new",
      power_of_attorney: "e.g., Not needed / Needed — new",
    },
  },
};

function formatFieldName(field: string): string {
  return field
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Calculate readiness score - includes client info fields
function calculateReadinessScore(
  clientInfo: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  },
  formData: Record<string, any>,
  requiredFields: string[],
): { score: number; completedRequired: number; totalRequired: number } {
  // Count client info completed (first and last name are required)
  let clientCompleted = 0;
  if (clientInfo.first_name && clientInfo.first_name.trim() !== "")
    clientCompleted++;
  if (clientInfo.last_name && clientInfo.last_name.trim() !== "")
    clientCompleted++;

  // Count required case fields completed
  const caseCompleted = requiredFields.filter(
    (field) => formData[field] && formData[field].trim() !== "",
  ).length;

  // Total required: 2 (first + last name) + required case fields
  const totalRequired = 2 + requiredFields.length;
  const completedRequired = clientCompleted + caseCompleted;

  const score =
    totalRequired > 0
      ? Math.round((completedRequired / totalRequired) * 100)
      : 0;
  return { score, completedRequired, totalRequired };
}

// Score Ring Component
function ScoreRing({ score }: { score: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#12A06E" : score >= 50 ? "#C97A0A" : "#C93B3B";

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 108 108" className="w-full h-full -rotate-90">
        <circle
          cx="54"
          cy="54"
          r={r}
          fill="none"
          stroke="#F0F0F5"
          strokeWidth="9"
        />
        <circle
          cx="54"
          cy="54"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold leading-none" style={{ color }}>
          {score}%
        </span>
        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-1">
          Complete
        </span>
      </div>
    </div>
  );
}

export default function PublicIntakePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [intake, setIntake] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [clientInfo, setClientInfo] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

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
        setClientInfo({
          first_name: data.client_first_name || "",
          last_name: data.client_last_name || "",
          email: data.client_email || "",
          phone: data.client_phone || "",
        });
      } else {
        setError("This intake link is invalid or has expired.");
      }
    } catch (err) {
      setError("Failed to load intake form.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const updateResponse = await fetch(`/api/public/intake/${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_first_name: clientInfo.first_name,
          client_last_name: clientInfo.last_name,
          client_email: clientInfo.email,
          client_phone: clientInfo.phone,
          case_data: formData,
        }),
      });

      if (updateResponse.ok) {
        setSubmitted(true);
      } else {
        const errorData = await updateResponse.json();
        setError(errorData.error || "Failed to submit form");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate progress - updates in real-time
  const { score, completedRequired, totalRequired } = calculateReadinessScore(
    clientInfo,
    formData,
    intake?.case_type ? caseTypeConfigs[intake.case_type]?.required || [] : [],
  );

  const currentConfig = intake?.case_type
    ? caseTypeConfigs[intake.case_type]
    : caseTypeConfigs.personal_injury;
  const scoreBarColor =
    score >= 80
      ? "bg-emerald-500"
      : score >= 50
        ? "bg-amber-400"
        : "bg-red-400";
  const scoreTextColor =
    score >= 80
      ? "text-emerald-600"
      : score >= 50
        ? "text-amber-600"
        : "text-red-500";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !intake) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Link Invalid
          </h1>
          <p className="text-gray-500 mb-6">
            {error || "This intake link is no longer available."}
          </p>
          <Link href="/" className="text-[#3B5BDB] hover:underline">
            Return to Home
          </Link>
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
            className="inline-block px-6 py-2.5 bg-[#3B5BDB] text-white font-semibold rounded-lg hover:bg-[#2F4AC2] transition"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3B5BDB] flex items-center justify-center">
              <Briefcase size={16} className="text-white" />
            </div>
            <span className="font-semibold text-lg text-gray-900">
              Case<span className="text-[#3B5BDB]">Ready</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-5 bg-gray-50/50">
                <h1 className="text-xl font-semibold text-gray-900">
                  Client Intake Form
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Please provide the following information for your case.
                </p>
              </div>

              {error && (
                <div className="m-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle
                    size={18}
                    className="text-red-500 flex-shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Client Information Section */}
                <div className="border-b border-gray-100 pb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User size={16} className="text-[#3B5BDB]" />
                    <h2 className="text-base font-semibold text-gray-900">
                      Your Information
                    </h2>
                    <span className="text-xs text-red-500 ml-auto">
                      * Required
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={clientInfo.first_name}
                        onChange={(e) =>
                          setClientInfo({
                            ...clientInfo,
                            first_name: e.target.value,
                          })
                        }
                        placeholder="John"
                        className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={clientInfo.last_name}
                        onChange={(e) =>
                          setClientInfo({
                            ...clientInfo,
                            last_name: e.target.value,
                          })
                        }
                        placeholder="Doe"
                        className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Mail size={14} className="inline mr-1" /> Email Address
                      </label>
                      <input
                        type="email"
                        value={clientInfo.email}
                        onChange={(e) =>
                          setClientInfo({
                            ...clientInfo,
                            email: e.target.value,
                          })
                        }
                        placeholder="john@example.com"
                        className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Phone size={14} className="inline mr-1" /> Phone Number
                      </label>
                      <input
                        type="tel"
                        value={clientInfo.phone}
                        onChange={(e) =>
                          setClientInfo({
                            ...clientInfo,
                            phone: e.target.value,
                          })
                        }
                        placeholder="(555) 555-5555"
                        className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase size={16} className="text-[#3B5BDB]" />
                    <h2 className="text-base font-semibold text-gray-900">
                      Case Information
                    </h2>
                    <span className="text-xs text-red-500 ml-auto">
                      * Required
                    </span>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Case Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={intake.case_type}
                        onChange={(e) => {
                          setIntake({ ...intake, case_type: e.target.value });
                          setFormData({});
                        }}
                        className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent appearance-none bg-white"
                      >
                        <option value="personal_injury">Personal Injury</option>
                        <option value="family">Family Law</option>
                        <option value="criminal_defense">
                          Criminal Defense
                        </option>
                        <option value="immigration">Immigration</option>
                        <option value="estate_planning">Estate Planning</option>
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {currentConfig.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-5 bg-red-500 rounded-full" />
                      <h3 className="font-semibold text-gray-900">
                        Required Information
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {currentConfig.required.map((field) => {
                        const fieldType =
                          currentConfig.fieldTypes[field] ?? "textarea";
                        const placeholder =
                          currentConfig.fieldPlaceholders[field] ?? "";
                        const isFilled = !!formData[field]?.trim();
                        return (
                          <div key={field}>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1 capitalize">
                              {formatFieldName(field)}{" "}
                              <span className="text-red-500">*</span>
                              {isFilled && (
                                <CheckCircle2
                                  size={14}
                                  className="text-emerald-500"
                                />
                              )}
                            </label>
                            {fieldType === "date" ? (
                              <input
                                type="date"
                                required
                                value={formData[field] || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    [field]: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent"
                              />
                            ) : fieldType === "text" ? (
                              <input
                                type="text"
                                required
                                value={formData[field] || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    [field]: e.target.value,
                                  })
                                }
                                placeholder={placeholder}
                                className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent"
                              />
                            ) : (
                              <textarea
                                rows={3}
                                required
                                value={formData[field] || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    [field]: e.target.value,
                                  })
                                }
                                placeholder={placeholder}
                                className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent resize-none"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {currentConfig.optional.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-5 bg-gray-400 rounded-full" />
                        <h3 className="font-semibold text-gray-900">
                          Optional Information
                        </h3>
                        <span className="text-xs text-gray-400">
                          (Helpful but not required)
                        </span>
                      </div>
                      <div className="space-y-4">
                        {currentConfig.optional.map((field) => {
                          const fieldType =
                            currentConfig.fieldTypes[field] ?? "textarea";
                          const placeholder =
                            currentConfig.fieldPlaceholders[field] ??
                            `Optional: ${formatFieldName(field).toLowerCase()}...`;
                          return (
                            <div key={field}>
                              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                {formatFieldName(field)}
                              </label>
                              {fieldType === "date" ? (
                                <input
                                  type="date"
                                  value={formData[field] || ""}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      [field]: e.target.value,
                                    })
                                  }
                                  className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent"
                                />
                              ) : fieldType === "text" ? (
                                <input
                                  type="text"
                                  value={formData[field] || ""}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      [field]: e.target.value,
                                    })
                                  }
                                  placeholder={placeholder}
                                  className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent"
                                />
                              ) : (
                                <textarea
                                  rows={2}
                                  value={formData[field] || ""}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      [field]: e.target.value,
                                    })
                                  }
                                  placeholder={placeholder}
                                  className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent resize-none"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-[#3B5BDB] hover:bg-[#2F4AC2] text-white font-semibold rounded-lg transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Information
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                  <p className="text-xs text-center text-gray-400 mt-4">
                    Your information is secure and will only be used for this
                    case.
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Readiness Score Panel */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-base font-bold text-gray-900">
                  Completion Progress
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Updates as you fill the form
                </p>
              </div>
              <div className="p-5">
                <ScoreRing score={score} />

                <div className="mt-5">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-semibold text-gray-600">
                      Required fields
                    </span>
                    <span className={`font-bold ${scoreTextColor}`}>
                      {completedRequired}/{totalRequired}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${scoreBarColor}`}
                      style={{
                        width: `${(completedRequired / totalRequired) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  {/* Client name fields */}
                  <div className="flex items-center gap-2.5">
                    {clientInfo.first_name && clientInfo.last_name ? (
                      <CheckCircle2
                        size={14}
                        className="text-emerald-500 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />
                    )}
                    <span className="text-xs text-gray-700">
                      Your Full Name
                    </span>
                  </div>

                  {/* Required case fields */}
                  {currentConfig.required.map((field) => {
                    const filled = !!formData[field]?.trim();
                    return (
                      <div key={field} className="flex items-center gap-2.5">
                        {filled ? (
                          <CheckCircle2
                            size={14}
                            className="text-emerald-500 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />
                        )}
                        <span className="text-xs text-gray-700">
                          {formatFieldName(field)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div
                  className={`mt-5 px-4 py-3 rounded-xl text-center text-sm font-bold ${
                    score >= 80
                      ? "bg-emerald-50 text-emerald-700"
                      : score >= 50
                        ? "bg-amber-50 text-amber-700"
                        : "bg-red-50 text-red-600"
                  }`}
                >
                  {score >= 80
                    ? "✓ Great progress! Ready to submit"
                    : score >= 50
                      ? "Almost there — keep going"
                      : "Please fill required fields"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
