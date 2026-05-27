"use client";

import { useRouter } from "next/navigation";
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
  LogOut,
  LayoutDashboard,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface FieldConfig {
  label: string;
  type: "text" | "date" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
  hint?: string;
}

interface CaseConfig {
  label: string;
  description: string;
  required: Record<string, FieldConfig>;
  optional: Record<string, FieldConfig>;
}

// ─────────────────────────────────────────────────────────────
// Case configs — proper input types per field
// ─────────────────────────────────────────────────────────────

const CASE_CONFIGS: Record<string, CaseConfig> = {
  personal_injury: {
    label: "Personal Injury",
    description: "Accidents, injuries, liability claims",
    required: {
      incident_date: {
        label: "Incident Date",
        type: "date",
        hint: "Date the injury or accident occurred",
      },
      injury_description: {
        label: "Injury Description",
        type: "textarea",
        placeholder: "Describe the injuries sustained...",
        hint: "Include severity, body parts affected, treatment received",
      },
      medical_providers: {
        label: "Medical Providers",
        type: "text",
        placeholder: "e.g., General Hospital, Dr. Smith",
        hint: "Hospitals, doctors, or clinics visited",
      },
      liability_description: {
        label: "How did the accident happen?",
        type: "textarea",
        placeholder:
          "Describe how the accident occurred and who was at fault...",
      },
    },
    optional: {
      police_report_number: {
        label: "Police Report Number",
        type: "text",
        placeholder: "e.g., RPT-2024-00123",
      },
      witnesses: {
        label: "Witness Names & Contact",
        type: "textarea",
        placeholder: "Name and phone number of any witnesses...",
      },
      insurance_info: {
        label: "Insurance Information",
        type: "text",
        placeholder: "e.g., State Farm, Policy #12345",
      },
    },
  },
  family: {
    label: "Family Law",
    description: "Divorce, custody, child support",
    required: {
      opposing_party_name: {
        label: "Opposing Party Full Name",
        type: "text",
        placeholder: "e.g., Jane Smith",
      },
      marriage_date: {
        label: "Date of Marriage",
        type: "date",
        hint: "Legal date of marriage",
      },
      children_info: {
        label: "Children (if any)",
        type: "textarea",
        placeholder: "Names and ages of children involved...",
        hint: "Leave blank if no children are involved",
      },
      asset_description: {
        label: "Marital Assets",
        type: "textarea",
        placeholder: "Describe shared property, accounts, or assets...",
      },
    },
    optional: {
      prenuptial_agreement: {
        label: "Prenuptial Agreement",
        type: "select",
        options: ["None", "Yes — signed", "Yes — disputed"],
      },
      custody_preferences: {
        label: "Custody Preferences",
        type: "textarea",
        placeholder: "Describe desired custody arrangement...",
      },
      separation_date: {
        label: "Date of Separation",
        type: "date",
      },
    },
  },
  criminal_defense: {
    label: "Criminal Defense",
    description: "Charges, arrests, defense strategy",
    required: {
      charges: {
        label: "Charges Filed",
        type: "text",
        placeholder: "e.g., DUI, Assault, Possession",
        hint: "List all charges as they appear on the complaint",
      },
      arrest_date: {
        label: "Arrest / Incident Date",
        type: "date",
      },
      incident_description: {
        label: "Description of Incident",
        type: "textarea",
        placeholder: "Describe what happened from the client's perspective...",
      },
      court_date: {
        label: "Next Court Date",
        type: "date",
        hint: "Leave blank if not yet scheduled",
      },
    },
    optional: {
      prior_convictions: {
        label: "Prior Convictions",
        type: "textarea",
        placeholder: "List any prior criminal history...",
      },
      bail_status: {
        label: "Bail Status",
        type: "select",
        options: [
          "Not applicable",
          "Released on bail",
          "Held in custody",
          "Released on own recognizance",
        ],
      },
      evidence_notes: {
        label: "Evidence / Witnesses",
        type: "textarea",
        placeholder: "Any known evidence or witnesses...",
      },
    },
  },
  immigration: {
    label: "Immigration",
    description: "Visas, green cards, citizenship",
    required: {
      visa_type: {
        label: "Visa / Immigration Category",
        type: "text",
        placeholder: "e.g., H-1B, F-1, Green Card, Asylum",
      },
      country_of_origin: {
        label: "Country of Origin",
        type: "text",
        placeholder: "e.g., Mexico, India, Nigeria",
      },
      current_status: {
        label: "Current Immigration Status",
        type: "text",
        placeholder: "e.g., Undocumented, F-1 student, H-1B worker",
      },
      filing_deadline: {
        label: "Filing Deadline",
        type: "date",
        hint: "Visa expiry, application deadline, or hearing date",
      },
    },
    optional: {
      prior_applications: {
        label: "Prior Applications / Denials",
        type: "textarea",
        placeholder: "Any previous USCIS applications or denials...",
      },
      dependents_info: {
        label: "Dependents",
        type: "textarea",
        placeholder: "Names and relationship of any dependents...",
      },
      criminal_history: {
        label: "Criminal History",
        type: "select",
        options: ["None", "Minor offense", "Felony (please describe below)"],
      },
    },
  },
  estate_planning: {
    label: "Estate Planning",
    description: "Wills, trusts, power of attorney",
    required: {
      assets_description: {
        label: "Assets to Include",
        type: "textarea",
        placeholder: "Real estate, bank accounts, investments, vehicles...",
        hint: "Estimated value is helpful but not required",
      },
      beneficiaries: {
        label: "Beneficiaries",
        type: "textarea",
        placeholder: "Names and relationship to client...",
      },
      executor_name: {
        label: "Executor / Personal Representative",
        type: "text",
        placeholder: "Full name of the executor",
      },
      will_exists: {
        label: "Existing Will?",
        type: "select",
        options: [
          "No existing will",
          "Yes — needs updating",
          "Yes — reviewing only",
        ],
      },
    },
    optional: {
      trust_info: {
        label: "Trust Information",
        type: "textarea",
        placeholder: "Details about any existing or desired trusts...",
      },
      healthcare_directive: {
        label: "Healthcare Directive",
        type: "select",
        options: ["Not needed", "Needed — new", "Existing — review"],
      },
      power_of_attorney: {
        label: "Power of Attorney",
        type: "select",
        options: ["Not needed", "Needed — new", "Existing — review"],
      },
    },
  },
};

