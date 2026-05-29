"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  ArrowRight,
  Shield,
  CheckCircle2,
  Mail,
  Lock,
  User,
  Building2,
  Eye,
  EyeOff,
} from "lucide-react";

const BENEFITS = [
  "Cancel anytime",
  "All features included",
  "Secure & encrypted",
  "Attorney-focused platform",
];

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [firmName, setFirmName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email,
          password,
          options: {
            data: { full_name: fullName, firm_name: firmName },
          },
        },
      );

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (authData?.session) {
        router.push("/dashboard");
      } else {
        setConfirmEmail(true);
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  const inputCls = (field: string) =>
    `w-full pl-12 pr-4 py-4 text-base border-2 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-150 ${
      focusedField === field
        ? "border-[#3B5BDB] ring-4 ring-[#EEF2FF]"
        : "border-gray-200 hover:border-gray-300"
    }`;

  return (
    <div className="min-h-screen bg-[#F7F7FB] flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex w-[460px] flex-shrink-0 bg-gray-900 flex-col justify-between p-14">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3B5BDB] flex items-center justify-center">
            <Briefcase size={20} className="text-white" />
          </div>
          <span className="font-bold text-2xl text-white">
            Case<span className="text-[#7B9EFF]">Ready</span>
          </span>
        </Link>

        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-5">
            Walk into every consultation prepared
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-12">
            Structured intake forms, automatic readiness scores, and one-click
            PDF reports — built for solo attorneys.
          </p>
          <div className="space-y-5">
            {[
              "Readiness score on every intake",
              "Missing document detection",
              "One-click PDF report export",
              "Public intake links for clients",
            ].map((item) => (
              <div key={item} className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full bg-[#3B5BDB]/25 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={14} className="text-[#7B9EFF]" />
                </div>
                <span className="text-base text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <p className="text-base text-gray-400 italic leading-relaxed">
            "The readiness score alone is worth it. I know which cases are ready
            before I walk in."
          </p>
          <p className="text-sm text-gray-600 mt-3">
            Rachel Conley — Solo Personal Injury Attorney
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-3 mb-10 lg:hidden">
          <div className="w-10 h-10 rounded-xl bg-[#3B5BDB] flex items-center justify-center">
            <Briefcase size={20} className="text-white" />
          </div>
          <span className="font-bold text-2xl text-gray-900">
            Case<span className="text-[#3B5BDB]">Ready</span>
          </span>
        </Link>

        <div className="w-full max-w-[480px]">
          {/* Heading */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
              {confirmEmail ? "Check your email" : "Create your account"}
            </h1>
            <p className="text-base text-gray-500">
              {confirmEmail
                ? "We sent a confirmation link to your inbox"
                : "Get started with CaseReady"}
            </p>
          </div>

          {/* Email confirmed screen */}
          {confirmEmail ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
                <Mail size={36} className="text-emerald-500" />
              </div>
              <p className="text-base text-gray-600 leading-relaxed mb-1">
                We sent a confirmation link to
              </p>
              <p className="text-lg font-bold text-gray-900 mb-5">{email}</p>
              <p className="text-sm text-gray-400 mb-8">
                Click the link to activate your account and access your
                dashboard.
              </p>
              <div className="pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-400">
                  Didn't receive it?{" "}
                  <button
                    onClick={() => {
                      setConfirmEmail(false);
                      setError("");
                    }}
                    className="font-semibold text-[#3B5BDB] hover:underline"
                  >
                    Try again
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Error */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                  </div>
                  <p className="text-sm text-red-600 leading-relaxed">
                    {error}
                  </p>
                </div>
              )}

              {/* Form card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Full name */}
                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-2">
                      Full name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User
                        size={20}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        onFocus={() => setFocusedField("fullName")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="John Doe"
                        className={inputCls("fullName")}
                      />
                    </div>
                  </div>

                  {/* Firm name */}
                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-2">
                      Firm name{" "}
                      <span className="text-gray-400 font-normal text-sm">
                        (optional)
                      </span>
                    </label>
                    <div className="relative">
                      <Building2
                        size={20}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        value={firmName}
                        onChange={(e) => setFirmName(e.target.value)}
                        onFocus={() => setFocusedField("firmName")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Law Office of John Doe"
                        className={inputCls("firmName")}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-2">
                      Email address <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail
                        size={20}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="john@lawfirm.com"
                        className={inputCls("email")}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-2">
                      Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock
                        size={20}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Min. 6 characters"
                        className={`${inputCls("password")} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      Must be at least 6 characters
                    </p>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#3B5BDB] hover:bg-[#2F4AC2] text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-base flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                {/* Benefits */}
                <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-3">
                  {BENEFITS.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-sm text-gray-500"
                    >
                      <CheckCircle2
                        size={15}
                        className="text-emerald-500 flex-shrink-0"
                      />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sign in link */}
              <div className="mt-6 text-center">
                <p className="text-base text-gray-400">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-[#3B5BDB] hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>

              {/* Trust + back */}
              <div className="mt-6 flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Shield size={15} />
                  <span>Secure · Encrypted · Attorney-focused</span>
                </div>
                <Link
                  href="/"
                  className="text-sm text-gray-400 hover:text-[#3B5BDB] transition"
                >
                  ← Back to home
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
