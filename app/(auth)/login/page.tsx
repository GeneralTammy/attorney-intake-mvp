"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  ArrowRight,
  Shield,
  Mail,
  Lock,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const inputCls = (field: string) =>
    `w-full pl-12 pr-4 py-4 text-base border-2 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-150 ${
      focusedField === field
        ? "border-[#3B5BDB] ring-4 ring-[#EEF2FF]"
        : "border-gray-200 hover:border-gray-300"
    }`;

  return (
    <div className="min-h-screen bg-[#F7F7FB] flex">
      {/* ── Left branding panel ── */}
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
            Your client intakes are waiting
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-12">
            Sign back in to check readiness scores, review missing documents,
            and generate PDF reports.
          </p>
          <div className="space-y-5">
            {[
              "Live readiness scores",
              "Missing document alerts",
              "One-click PDF export",
              "Public intake links",
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
            "Missing document detection means I'm never blindsided. The PDF
            report stays in the case file permanently."
          </p>
          <p className="text-sm text-gray-600 mt-3">
            Tanya Perez — Immigration Attorney
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
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
              Welcome back
            </h1>
            <p className="text-base text-gray-500">
              Sign in to your attorney account
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
              </div>
              <p className="text-sm text-red-600 leading-relaxed">{error}</p>
            </div>
          )}

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">
                  Email address
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
                    placeholder="you@lawfirm.com"
                    className={inputCls("email")}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-base font-semibold text-gray-800">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-[#3B5BDB] hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
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
                    placeholder="••••••••"
                    className={`${inputCls("password")} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
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
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-sm text-gray-400">
                  New to CaseReady?
                </span>
              </div>
            </div>

            {/* Sign up */}
            <Link
              href="/signup"
              className="block w-full text-center py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-base rounded-xl border border-gray-200 transition"
            >
              Create a free account
            </Link>
          </div>

          {/* Trust + back */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Shield size={15} />
              <span>14-day free trial · No credit card required</span>
            </div>
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-[#3B5BDB] transition"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
