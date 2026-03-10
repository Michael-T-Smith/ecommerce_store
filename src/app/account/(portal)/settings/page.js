
"use client";

import { useState } from "react";
import { useCustomer } from "@/app/account/CustomerContext";
import { B }           from "@/lib/brand";

export default function SettingsPage() {
  const { customer, refreshCustomer } = useCustomer();

  const [profile,  setProfile ] = useState({ name: customer?.name ?? "", email: customer?.email ?? "", phone: customer?.phone ?? "" });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [saving,   setSaving  ] = useState(null);   // null | "profile" | "password"
  const [msg,      setMsg     ] = useState({ type: null, text: null });

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: null, text: null }), 4000);
  };

  const handleSaveProfile = async () => {
    setSaving("profile");
    try {
      const res  = await fetch("/api/customers/me", {
        method : "PATCH",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({ name: profile.name, email: profile.email, phone: profile.phone }),
      });
      const json = await res.json();
      if (!res.ok) { showMsg("error", json.error); return; }
      await refreshCustomer();
      showMsg("success", "Profile updated successfully.");
    } catch {
      showMsg("error", "Save failed. Please try again.");
    } finally {
      setSaving(null);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.newPass !== passwords.confirm) {
      showMsg("error", "New passwords do not match.");
      return;
    }
    if (passwords.newPass.length < 8) {
      showMsg("error", "New password must be at least 8 characters.");
      return;
    }
    setSaving("password");
    try {
      const res  = await fetch("/api/customers/me", {
        method : "PATCH",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPass }),
      });
      const json = await res.json();
      if (!res.ok) { showMsg("error", json.error); return; }
      setPasswords({ current: "", newPass: "", confirm: "" });
      showMsg("success", "Password changed successfully.");
    } catch {
      showMsg("error", "Save failed. Please try again.");
    } finally {
      setSaving(null);
    }
  };

  const inputCls = "w-full border-2 border-gray-200 px-4 py-3 font-sans text-[13px] text-brand-black focus:outline-none focus:border-brand-orange transition-colors";
  const Label = ({ children }) => (
    <label className="block font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-1.5">{children}</label>
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif font-black text-brand-black text-[26px] tracking-[-1px] leading-none mb-1">Account Settings</h1>
        <p className="font-sans text-brand-smoke text-[13px]">Update your name, email, and password</p>
      </div>

      {/* Toast */}
      {msg.type && (
        <div className={`px-4 py-3 border-2 flex items-center gap-3 ${
          msg.type === "success"
            ? "bg-green-50 border-green-300 text-green-700"
            : "bg-red-50 border-red-300 text-red-600"
        }`}>
          <span className="font-sans text-[13px]">{msg.text}</span>
        </div>
      )}

      {/* Profile */}
      <div className="bg-white border-[2px] border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <span className="font-sans font-extrabold text-[11px] tracking-[2px] uppercase text-brand-smoke">Profile</span>
        </div>
        <div className="px-6 py-6 flex flex-col gap-5">
          <div>
            <Label>Full Name</Label>
            <input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              className={inputCls} placeholder="Your full name" />
          </div>
          <div>
            <Label>Email Address</Label>
            <input type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              className={inputCls} placeholder="you@example.com" />
          </div>
          <div>
            <Label>Phone <span className="font-normal normal-case tracking-normal">(optional)</span></Label>
            <input type="tel" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              className={inputCls} placeholder="(256) 555-0100" />
          </div>
          <button onClick={handleSaveProfile} disabled={saving === "profile"}
            className="self-start font-sans font-extrabold text-[11px] tracking-[1.5px] uppercase bg-brand-orange text-brand-cream border-2 border-brand-black px-6 py-3 cursor-pointer shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none transition-all">
            {saving === "profile" ? "Saving…" : "Save Profile"}
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="bg-white border-[2px] border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <span className="font-sans font-extrabold text-[11px] tracking-[2px] uppercase text-brand-smoke">Change Password</span>
        </div>
        <div className="px-6 py-6 flex flex-col gap-5">
          <div>
            <Label>Current Password</Label>
            <input type="password" value={passwords.current} onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
              className={inputCls} placeholder="••••••••" autoComplete="current-password" />
          </div>
          <div>
            <Label>New Password <span className="font-normal normal-case tracking-normal">(min 8 characters)</span></Label>
            <input type="password" value={passwords.newPass} onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))}
              className={inputCls} placeholder="••••••••" autoComplete="new-password" />
          </div>
          <div>
            <Label>Confirm New Password</Label>
            <input type="password" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
              className={inputCls} placeholder="••••••••" autoComplete="new-password" />
          </div>
          <button onClick={handleChangePassword} disabled={saving === "password" || !passwords.current || !passwords.newPass}
            className="self-start font-sans font-extrabold text-[11px] tracking-[1.5px] uppercase bg-brand-black text-brand-cream border-2 border-brand-black px-6 py-3 cursor-pointer shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none transition-all">
            {saving === "password" ? "Saving…" : "Change Password"}
          </button>
        </div>
      </div>
    </div>
  );
}