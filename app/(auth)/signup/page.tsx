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

const SERIF = "'DM Serif Display', Georgia, serif";

const HIGHLIGHTS = [
  "Readiness score on every intake",
  "Missing document detection",
  "One-click report export",
  "Public intake links for clients",
];

const BENEFITS = [
  "No credit card required",
  "Secure & encrypted",
  "Works on any device",
  "Built for solo attorneys",
];

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [firmName, setFirmName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

  const inputCls = (field: string) =>
    `w-full pl-12 pr-4 py-3.5 text-base rounded-xl bg-white text-[#0E1320] placeholder:text-[#9AA3B5] outline-none transition-all duration-150 border ${
      focusedField === field
        ? "border-[#3B5BDB] ring-4 ring-[#EEF2FF]"
        : "border-[#E0E4EE] hover:border-[#C9D0DE]"
    }`;

  return (
    <div className="min-h-screen bg-[#F7F8FB] flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex w-[460px] flex-shrink-0 bg-[#0E1320] flex-col justify-between p-14">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3B5BDB] flex items-center justify-center">
            <Briefcase size={20} className="text-white" />
          </div>
          <span className="font-semibold text-2xl text-white">
            Case<span className="text-[#7B9EFF]">Ready</span>
          </span>
        </Link>

        <div>
          <h2
            className="text-4xl text-white leading-tight mb-5"
            style={{ fontFamily: SERIF }}
          >
            Walk into every consultation prepared
          </h2>
          <p className="text-[#94A3B8] text-lg leading-relaxed mb-12">
            Structured intake forms, automatic readiness scores, and one-click
            reports — built for solo attorneys.
          </p>
          <div className="space-y-5">
            {HIGHLIGHTS.map((item) => (
              <div key={item} className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full bg-[#3B5BDB]/25 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={14} className="text-[#7B9EFF]" />
                </div>
                <span className="text-base text-[#CBD3E1]">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <p className="text-base text-[#94A3B8] leading-relaxed">
            Know which cases are ready before the consultation — not after.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
        <Link href="/" className="flex items-center gap-3 mb-10 lg:hidden">
          <div className="w-10 h-10 rounded-xl bg-[#3B5BDB] flex items-center justify-center">
            <Briefcase size={20} className="text-white" />
          </div>
          <span className="font-semibold text-2xl text-[#0E1320]">
            Case<span className="text-[#3B5BDB]">Ready</span>
          </span>
        </Link>

        <div className="w-full max-w-[460px]">
          <div className="mb-8">
            <h1
              className="text-3xl text-[#0E1320] tracking-tight mb-2"
              style={{ fontFamily: SERIF }}
            >
              {confirmEmail ? "Check your email" : "Create your account"}
            </h1>
            <p className="text-base text-[#64748B]">
              {confirmEmail
                ? "We sent a confirmation link to your inbox"
                : "Get started with CaseReady"}
            </p>
          </div>

          {confirmEmail ? (
            <div className="bg-white rounded-2xl border border-[#E8EAF1] shadow-sm p-10 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
                <Mail size={34} className="text-[#12A06E]" />
              </div>
              <p className="text-base text-[#475569] leading-relaxed mb-1">
                We sent a confirmation link to
              </p>
              <p className="text-lg font-semibold text-[#0E1320] mb-5">
                {email}
              </p>
              <p className="text-sm text-[#94A3B8] mb-8">
                Click the link to activate your account and access your
                dashboard.
              </p>
              <div className="pt-6 border-t border-[#EEF0F6]">
                <p className="text-sm text-[#94A3B8]">
                  Didn&rsquo;t receive it?{" "}
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
              {error && (
                <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#C93B3B]" />
                  </div>
                  <p className="text-sm text-[#9F2D2D] leading-relaxed">
                    {error}
                  </p>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-[#E8EAF1] shadow-sm p-8 sm:p-10">
                {/* Google Sign Up Button */}
                <button
                  onClick={handleGoogleSignUp}
                  disabled={googleLoading}
                  className="w-full py-3.5 bg-white hover:bg-gray-50 text-[#334155] font-semibold rounded-xl transition-all shadow-sm border border-[#E0E4EE] flex items-center justify-center gap-3 mb-6"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="#FFC107"
                      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                    />
                    <path
                      fill="#FF3D00"
                      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                    />
                  </svg>
                  {googleLoading
                    ? "Redirecting to Google..."
                    : "Continue with Google"}
                </button>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E8EAF1]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-[#94A3B8]">
                      or sign up with email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-2">
                      Full name <span className="text-[#C93B3B]">*</span>
                    </label>
                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
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

                  <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-2">
                      Firm name{" "}
                      <span className="text-[#94A3B8] font-normal text-sm">
                        (optional)
                      </span>
                    </label>
                    <div className="relative">
                      <Building2
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
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

                  <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-2">
                      Email address <span className="text-[#C93B3B]">*</span>
                    </label>
                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
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

                  <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-2">
                      Password <span className="text-[#C93B3B]">*</span>
                    </label>
                    <div className="relative">
                      <Lock
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
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
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-[#94A3B8] mt-2">
                      Must be at least 6 characters
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#3B5BDB] hover:bg-[#2F4AC2] text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-base flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create account <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-[#EEF0F6] grid grid-cols-2 gap-3">
                  {BENEFITS.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-sm text-[#64748B]"
                    >
                      <CheckCircle2
                        size={15}
                        className="text-[#12A06E] flex-shrink-0"
                      />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-base text-[#64748B]">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-[#3B5BDB] hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>

              <div className="mt-6 flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                  <Shield size={15} />
                  <span>Secure · Encrypted · Attorney-focused</span>
                </div>
                <Link
                  href="/"
                  className="text-sm text-[#94A3B8] hover:text-[#3B5BDB] transition"
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
