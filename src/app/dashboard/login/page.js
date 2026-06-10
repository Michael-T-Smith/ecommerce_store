// src/app/dashboard/login/page.js
"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BirdLogo from "@/app/components/icons/BirdLogo";
import { C }      from "@/lib/brand";

function LoginContent() {
  const searchParams = useSearchParams();
  // Guard against a redirect loop if ?redirect points back to login
  const rawRedirect  = searchParams.get("redirect") || "";
  const redirect     = rawRedirect.startsWith("/dashboard") && !rawRedirect.startsWith("/dashboard/login")
    ? rawRedirect
    : "/dashboard";
  const reason       = searchParams.get("reason");

  const [email,    setEmail   ] = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError   ] = useState(
    reason === "session_expired" ? "Your session expired. Please sign in again." : null
  );
  const [loading,  setLoading ] = useState(false);
  const [showPass, setShowPass ] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res  = await fetch("/api/auth/login", {
        method  : "POST",
        headers : { "Content-Type": "application/json" },
        body    : JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Sign in failed. Please try again.");
        setLoading(false);
        return;
      }

      // Success — use full navigation so the browser includes the new
      // lambs_session cookie in the request headers middleware reads.
      // router.push() does a client-side fetch that bypasses this.
      window.location.href = redirect;

    } catch {
      setError("Unable to reach the server. Please try again.");
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: C.darkGrey }}
    >
      {/* Diagonal stripe wallpaper */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(-55deg,
            transparent 0px, transparent 60px,
            rgba(212,81,26,0.07) 60px, rgba(212,81,26,0.07) 70px,
            transparent 70px, transparent 80px,
            rgba(212,81,26,0.03) 80px, rgba(212,81,26,0.03) 86px)`,
        }}
      />

      {/* Vertical door stripes — left edge */}
      <div className="absolute left-0 top-0 bottom-0 flex gap-[3px]">
        <div className="w-3 h-full bg-brand-orange" />
        <div className="w-1.5 h-full bg-brand-gold" />
        <div className="w-3 h-full bg-brand-orange" />
      </div>

      {/* Login card */}
      <div className="w-full max-w-[420px] relative z-10">

        {/* Logo mark */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-[72px] h-[72px] bg-brand-orange rounded-full border-[4px] border-brand-cream flex items-center justify-center relative overflow-hidden mb-4 shadow-retro-md"
          >
            <div
              className="absolute inset-0"
              style={{
                background: `repeating-linear-gradient(-55deg,
                  transparent 0, transparent 5px,
                  rgba(0,0,0,0.12) 5px, rgba(0,0,0,0.12) 8px)`,
              }}
            />
            <div className="z-10">
              <BirdLogo size={40} color={C.cream} />
            </div>
            {/* Gold pinstripe ring */}
            <div className="absolute inset-[8px] rounded-full border-2 border-brand-gold/50 pointer-events-none" />
          </div>
          <div className="font-serif font-black text-brand-cream text-[26px] tracking-[-1px] leading-none mb-1">
            BityBird Co
          </div>
          <div className="font-sans font-extrabold text-[10px] tracking-[4px] uppercase text-brand-orange">
            Dashboard
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border-[3px] border-brand-black shadow-retro-lg overflow-hidden">

          {/* Card header stripe */}
          <div
            className="h-[5px] w-full"
            style={{
              background: `repeating-linear-gradient(90deg,
                ${C.blush} 0, ${C.blush} 40px,
                ${C.gold}   40px, ${C.gold}   50px,
                ${C.blush} 50px, ${C.blush} 90px,
                ${C.black}  90px, ${C.black}  94px)`,
            }}
          />

          <div className="px-8 py-8">
            <h1 className="font-serif font-black text-brand-black text-[22px] tracking-[-0.5px] mb-1">
              Sign In
            </h1>
            <p className="font-sans text-brand-smoke text-[13px] mb-7">
              Use your BityBird Co staff credentials.
            </p>

            {/* Error banner */}
            {error && (
              <div className="bg-red-50 border-2 border-red-300 px-4 py-3 mb-5 flex items-start gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span className="font-sans text-[13px] text-red-600 leading-relaxed">{error}</span>
              </div>
            )}

            {/* Email field */}
            <div className="mb-4">
              <label className="block font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="you@bitybird.com"
                autoComplete="email"
                disabled={loading}
                className="w-full border-2 border-gray-200 px-4 py-3 font-sans text-[14px] text-brand-black placeholder:text-brand-smoke/50 focus:outline-none focus:border-brand-orange transition-colors disabled:opacity-60"
              />
            </div>

            {/* Password field */}
            <div className="mb-7">
              <label className="block font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full border-2 border-gray-200 px-4 py-3 pr-12 font-sans text-[14px] text-brand-black placeholder:text-brand-smoke/50 focus:outline-none focus:border-brand-orange transition-colors disabled:opacity-60"
                />
                {/* Show/hide toggle */}
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-brand-smoke hover:text-brand-orange transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {/* Forgot password note */}
              <p className="font-sans text-[11px] text-brand-smoke/60 mt-2">
                Forgot your password? Ask your admin to run{" "}
                <code className="font-sans text-[11px] bg-gray-100 px-1.5 py-0.5 border border-gray-200">
                  node scripts/seed-admin.js --reset
                </code>
              </p>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-brand-orange text-brand-cream border-[3px] border-brand-black py-4 font-sans font-black text-[13px] tracking-[2px] uppercase cursor-pointer shadow-retro-md transition-all duration-100 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-retro-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-retro-md flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Signing In...
                </>
              ) : (
                "Sign In →"
              )}
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center font-sans text-[11px] text-brand-cream/30 mt-6 tracking-[1px]">
          BityBird Co Internal Dashboard · Not for public access
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.darkGrey }}>
        <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.blush} strokeWidth="2.5">
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}