// ─────────────────────────────────────────────────────────────
// Readiness score calculator
// ─────────────────────────────────────────────────────────────

function calcScore(
  caseType: string,
  caseData: Record<string, string>,
  clientFirst: string,
  clientLast: string,
): { score: number; completedRequired: number; totalRequired: number } {
  const config = CASE_CONFIGS[caseType];
  if (!config) return { score: 0, completedRequired: 0, totalRequired: 0 };

  const requiredKeys = Object.keys(config.required);
  const optionalKeys = Object.keys(config.optional);

  const clientComplete =
    (clientFirst.trim() ? 1 : 0) + (clientLast.trim() ? 1 : 0);
  const totalRequired = requiredKeys.length + 2;
  const completedRequired =
    clientComplete + requiredKeys.filter((k) => caseData[k]?.trim()).length;

  const totalOptional = optionalKeys.length;
  const completedOptional = optionalKeys.filter((k) =>
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

// ─────────────────────────────────────────────────────────────
// Field renderer — correct input type per field
// ─────────────────────────────────────────────────────────────

function FieldInput({
  config,
  value,
  hasError,
  onChange,
  onBlur,
}: {
  config: FieldConfig;
  value: string;
  hasError: boolean;
  onChange: (v: string) => void;
  onBlur: () => void;
}) {
  const base =
    "w-full px-4 py-3 text-base border rounded-xl outline-none transition focus:ring-2 focus:ring-[#2D5BE3] focus:border-transparent bg-white";
  const borderCls = hasError
    ? "border-red-300 bg-red-50/40"
    : "border-gray-200 hover:border-gray-300";

  if (config.type === "textarea") {
    return (
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={config.placeholder}
        className={`${base} ${borderCls} resize-none`}
      />
    );
  }

  if (config.type === "select" && config.options) {
    return (
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={`${base} ${borderCls} appearance-none cursor-pointer pr-10`}
        >
          <option value="">Select an option...</option>
          {config.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
    );
  }

  return (
    <input
      type={config.type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={config.placeholder}
      className={`${base} ${borderCls}`}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Score ring
// ─────────────────────────────────────────────────────────────

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
        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">
          Ready
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────

function Sidebar({
  userName,
  onSignOut,
}: {
  userName: string;
  onSignOut: () => void;
}) {
  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-50 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
          <Briefcase size={16} className="text-white" />
        </div>
        <span className="font-bold text-lg text-gray-900">
          Case<span className="text-[#2D5BE3]">Ready</span>
        </span>
      </div>

      {/* User */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#2D5BE3] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">
            {userName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">
            {userName}
          </div>
          <div className="text-xs text-gray-400">Solo Practitioner</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        <p className="text-xs font-bold tracking-widest uppercase text-gray-300 px-2 pb-2">
          Main
        </p>
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all"
        >
          <LayoutDashboard size={17} className="text-gray-400" />
          Dashboard
        </Link>
        <Link
          href="/dashboard/intakes/new"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-[#EEF3FF] text-[#2D5BE3]"
        >
          <FileText size={17} className="text-[#2D5BE3]" />
          New Intake
        </Link>
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────

export default function NewIntakePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [userName, setUserName] = useState("Attorney");
  const [showValidation, setShowValidation] = useState(false);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const supabase = createClient();

  const [form, setForm] = useState({
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
        setUserName(
          data.user.user_metadata?.full_name ??
            data.user.email?.split("@")[0] ??
            "Attorney",
        );
      }
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const config = CASE_CONFIGS[form.case_type];

  const { score, completedRequired, totalRequired } = useMemo(
    () =>
      calcScore(
        form.case_type,
        form.case_data,
        form.client_first_name,
        form.client_last_name,
      ),
    [form],
  );

  const handleCaseTypeChange = (ct: string) => {
    setForm({ ...form, case_type: ct, case_data: {} });
    setTouched(new Set());
    setShowValidation(false);
  };

  const setField = (key: string, val: string) => {
    setForm((prev) => ({
      ...prev,
      case_data: { ...prev.case_data, [key]: val },
    }));
  };

  const touch = (key: string) => setTouched((prev) => new Set(prev).add(key));

  const fieldHasError = (key: string) =>
    (showValidation || touched.has(key)) && !form.case_data[key]?.trim();

  const clientHasError = (key: "client_first_name" | "client_last_name") =>
    (showValidation || touched.has(key)) && !form[key].trim();

  const isValid =
    !!form.client_first_name.trim() &&
    !!form.client_last_name.trim() &&
    Object.keys(config.required).every((k) => form.case_data[k]?.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);
    if (!isValid) {
      setSubmitError("Please complete all required fields.");
      document
        .querySelector(".field-error")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/intakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_first_name: form.client_first_name,
          client_last_name: form.client_last_name,
          client_email: form.client_email || null,
          client_phone: form.client_phone || null,
          case_type: form.case_type,
          case_data: form.case_data,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setSubmitError(err.error || "Failed to create intake");
        setSubmitting(false);
        return;
      }
      const intake = await res.json();
      router.push(`/dashboard/intakes/${intake.id}`);
    } catch {
      setSubmitError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-[#F7F7FB]">
      <Sidebar userName={userName} onSignOut={handleSignOut} />

      <div className="pl-64">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30 px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition"
            >
              <ArrowLeft size={17} />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">
                New Client Intake
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Collect client information and case details
              </p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-[#2D5BE3] hover:bg-[#1A3EC0] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Intake
              </>
            )}
          </button>
        </header>

        {/* Page body — form + sticky score panel */}
        <div className="px-8 py-8 flex gap-8 items-start max-w-[1200px]">
          {/* ── LEFT: Form ── */}
          <form onSubmit={handleSubmit} className="flex-1 min-w-0 space-y-6">
            {/* Error banner */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle
                  size={18}
                  className="text-red-500 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-sm font-semibold text-red-700">
                    Could not save intake
                  </p>
                  <p className="text-sm text-red-500 mt-0.5">{submitError}</p>
                </div>
              </div>
            )}

            {/* Incomplete warning */}
            {showValidation && !isValid && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle
                  size={18}
                  className="text-amber-500 flex-shrink-0 mt-0.5"
                />
                <p className="text-sm text-amber-700 font-medium">
                  Please complete all required fields before saving.
                </p>
              </div>
            )}

            {/* ── CLIENT INFO ── */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60 flex items-center gap-2.5">
                <User size={17} className="text-[#2D5BE3]" />
                <h2 className="text-base font-bold text-gray-900">
                  Client Information
                </h2>
                <span className="text-xs text-red-500 font-medium ml-1">
                  * required
                </span>
              </div>
              <div className="p-6 grid grid-cols-2 gap-5">
                {/* First name */}
                <div
                  className={
                    clientHasError("client_first_name") ? "field-error" : ""
                  }
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.client_first_name}
                    onChange={(e) =>
                      setForm({ ...form, client_first_name: e.target.value })
                    }
                    onBlur={() => touch("client_first_name")}
                    placeholder="John"
                    className={`w-full px-4 py-3 text-base border rounded-xl outline-none transition focus:ring-2 focus:ring-[#2D5BE3] focus:border-transparent bg-white ${
                      clientHasError("client_first_name")
                        ? "border-red-300 bg-red-50/40"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  />
                  {clientHasError("client_first_name") && (
                    <p className="text-xs text-red-500 mt-1.5">
                      First name is required
                    </p>
                  )}
                </div>

                {/* Last name */}
                <div
                  className={
                    clientHasError("client_last_name") ? "field-error" : ""
                  }
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.client_last_name}
                    onChange={(e) =>
                      setForm({ ...form, client_last_name: e.target.value })
                    }
                    onBlur={() => touch("client_last_name")}
                    placeholder="Doe"
                    className={`w-full px-4 py-3 text-base border rounded-xl outline-none transition focus:ring-2 focus:ring-[#2D5BE3] focus:border-transparent bg-white ${
                      clientHasError("client_last_name")
                        ? "border-red-300 bg-red-50/40"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  />
                  {clientHasError("client_last_name") && (
                    <p className="text-xs text-red-500 mt-1.5">
                      Last name is required
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    <Mail size={13} className="inline mr-1.5 text-gray-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={form.client_email}
                    onChange={(e) =>
                      setForm({ ...form, client_email: e.target.value })
                    }
                    placeholder="john@email.com"
                    className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl outline-none transition focus:ring-2 focus:ring-[#2D5BE3] focus:border-transparent bg-white hover:border-gray-300"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    <Phone size={13} className="inline mr-1.5 text-gray-400" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={form.client_phone}
                    onChange={(e) =>
                      setForm({ ...form, client_phone: e.target.value })
                    }
                    placeholder="(555) 555-5555"
                    className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl outline-none transition focus:ring-2 focus:ring-[#2D5BE3] focus:border-transparent bg-white hover:border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* ── CASE TYPE ── */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60 flex items-center gap-2.5">
                <FileText size={17} className="text-[#2D5BE3]" />
                <h2 className="text-base font-bold text-gray-900">Case Type</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2.5 mb-3">
                  {Object.entries(CASE_CONFIGS).map(([key, cfg]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleCaseTypeChange(key)}
                      className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        form.case_type === key
                          ? "bg-[#EEF3FF] border-[#C5D4FF] text-[#2D5BE3]"
                          : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-800 bg-white"
                      }`}
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-400">{config.description}</p>
              </div>
            </div>

            {/* ── REQUIRED FIELDS ── */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60 flex items-center gap-2.5">
                <div className="w-1.5 h-5 rounded-full bg-red-400 flex-shrink-0" />
                <h2 className="text-base font-bold text-gray-900">
                  Required Information
                </h2>
                <span className="ml-auto text-sm text-gray-400">
                  {
                    Object.keys(config.required).filter((k) =>
                      form.case_data[k]?.trim(),
                    ).length
                  }{" "}
                  / {Object.keys(config.required).length} complete
                </span>
              </div>
              <div className="p-6 space-y-5">
                {Object.entries(config.required).map(([key, fieldCfg]) => {
                  const hasError = fieldHasError(key);
                  const isFilled = !!form.case_data[key]?.trim();
                  return (
                    <div key={key} className={hasError ? "field-error" : ""}>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                        {fieldCfg.label}
                        <span className="text-red-500">*</span>
                        {isFilled && !hasError && (
                          <CheckCircle2
                            size={14}
                            className="text-emerald-500"
                          />
                        )}
                      </label>
                      {fieldCfg.hint && (
                        <p className="text-xs text-gray-400 mb-2">
                          {fieldCfg.hint}
                        </p>
                      )}
                      <FieldInput
                        config={fieldCfg}
                        value={form.case_data[key] || ""}
                        hasError={hasError}
                        onChange={(v) => setField(key, v)}
                        onBlur={() => touch(key)}
                      />
                      {hasError && (
                        <p className="text-xs text-red-500 mt-1.5">
                          {fieldCfg.label} is required
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── OPTIONAL FIELDS ── */}
            {Object.keys(config.optional).length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60 flex items-center gap-2.5">
                  <div className="w-1.5 h-5 rounded-full bg-gray-300 flex-shrink-0" />
                  <h2 className="text-base font-bold text-gray-900">
                    Optional Information
                  </h2>
                  <span className="text-sm text-gray-400">
                    Improves readiness score
                  </span>
                </div>
                <div className="p-6 space-y-5">
                  {Object.entries(config.optional).map(([key, fieldCfg]) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                        {fieldCfg.label}
                      </label>
                      <FieldInput
                        config={fieldCfg}
                        value={form.case_data[key] || ""}
                        hasError={false}
                        onChange={(v) => setField(key, v)}
                        onBlur={() => touch(key)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom actions */}
            <div className="flex justify-end gap-4 pb-10">
              <Link
                href="/dashboard"
                className="px-6 py-3 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#2D5BE3] hover:bg-[#1A3EC0] disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition shadow-sm"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Intake
                  </>
                )}
              </button>
            </div>
          </form>

          {/* ── RIGHT: Live readiness panel ── */}
          <div className="w-72 flex-shrink-0 sticky top-24">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60">
                <h3 className="text-base font-bold text-gray-900">
                  Readiness Score
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Updates as you fill the form
                </p>
              </div>

              <div className="p-5">
                {/* Ring */}
                <ScoreRing score={score} />

                {/* Required progress bar */}
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
                        width: `${
                          totalRequired > 0
                            ? (completedRequired / totalRequired) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Per-field checklist */}
                <div className="mt-4 space-y-2">
                  {/* Client name row */}
                  <div className="flex items-center gap-2.5">
                    {form.client_first_name && form.client_last_name ? (
                      <CheckCircle2
                        size={15}
                        className="text-emerald-500 flex-shrink-0"
                      />
                    ) : (
                      <AlertCircle
                        size={15}
                        className="text-red-400 flex-shrink-0"
                      />
                    )}
                    <span className="text-sm text-gray-600 truncate">
                      Client name
                    </span>
                  </div>

                  {Object.entries(config.required).map(([key, fieldCfg]) => {
                    const filled = !!form.case_data[key]?.trim();
                    return (
                      <div key={key} className="flex items-center gap-2.5">
                        {filled ? (
                          <CheckCircle2
                            size={15}
                            className="text-emerald-500 flex-shrink-0"
                          />
                        ) : (
                          <AlertCircle
                            size={15}
                            className="text-red-400 flex-shrink-0"
                          />
                        )}
                        <span
                          className={`text-sm truncate ${
                            filled
                              ? "text-gray-400 line-through"
                              : "text-gray-700 font-medium"
                          }`}
                        >
                          {fieldCfg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Status pill */}
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
                    ? "✓ Ready for consultation"
                    : score >= 50
                      ? "Almost there — keep going"
                      : "Fill required fields to continue"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
