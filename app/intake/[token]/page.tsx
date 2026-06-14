"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Briefcase,
  Mail,
  Phone,
  User,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const SERIF = "'DM Serif Display', Georgia, serif";
const MONO = "'DM Mono', ui-monospace, monospace";

// Case type configurations
const caseTypeConfigs: Record<string, any> = {
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
    },
    fieldPlaceholders: {
      injury_description: "Describe the injuries sustained...",
      medical_providers: "e.g., General Hospital, Dr. Smith",
      liability_description: "Describe how the accident occurred...",
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
    },
    fieldPlaceholders: {
      opposing_party_name: "e.g., Jane Smith",
      children_info: "Names and ages of children involved...",
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
    },
    fieldPlaceholders: {
      charges: "e.g., DUI, Assault, Possession",
      incident_description: "Describe what happened...",
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
    },
    fieldPlaceholders: {
      visa_type: "e.g., H-1B, F-1, Green Card",
      country_of_origin: "e.g., Mexico, India, Nigeria",
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
    },
    fieldPlaceholders: {
      assets_description: "Real estate, bank accounts, investments...",
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

function calculateProgress(
  clientInfo: any,
  formData: any,
  requiredFields: string[],
) {
  let clientCompleted = 0;
  if (clientInfo.first_name?.trim()) clientCompleted++;
  if (clientInfo.last_name?.trim()) clientCompleted++;

  const caseCompleted = requiredFields.filter((field) =>
    formData[field]?.trim(),
  ).length;
  const totalRequired = 2 + requiredFields.length;
  const completedRequired = clientCompleted + caseCompleted;
  const score =
    totalRequired > 0
      ? Math.round((completedRequired / totalRequired) * 100)
      : 0;
  return { score, completedRequired, totalRequired };
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
          style={{ transition: "stroke-dashoffset 400ms ease" }}
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
          Complete
        </span>
      </div>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3B5BDB]">
      {children}
    </p>
  );
}

const inputClass =
  "w-full px-4 py-3.5 text-base text-[#0E1320] placeholder:text-[#9AA3B5] bg-white border border-[#E0E4EE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/60 focus:border-[#3B5BDB] transition-shadow";

