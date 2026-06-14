"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Briefcase,
  ChevronDown,
  FileText,
  User,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle2,
  Save,
  AlertTriangle,
  Menu,
} from "lucide-react";

import { DesktopSidebar, MobileSidebar } from "@/components/Sidebar";

const SERIF = "'DM Serif Display', Georgia, serif";
const MONO = "'DM Mono', ui-monospace, monospace";

// ─── Case Type Configurations ─────────────────────────────
const caseTypeConfigs: Record<
  string,
  {
    label: string;
    icon: React.ReactNode;
    required: string[];
    optional: string[];
    description: string;
    fieldTypes: Record<string, "text" | "date" | "textarea">;
    fieldPlaceholders: Record<string, string>;
  }
> = {
  personal_injury: {
    label: "Personal Injury",
    icon: <AlertTriangle size={18} />,
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
    icon: <User size={18} />,
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
    icon: <AlertCircle size={18} />,
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
    icon: <FileText size={18} />,
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
    icon: <Save size={18} />,
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

function calcScore(
  caseType: string,
  caseData: Record<string, string>,
  clientFirst: string,
  clientLast: string,
): { score: number; completedRequired: number; totalRequired: number } {
  const config = caseTypeConfigs[caseType];
  if (!config) return { score: 0, completedRequired: 0, totalRequired: 0 };

  const clientComplete =
    (clientFirst.trim() ? 1 : 0) + (clientLast.trim() ? 1 : 0);
  const totalRequired = config.required.length + 2;
  const completedRequired =
    clientComplete + config.required.filter((k) => caseData[k]?.trim()).length;

  const totalOptional = config.optional.length;
  const completedOptional = config.optional.filter((k) =>
    caseData[k]?.trim(),
  ).length;

  const requiredScore =
    totalRequired > 0 ? (completedRequired / totalRequired) * 80 : 0;
  const optionalScore =
    totalOptional > 0 ? (completedOptional / totalOptional) * 20 : 20;

  return {
    score: Math.round(requiredScore + optionalScore),
    completedRequired,
    totalRequired,
  };
}

function scoreColor(score: number) {
  return score >= 80 ? "#12A06E" : score >= 50 ? "#C97A0A" : "#C93B3B";
}

function ScoreRing({ score }: { score: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = scoreColor(score);

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 108 108" className="w-full h-full -rotate-90">
        <circle
          cx="54"
          cy="54"
          r={r}
          fill="none"
          stroke="#EEF0F6"
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
        <span
          className="text-3xl font-medium leading-none"
          style={{ color, fontFamily: MONO }}
        >
          {score}%
        </span>
        <span className="text-[10px] text-[#94A3B8] font-medium uppercase tracking-[0.12em] mt-1.5">
          Ready
        </span>
      </div>
    </div>
  );
}

const baseInput =
  "w-full px-4 py-3.5 text-base text-[#0E1320] placeholder:text-[#9AA3B5] bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/60 focus:border-[#3B5BDB] transition-shadow";

// ─── Main Component ───────────────────────────────────────
export default function NewIntakePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState<string>("Attorney");
  const [showValidation, setShowValidation] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    client_first_name: "",
    client_last_name: "",
    client_email: "",
    client_phone: "",
    case_type: "personal_injury",
    case_data: {} as Record<string, string>,
  });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const currentConfig = caseTypeConfigs[formData.case_type];
  const { score, completedRequired, totalRequired } = useMemo(
    () =>
      calcScore(
        formData.case_type,
        formData.case_data,
        formData.client_first_name,
        formData.client_last_name,
      ),
    [formData],
  );
  const missingRequired = currentConfig.required.filter(
    (field) => !formData.case_data[field]?.trim(),
  );
  const isClientInfoValid =
    formData.client_first_name.trim() !== "" &&
    formData.client_last_name.trim() !== "";
  const isFormValid = isClientInfoValid && missingRequired.length === 0;

  const handleCaseTypeChange = (caseType: string) => {
    setFormData({ ...formData, case_type: caseType, case_data: {} });
    setShowValidation(false);
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      case_data: { ...formData.case_data, [field]: value },
    });
  };

  const getFieldError = (field: string): boolean => {
    return (
      showValidation &&
      (!formData.case_data[field] || formData.case_data[field].trim() === "")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);
    if (!isFormValid) {
      setError("Please complete all required fields before submitting.");
      const firstError = document.querySelector(".error-field");
      if (firstError)
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setLoading(true);
    setError("");
    const payload = {
      client_first_name: formData.client_first_name,
      client_last_name: formData.client_last_name,
      client_email: formData.client_email || null,
      client_phone: formData.client_phone || null,
      case_type: formData.case_type,
      case_data: formData.case_data,
    };
    try {
      const response = await fetch("/api/intakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create intake");
        setLoading(false);
        return;
      }
      const intake = await response.json();

      await fetch(`/api/intakes/${intake.id}/readiness`, { method: "POST" });

      router.push(`/dashboard/intakes/${intake.id}/readiness`);
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `${baseInput} ${hasError ? "border-red-300 bg-red-50/50" : "border-[#E0E4EE]"}`;

  return (
    <div className="min-h-screen bg-[#F7F8FB] pb-20 lg:pb-0">
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
          <div className="px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 text-[#64748B] hover:bg-[#F7F8FB] rounded-lg"
                >
                  <Menu size={20} />
                </button>
                <div>
                  <h1
                    className="text-xl text-[#0E1320]"
                    style={{ fontFamily: SERIF }}
                  >
                    New Client Intake
                  </h1>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Create a new case file
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0E1320] transition"
              >
                <ArrowLeft size={14} />{" "}
                <span className="hidden sm:inline">Back to dashboard</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            {/* Form */}
            <div className="flex-1 w-full">
              {error && (
                <div className="mb-5 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-start gap-2.5">
                  <AlertCircle
                    size={16}
                    className="text-[#C93B3B] flex-shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-[#9F2D2D]">{error}</p>
                </div>
              )}
              {showValidation && !isFormValid && !error && (
                <div className="mb-5 bg-[#FFF8EB] border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2.5">
                  <AlertTriangle
                    size={16}
                    className="text-[#C97A0A] flex-shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-[#9A6B14]">
                    Please complete all required fields before submitting.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Client Info */}
                <section className="bg-white rounded-2xl border border-[#E8EAF1] shadow-sm p-7 sm:p-10">
                  <div className="flex items-center gap-3 mb-7 pb-5 border-b border-[#EEF0F6]">
                    <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
                      <User size={16} className="text-[#3B5BDB]" />
                    </div>
                    <h2 className="text-xl font-semibold text-[#0E1320]">
                      Client Information
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[#334155] mb-2">
                        First name <span className="text-[#C93B3B]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.client_first_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            client_first_name: e.target.value,
                          })
                        }
                        placeholder="John"
                        className={inputClass(
                          showValidation && !formData.client_first_name,
                        )}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#334155] mb-2">
                        Last name <span className="text-[#C93B3B]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.client_last_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            client_last_name: e.target.value,
                          })
                        }
                        placeholder="Doe"
                        className={inputClass(
                          showValidation && !formData.client_last_name,
                        )}
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-medium text-[#334155] mb-2">
                        <Mail size={13} className="text-[#94A3B8]" /> Email
                      </label>
                      <input
                        type="email"
                        value={formData.client_email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            client_email: e.target.value,
                          })
                        }
                        placeholder="john@example.com"
                        className={inputClass(false)}
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-medium text-[#334155] mb-2">
                        <Phone size={13} className="text-[#94A3B8]" /> Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.client_phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            client_phone: e.target.value,
                          })
                        }
                        placeholder="(555) 555-5555"
                        className={inputClass(false)}
                      />
                    </div>
                  </div>
                </section>

                {/* Case Details */}
                <section className="bg-white rounded-2xl border border-[#E8EAF1] shadow-sm p-7 sm:p-10">
                  <div className="flex items-center gap-3 mb-7 pb-5 border-b border-[#EEF0F6]">
                    <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
                      <Briefcase size={16} className="text-[#3B5BDB]" />
                    </div>
                    <h2 className="text-xl font-semibold text-[#0E1320]">
                      Case Details
                    </h2>
                  </div>

                  <div className="mb-8">
                    <label className="block text-sm font-medium text-[#334155] mb-2">
                      Case type <span className="text-[#C93B3B]">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.case_type}
                        onChange={(e) => handleCaseTypeChange(e.target.value)}
                        className={`${baseInput} border-[#E0E4EE] appearance-none pr-10`}
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
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
                      />
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-2">
                      {currentConfig.description}
                    </p>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3B5BDB]">
                        Required information
                      </p>
                      <span
                        className="text-xs text-[#94A3B8]"
                        style={{ fontFamily: MONO }}
                      >
                        {
                          currentConfig.required.filter((k) =>
                            formData.case_data[k]?.trim(),
                          ).length
                        }
                        /{currentConfig.required.length}
                      </span>
                    </div>
                    <div className="space-y-6">
                      {currentConfig.required.map((field) => {
                        const isError = getFieldError(field);
                        const isFilled = !!formData.case_data[field]?.trim();
                        const fieldType =
                          currentConfig.fieldTypes[field] ?? "textarea";
                        const placeholder =
                          currentConfig.fieldPlaceholders[field] ?? "";
                        return (
                          <div
                            key={field}
                            className={isError ? "error-field" : ""}
                          >
                            <label className="flex items-center gap-2 text-sm font-medium text-[#334155] mb-2">
                              {formatFieldName(field)}{" "}
                              <span className="text-[#C93B3B]">*</span>
                              {isFilled && !isError && (
                                <CheckCircle2
                                  size={14}
                                  className="text-[#12A06E]"
                                />
                              )}
                            </label>
                            {fieldType === "date" ? (
                              <input
                                type="date"
                                value={formData.case_data[field] || ""}
                                onChange={(e) =>
                                  handleFieldChange(field, e.target.value)
                                }
                                className={inputClass(isError)}
                                style={{ fontFamily: MONO }}
                              />
                            ) : fieldType === "text" ? (
                              <input
                                type="text"
                                value={formData.case_data[field] || ""}
                                onChange={(e) =>
                                  handleFieldChange(field, e.target.value)
                                }
                                placeholder={placeholder}
                                className={inputClass(isError)}
                              />
                            ) : (
                              <textarea
                                rows={4}
                                value={formData.case_data[field] || ""}
                                onChange={(e) =>
                                  handleFieldChange(field, e.target.value)
                                }
                                placeholder={placeholder}
                                className={`${inputClass(isError)} resize-none leading-relaxed`}
                              />
                            )}
                            {isError && (
                              <p className="text-xs text-[#C93B3B] mt-1.5">
                                {formatFieldName(field)} is required
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {currentConfig.optional.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
                          Optional information
                        </p>
                        <span className="text-xs text-[#C2C9D6]">
                          Helpful but not required
                        </span>
                      </div>
                      <div className="space-y-6">
                        {currentConfig.optional.map((field) => {
                          const fieldType =
                            currentConfig.fieldTypes[field] ?? "textarea";
                          const placeholder =
                            currentConfig.fieldPlaceholders[field] ??
                            `Optional: ${formatFieldName(field).toLowerCase()}...`;
                          return (
                            <div key={field}>
                              <label className="block text-sm font-medium text-[#334155] mb-2">
                                {formatFieldName(field)}
                              </label>
                              {fieldType === "date" ? (
                                <input
                                  type="date"
                                  value={formData.case_data[field] || ""}
                                  onChange={(e) =>
                                    handleFieldChange(field, e.target.value)
                                  }
                                  className={inputClass(false)}
                                  style={{ fontFamily: MONO }}
                                />
                              ) : fieldType === "text" ? (
                                <input
                                  type="text"
                                  value={formData.case_data[field] || ""}
                                  onChange={(e) =>
                                    handleFieldChange(field, e.target.value)
                                  }
                                  placeholder={placeholder}
                                  className={inputClass(false)}
                                />
                              ) : (
                                <textarea
                                  rows={3}
                                  value={formData.case_data[field] || ""}
                                  onChange={(e) =>
                                    handleFieldChange(field, e.target.value)
                                  }
                                  placeholder={placeholder}
                                  className={`${inputClass(false)} resize-none leading-relaxed`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </section>

                <div className="flex justify-end gap-3 pb-8">
                  <Link
                    href="/dashboard"
                    className="px-5 py-3 text-sm font-medium text-[#334155] border border-[#E0E4EE] rounded-xl hover:bg-white transition"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-3 text-sm font-semibold bg-[#3B5BDB] hover:bg-[#2F4AC2] text-white rounded-xl transition shadow-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save size={15} /> Create intake
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Readiness Panel */}
            <aside className="hidden lg:block w-80 flex-shrink-0 sticky top-24">
              <div className="bg-white rounded-2xl border border-[#E8EAF1] shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-[#EEF0F6]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3B5BDB]">
                    Readiness
                  </p>
                  <p className="text-xs text-[#94A3B8] mt-1.5">
                    Updates as you fill the form
                  </p>
                </div>
                <div className="p-6">
                  <ScoreRing score={score} />
                  <div className="mt-6">
                    <div className="flex justify-between items-baseline text-sm mb-2">
                      <span className="font-medium text-[#475569]">
                        Required fields
                      </span>
                      <span
                        className="font-medium"
                        style={{ fontFamily: MONO, color: scoreColor(score) }}
                      >
                        {completedRequired}/{totalRequired}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#EEF0F6] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${(completedRequired / totalRequired) * 100}%`,
                          background: scoreColor(score),
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-5 space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      {formData.client_first_name &&
                      formData.client_last_name ? (
                        <CheckCircle2 size={14} className="text-[#12A06E]" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-[#D7DCE7]" />
                      )}
                      <span className="text-xs text-[#475569]">
                        Client name
                      </span>
                    </div>
                    {currentConfig.required.map((field) => (
                      <div key={field} className="flex items-center gap-2.5">
                        {formData.case_data[field]?.trim() ? (
                          <CheckCircle2 size={14} className="text-[#12A06E]" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-[#D7DCE7]" />
                        )}
                        <span className="text-xs text-[#475569]">
                          {formatFieldName(field)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div
                    className="mt-6 px-4 py-3 rounded-xl text-center text-sm font-semibold"
                    style={{
                      background:
                        score >= 80
                          ? "#ECFDF3"
                          : score >= 50
                            ? "#FFF8EB"
                            : "#FEF2F2",
                      color: scoreColor(score),
                    }}
                  >
                    {score >= 80
                      ? "Ready for consultation"
                      : score >= 50
                        ? "Almost there — keep going"
                        : "Fill required fields to continue"}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>

      {/* Mobile progress bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-[#E8EAF1] px-5 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-xs font-medium text-[#475569]">
                Readiness
              </span>
              <span
                className="text-xs font-medium"
                style={{ fontFamily: MONO, color: scoreColor(score) }}
              >
                {completedRequired}/{totalRequired} required
              </span>
            </div>
            <div className="h-1.5 bg-[#EEF0F6] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(completedRequired / totalRequired) * 100}%`,
                  background: scoreColor(score),
                }}
              />
            </div>
          </div>
          <span
            className="text-xl font-medium"
            style={{ fontFamily: MONO, color: scoreColor(score) }}
          >
            {score}%
          </span>
        </div>
      </div>
    </div>
  );
}
