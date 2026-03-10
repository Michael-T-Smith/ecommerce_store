
"use client";

import { useState, useEffect }        from "react";
import { useSearchParams } from "next/navigation";
import Link                           from "next/link";
import { B }                          from "@/lib/brand";

export default function AccountLoginPage() {
  const searchParams = useSearchParams();
  const redirect     = searchParams.get("redirect") || "/account/orders";
  const reason       = searchParams.get("reason");

  const [tab,          setTab         ] = useState("signin");
  const [loading,      setLoading     ] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error,        setError       ] = useState(
    reason === "session_expired" ? "Your session expired. Please sign in again." : null
  );

  const [signIn, setSignIn] = useState({ email: "", password: "" });
  const [showSignInPass, setShowSignInPass] = useState(false);

  const [reg, setReg] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showRegPass, setShowRegPass] = useState(false);

  // ── Already authenticated? Skip the form ─────────────────────
  useEffect(() => {
    fetch("/api/customers/session")
      .then((r) => r.json())
      .then((data) => {
        if (data.customer) {
          window.location.href = redirect;
        } else {
          setCheckingAuth(false);
        }
      })
      .catch(() => setCheckingAuth(false));
  }, [redirect]);

  const handleSignIn = async () => {
    if (!signIn.email || !signIn.password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/customers/login", {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify(signIn),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      window.location.href = redirect;
    } catch {
      setError("Unable to reach the server. Please try again.");
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!reg.name || !reg.email || !reg.password) {
      setError("Name, email, and password are required.");
      return;
    }
    if (reg.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (reg.password !== reg.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/customers/register", {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({ name: reg.name, email: reg.email, phone: reg.phone, password: reg.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      window.location.href = redirect;
    } catch {
      setError("Unable to reach the server. Please try again.");
      setLoading(false);
    }
  };

  const handleKey = (e, fn) => { if (e.key === "Enter") fn(); };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: B.cream }}>
        <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24"
          fill="none" stroke={B.orange} strokeWidth="2.5">
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
      </div>
    );
  }

  const inputCls = "w-full border-2 border-gray-200 px-4 py-3 font-sans text-[14px] text-brand-black placeholder:text-brand-smoke/50 focus:outline-none focus:border-brand-orange transition-colors";
  const Label = ({ children }) => (
    <label className="block font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-1.5">{children}</label>
  );
  const EyeIcon = ({ visible }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {visible
        ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
    </svg>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: B.cream }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `repeating-linear-gradient(-55deg, transparent 0px, transparent 80px, rgba(212,81,26,0.04) 80px, rgba(212,81,26,0.04) 86px)`,
      }} />

      <div className="w-full max-w-[460px] relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="no-underline inline-block">
            <div className="font-serif font-black text-brand-black text-[28px] tracking-[-1px] leading-none">Lamb&apos;s Florist</div>
            <div className="font-sans font-extrabold text-[10px] tracking-[4px] uppercase text-brand-orange mt-1">My Account</div>
          </Link>
        </div>

        <div className="bg-white border-[3px] border-brand-black shadow-retro-lg overflow-hidden">
          <div className="h-[5px] w-full" style={{
            background: `repeating-linear-gradient(90deg, ${B.orange} 0, ${B.orange} 40px, ${B.gold} 40px, ${B.gold} 50px, ${B.orange} 50px, ${B.orange} 90px, ${B.black} 90px, ${B.black} 94px)`,
          }} />

          <div className="flex border-b border-gray-200">
            {[{ key: "signin", label: "Sign In" }, { key: "register", label: "Create Account" }].map((t) => (
              <button key={t.key} onClick={() => { setTab(t.key); setError(null); }}
                className="flex-1 py-4 font-sans font-extrabold text-[11px] tracking-[1.5px] uppercase cursor-pointer border-none bg-transparent transition-colors"
                style={{ color: tab === t.key ? B.orange : B.smoke, borderBottom: tab === t.key ? `3px solid ${B.orange}` : "3px solid transparent", marginBottom: "-1px" }}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="px-8 py-8">
            {error && (
              <div className="bg-red-50 border-2 border-red-300 px-4 py-3 mb-5 flex items-start gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span className="font-sans text-[13px] text-red-600 leading-relaxed">{error}</span>
              </div>
            )}

            {tab === "signin" && (
              <div className="flex flex-col gap-5">
                <div>
                  <Label>Email Address</Label>
                  <input type="email" value={signIn.email} placeholder="you@example.com"
                    autoComplete="email" disabled={loading} className={inputCls}
                    onChange={(e) => setSignIn((s) => ({ ...s, email: e.target.value }))}
                    onKeyDown={(e) => handleKey(e, handleSignIn)} />
                </div>
                <div>
                  <Label>Password</Label>
                  <div className="relative">
                    <input type={showSignInPass ? "text" : "password"} value={signIn.password}
                      placeholder="••••••••" autoComplete="current-password" disabled={loading}
                      className={`${inputCls} pr-12`}
                      onChange={(e) => setSignIn((s) => ({ ...s, password: e.target.value }))}
                      onKeyDown={(e) => handleKey(e, handleSignIn)} />
                    <button type="button" tabIndex={-1} onClick={() => setShowSignInPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-brand-smoke hover:text-brand-orange transition-colors p-1">
                      <EyeIcon visible={showSignInPass} />
                    </button>
                  </div>
                </div>
                <button onClick={handleSignIn} disabled={loading}
                  className="w-full bg-brand-orange text-brand-cream border-[3px] border-brand-black py-4 font-sans font-black text-[13px] tracking-[2px] uppercase cursor-pointer shadow-retro-md hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-retro-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none transition-all flex items-center justify-center gap-3">
                  {loading ? <><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>Signing In...</> : "Sign In →"}
                </button>
                <p className="font-sans text-center text-[12px] text-brand-smoke">
                  Don&apos;t have an account?{" "}
                  <button onClick={() => { setTab("register"); setError(null); }}
                    className="font-extrabold text-brand-orange cursor-pointer bg-transparent border-none p-0 hover:underline">Create one</button>
                </p>
              </div>
            )}

            {tab === "register" && (
              <div className="flex flex-col gap-5">
                <div>
                  <Label>Full Name *</Label>
                  <input type="text" value={reg.name} placeholder="Your full name"
                    autoComplete="name" disabled={loading} className={inputCls}
                    onChange={(e) => setReg((r) => ({ ...r, name: e.target.value }))} />
                </div>
                <div>
                  <Label>Email Address *</Label>
                  <input type="email" value={reg.email} placeholder="you@example.com"
                    autoComplete="email" disabled={loading} className={inputCls}
                    onChange={(e) => setReg((r) => ({ ...r, email: e.target.value }))} />
                </div>
                <div>
                  <Label>Phone <span className="font-normal normal-case tracking-normal">(optional)</span></Label>
                  <input type="tel" value={reg.phone} placeholder="(256) 555-0100"
                    autoComplete="tel" disabled={loading} className={inputCls}
                    onChange={(e) => setReg((r) => ({ ...r, phone: e.target.value }))} />
                </div>
                <div>
                  <Label>Password * <span className="font-normal normal-case tracking-normal">(min 8 characters)</span></Label>
                  <div className="relative">
                    <input type={showRegPass ? "text" : "password"} value={reg.password}
                      placeholder="••••••••" autoComplete="new-password" disabled={loading}
                      className={`${inputCls} pr-12`}
                      onChange={(e) => setReg((r) => ({ ...r, password: e.target.value }))} />
                    <button type="button" tabIndex={-1} onClick={() => setShowRegPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-brand-smoke hover:text-brand-orange transition-colors p-1">
                      <EyeIcon visible={showRegPass} />
                    </button>
                  </div>
                </div>
                <div>
                  <Label>Confirm Password *</Label>
                  <input type="password" value={reg.confirm} placeholder="••••••••"
                    autoComplete="new-password" disabled={loading} className={inputCls}
                    onChange={(e) => setReg((r) => ({ ...r, confirm: e.target.value }))}
                    onKeyDown={(e) => handleKey(e, handleRegister)} />
                </div>
                <button onClick={handleRegister} disabled={loading}
                  className="w-full bg-brand-orange text-brand-cream border-[3px] border-brand-black py-4 font-sans font-black text-[13px] tracking-[2px] uppercase cursor-pointer shadow-retro-md hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-retro-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none transition-all flex items-center justify-center gap-3">
                  {loading ? <><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>Creating Account...</> : "Create Account →"}
                </button>
                <p className="font-sans text-[11px] text-brand-smoke/60 text-center leading-relaxed">
                  Already placed an order as a guest? Use the same email and your order history will appear automatically.
                </p>
                <p className="font-sans text-center text-[12px] text-brand-smoke">
                  Already have an account?{" "}
                  <button onClick={() => { setTab("signin"); setError(null); }}
                    className="font-extrabold text-brand-orange cursor-pointer bg-transparent border-none p-0 hover:underline">Sign in</button>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/shop" className="font-sans text-[12px] text-brand-smoke/60 hover:text-brand-smoke transition-colors no-underline">
            Continue as guest — browse the shop →
          </Link>
        </div>
      </div>
    </div>
  );
}