export default function PublicIntakePage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [intake, setIntake] = useState<any>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [clientInfo, setClientInfo] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const loaded = useRef(false);

  useEffect(() => {
    if (token) {
      fetchIntake();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Autosave draft per link so a refresh never loses the client's answers
  useEffect(() => {
    if (!loaded.current || submitted) return;
    try {
      localStorage.setItem(
        `caseready-draft-${token}`,
        JSON.stringify({ clientInfo, formData }),
      );
    } catch {
      /* storage unavailable — autosave is best-effort */
    }
  }, [clientInfo, formData, token, submitted]);

  const fetchIntake = async () => {
    try {
      const response = await fetch(`/api/public/intake/${token}`);
      const data = await response.json();

      if (response.ok) {
        setIntake(data);

        let nextForm = data.case_data || {};
        let nextClient = {
          first_name: data.client_first_name || "",
          last_name: data.client_last_name || "",
          email: data.client_email || "",
          phone: data.client_phone || "",
        };

        // A locally saved draft is newer than the server copy — restore it
        try {
          const raw = localStorage.getItem(`caseready-draft-${token}`);
          if (raw) {
            const draft = JSON.parse(raw);
            if (draft?.formData && Object.keys(draft.formData).length > 0) {
              nextForm = { ...nextForm, ...draft.formData };
              setDraftRestored(true);
            }
            if (draft?.clientInfo?.first_name || draft?.clientInfo?.email) {
              nextClient = { ...nextClient, ...draft.clientInfo };
            }
          }
        } catch {
          /* corrupted draft — ignore */
        }

        setFormData(nextForm);
        setClientInfo(nextClient);
        loaded.current = true;
      } else {
        setError(data.error || "This intake link is invalid or has expired.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
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
      const response = await fetch(`/api/public/intake/${token}`, {
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

      if (response.ok) {
        try {
          localStorage.removeItem(`caseready-draft-${token}`);
        } catch {
          /* ignore */
        }
        setSubmitted(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to submit form");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FB] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#64748B]">
          <div className="w-4 h-4 border-2 border-[#3B5BDB] border-t-transparent rounded-full animate-spin" />
          Loading your intake form...
        </div>
      </div>
    );
  }

  if (error && !intake) {
    return (
      <div className="min-h-screen bg-[#F7F8FB] flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white border border-[#E8EAF1] rounded-2xl p-10 text-center shadow-sm">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={28} className="text-[#C93B3B]" />
          </div>
          <h1
            className="text-3xl text-[#0E1320] mb-3"
            style={{ fontFamily: SERIF }}
          >
            This link isn&rsquo;t working
          </h1>
          <p className="text-[#475569] mb-2">{error}</p>
          <p className="text-sm text-[#94A3B8]">
            Contact your attorney to request a new intake link.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F7F8FB] flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white border border-[#E8EAF1] rounded-2xl p-10 text-center shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={28} className="text-[#12A06E]" />
          </div>
          <h1
            className="text-3xl text-[#0E1320] mb-3"
            style={{ fontFamily: SERIF }}
          >
            Thank you
          </h1>
          <p className="text-[#475569] mb-6">
            Your information has been securely delivered to your attorney.
            They&rsquo;ll review your case and reach out to you shortly.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-[#94A3B8]">
            <ShieldCheck size={15} className="text-[#12A06E]" />
            You may now close this page.
          </div>
        </div>
      </div>
    );
  }

  const currentConfig = caseTypeConfigs[intake.case_type];
  const { score, completedRequired, totalRequired } = calculateProgress(
    clientInfo,
    formData,
    currentConfig.required,
  );

  return (
    <div className="min-h-screen bg-[#F7F8FB] pb-20 lg:pb-0">
      <header className="bg-white/80 backdrop-blur border-b border-[#E8EAF1] px-6 py-4 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3B5BDB] flex items-center justify-center">
              <Briefcase size={15} className="text-white" />
            </div>
            <span className="font-semibold text-lg text-[#0E1320]">
              Case<span className="text-[#3B5BDB]">Ready</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
            <ShieldCheck size={14} className="text-[#12A06E]" />
            <span className="hidden sm:inline">Secure intake —</span> goes
            directly to your attorney
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10 max-w-2xl">
          <Eyebrow>Client intake</Eyebrow>
          <h1
            className="text-4xl sm:text-5xl text-[#0E1320] mt-3 mb-4"
            style={{ fontFamily: SERIF }}
          >
            {currentConfig.label} Intake
          </h1>
          <p className="text-[#475569] text-lg leading-relaxed">
            Your attorney has requested the information below to prepare your
            case. Everything you share here is confidential. Your answers are
            saved on this device as you type, so you can leave and come back.
          </p>
          {draftRestored && (
            <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 bg-[#EEF2FF] text-[#3B5BDB] text-sm font-medium rounded-lg">
              <CheckCircle2 size={15} />
              We restored your earlier answers — pick up where you left off.
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 w-full">
            <form onSubmit={handleSubmit}>
              <section className="bg-white rounded-2xl border border-[#E8EAF1] shadow-sm p-7 sm:p-10 mb-6">
                <div className="flex items-baseline justify-between gap-4 mb-7 pb-5 border-b border-[#EEF0F6]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
                      <User size={16} className="text-[#3B5BDB]" />
                    </div>
                    <h2 className="text-xl font-semibold text-[#0E1320]">
                      About you
                    </h2>
                  </div>
                  <span
                    className="text-xs text-[#94A3B8]"
                    style={{ fontFamily: MONO }}
                  >
                    1 / 2
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-[#334155] mb-2">
                      First name <span className="text-[#C93B3B]">*</span>
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
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#334155] mb-2">
                      Last name <span className="text-[#C93B3B]">*</span>
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
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-[#334155] mb-2">
                      <Mail size={13} className="text-[#94A3B8]" /> Email
                      address
                    </label>
                    <input
                      type="email"
                      value={clientInfo.email}
                      onChange={(e) =>
                        setClientInfo({ ...clientInfo, email: e.target.value })
                      }
                      placeholder="john@example.com"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-[#334155] mb-2">
                      <Phone size={13} className="text-[#94A3B8]" /> Phone
                      number
                    </label>
                    <input
                      type="tel"
                      value={clientInfo.phone}
                      onChange={(e) =>
                        setClientInfo({ ...clientInfo, phone: e.target.value })
                      }
                      placeholder="(555) 555-5555"
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-[#E8EAF1] shadow-sm p-7 sm:p-10">
                <div className="flex items-baseline justify-between gap-4 mb-7 pb-5 border-b border-[#EEF0F6]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
                      <Briefcase size={16} className="text-[#3B5BDB]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-[#0E1320]">
                        Your case
                      </h2>
                      <p className="text-sm text-[#94A3B8] mt-0.5">
                        {currentConfig.label} &middot;{" "}
                        {currentConfig.description}
                      </p>
                    </div>
                  </div>
                  <span
                    className="text-xs text-[#94A3B8]"
                    style={{ fontFamily: MONO }}
                  >
                    2 / 2
                  </span>
                </div>

                <div className="space-y-6">
                  {currentConfig.required.map((field: string) => {
                    const fieldType =
                      currentConfig.fieldTypes[field] ?? "textarea";
                    const placeholder =
                      currentConfig.fieldPlaceholders[field] ?? "";
                    const done = !!formData[field]?.trim();
                    return (
                      <div key={field}>
                        <label className="flex items-center gap-2 text-sm font-medium text-[#334155] mb-2">
                          {formatFieldName(field)}{" "}
                          <span className="text-[#C93B3B]">*</span>
                          {done && (
                            <CheckCircle2
                              size={14}
                              className="text-[#12A06E]"
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
                            className={inputClass}
                            style={{ fontFamily: MONO }}
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
                            className={inputClass}
                          />
                        ) : (
                          <textarea
                            rows={4}
                            required
                            value={formData[field] || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [field]: e.target.value,
                              })
                            }
                            placeholder={placeholder}
                            className={`${inputClass} resize-none leading-relaxed`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {error && (
                  <div className="mt-6 flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
                    <AlertCircle
                      size={16}
                      className="text-[#C93B3B] flex-shrink-0 mt-0.5"
                    />
                    <p className="text-sm text-[#9F2D2D]">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-8 w-full py-4 bg-[#3B5BDB] hover:bg-[#2F4AC2] text-white text-base font-semibold rounded-xl transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending to your attorney...
                    </>
                  ) : (
                    <>
                      Send to my attorney <ArrowRight size={17} />
                    </>
                  )}
                </button>
                <p className="mt-4 text-center text-xs text-[#94A3B8]">
                  Submitting shares this information only with the attorney who
                  sent you this link.
                </p>
              </section>
            </form>
          </div>

          <aside className="hidden lg:block w-80 flex-shrink-0 sticky top-24">
            <div className="bg-white rounded-2xl border border-[#E8EAF1] shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#EEF0F6]">
                <Eyebrow>Progress</Eyebrow>
                <p className="text-xs text-[#94A3B8] mt-1.5">
                  Updates as you type
                </p>
              </div>
              <div className="p-6">
                <ScoreRing score={score} />
                <div className="mt-6 flex justify-between items-baseline text-sm mb-2">
                  <span className="font-medium text-[#475569]">
                    Required fields
                  </span>
                  <span
                    style={{ fontFamily: MONO, color: scoreColor(score) }}
                    className="font-medium"
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
                <div className="mt-5 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    {clientInfo.first_name && clientInfo.last_name ? (
                      <CheckCircle2 size={14} className="text-[#12A06E]" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-[#D7DCE7]" />
                    )}
                    <span className="text-xs text-[#475569]">
                      Your full name
                    </span>
                  </div>
                  {currentConfig.required.map((field: string) => (
                    <div key={field} className="flex items-center gap-2.5">
                      {formData[field]?.trim() ? (
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
                    ? "Ready to send"
                    : score >= 50
                      ? "Almost there — keep going"
                      : "Fill in the required fields"}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile progress bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-[#E8EAF1] px-5 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-xs font-medium text-[#475569]">
                Progress
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
