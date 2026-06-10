"use client";

import { useState, useEffect } from "react";
import { EMPLOYEE_ROLES }      from "@/lib/employeeData";
import { ROLE_META }           from "@/lib/permissions";
import { C }                   from "@/lib/brand";

const EMPTY_FORM = {
  name    : "",
  email   : "",
  phone   : "",
  role    : "employee",
  status  : "active",
  hireDate: new Date().toISOString().split("T")[0],
};

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="font-sans text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}

const inputCls = (err) =>
  `w-full bg-white border-2 ${err ? "border-red-400" : "border-gray-200"} px-3 py-2.5 font-sans text-[13px] text-brand-black focus:outline-none focus:border-brand-orange transition-colors`;

export default function EmployeeModal({ mode, employee, onSave, onClose }) {
  const [form,   setForm  ] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === "edit" && employee) {
      setForm({
        name    : employee.name     || "",
        email   : employee.email    || "",
        phone   : employee.phone    || "",
        role    : employee.role     || "employee",
        status  : employee.status   || "active",
        hireDate: employee.hireDate || new Date().toISOString().split("T")[0],
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [mode, employee]);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSave(form);
  };

  const roleMeta = ROLE_META[form.role];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(17,17,17,0.65)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-[520px] flex flex-col border-[3px] border-brand-black shadow-retro-lg overflow-hidden">

        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between border-b-[3px] border-brand-black flex-shrink-0"
          style={{ background: C.darkGrey }}
        >
          <div>
            <div className="font-sans font-extrabold text-[9px] tracking-[3px] uppercase text-brand-cream/50 mb-1">
              Team
            </div>
            <h2 className="font-serif font-black text-brand-cream text-[20px] tracking-[-0.5px] leading-none">
              {mode === "add" ? "Add Employee" : `Edit — ${employee?.name}`}
            </h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-brand-cream/10 border border-brand-cream/20 text-brand-cream cursor-pointer hover:bg-brand-cream/20">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div className="sm:col-span-2">
              <Field label="Full Name *" error={errors.name}>
                <input className={inputCls(errors.name)} value={form.name}
                  onChange={(e) => set("name", e.target.value)} placeholder="e.g. Jane Holloway" />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field label="Email Address *" error={errors.email}>
                <input type="email" className={inputCls(errors.email)} value={form.email}
                  onChange={(e) => set("email", e.target.value)} placeholder="jane@bitybird.com" />
              </Field>
            </div>

            <Field label="Phone">
              <input className={inputCls()} value={form.phone}
                onChange={(e) => set("phone", e.target.value)} placeholder="(256) 555-0100" />
            </Field>

            <Field label="Hire Date">
              <input type="date" className={inputCls()} value={form.hireDate}
                onChange={(e) => set("hireDate", e.target.value)} />
            </Field>

            {/* Role selector */}
            <div className="sm:col-span-2">
              <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-2">
                Role
              </div>
              <div className="flex gap-3 flex-wrap">
                {EMPLOYEE_ROLES.map((role) => {
                  const meta = ROLE_META[role];
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => set("role", role)}
                      className="flex-1 flex flex-col items-center gap-1.5 py-3 border-2 cursor-pointer transition-all"
                      style={{
                        borderColor : form.role === role ? meta.color : "#E5E7EB",
                        background  : form.role === role ? `${meta.color}12` : "white",
                      }}
                    >
                      <span
                        className="font-sans font-extrabold text-[11px] tracking-[1.5px] uppercase"
                        style={{ color: form.role === role ? meta.color : "#8C8288" }}
                      >
                        {meta.label}
                      </span>
                      <span className="font-sans text-[10px] text-brand-smoke/60 text-center leading-tight px-2">
                        {role === "admin"    && "Full access"}
                        {role === "manager" && "Manage inventory, orders, delivery"}
                        {role === "employee" && "View + basic updates"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status toggle — only relevant in edit mode */}
            {mode === "edit" && (
              <div className="sm:col-span-2">
                <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-2">
                  Account Status
                </div>
                <button
                  type="button"
                  onClick={() => set("status", form.status === "active" ? "inactive" : "active")}
                  className={`flex items-center gap-3 px-4 py-3 border-2 cursor-pointer transition-colors w-full sm:w-auto ${
                    form.status === "active"
                      ? "border-green-400 bg-green-50 text-green-700"
                      : "border-red-300 bg-red-50 text-red-500"
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full flex-shrink-0 ${form.status === "active" ? "bg-green-500" : "bg-red-400"}`} />
                  <span className="font-sans font-extrabold text-[12px] tracking-[1px] uppercase">
                    {form.status === "active" ? "Active — Can log in to dashboard" : "Inactive — Access revoked"}
                  </span>
                </button>
                <p className="font-sans text-[11px] text-brand-smoke/60 mt-2">
                  Deactivating an employee revokes their dashboard access but preserves all order and delivery history.
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3 flex-shrink-0">
          <button onClick={onClose}
            className="font-sans font-extrabold text-[11px] tracking-[1px] uppercase px-6 py-3 border-2 border-gray-300 text-brand-smoke bg-white cursor-pointer hover:border-brand-black hover:text-brand-black transition-colors">
            Cancel
          </button>
          <button onClick={handleSave}
            className="font-sans font-extrabold text-[12px] tracking-[1px] uppercase px-8 py-3 bg-brand-orange text-brand-cream border-2 border-brand-black cursor-pointer shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
            {mode === "add" ? "Add Employee" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}