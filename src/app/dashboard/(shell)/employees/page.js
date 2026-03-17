// src/app/dashboard/(shell)/employees/page.js
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useDashboardSession }  from "@/app/dashboard/SessionContext";
import { canDo, ROLE_META }     from "@/lib/permissions";
import StatusBadge              from "@/app/components/dashboard/StatusBadge/StatusBadge";
import EmployeeModal            from "@/app/components/dashboard/EmployeeModal/EmployeeModal";
import { fetchEmployees, createEmployee, updateEmployee } from "@/lib/dashboardApi";

function remapEmployee(row) {
  return {
    id       : row.id,
    name     : row.name,
    email    : row.email,
    phone    : row.phone,
    role     : row.role,
    status   : row.status,
    hireDate : row.hire_date,
    createdAt: row.created_at,
  };
}

export default function EmployeesPage() {
  const { user } = useDashboardSession();

  if (!canDo(user.role, "employees", "read")) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-5">
        <div className="text-[60px] mb-5">🔒</div>
        <h2 className="font-serif font-black text-brand-black text-[26px] tracking-[-1px] mb-2">Access Denied</h2>
        <p className="font-sans text-brand-smoke text-[14px] max-w-[320px] leading-relaxed">
          Employee management is restricted to Admin accounts. Contact Cecelia if you need access.
        </p>
      </div>
    );
  }

  const [employees,    setEmployees   ] = useState([]);
  const [loading,      setLoading     ] = useState(true);
  const [apiError,     setApiError    ] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [modalMode,    setModalMode   ] = useState(null);
  const [editEmployee, setEditEmployee] = useState(null);

  const canCreate = canDo(user.role, "employees", "create");
  const canEdit   = canDo(user.role, "employees", "update");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setApiError(null);
      const res = await fetchEmployees();
      setEmployees(res.data.map(remapEmployee));
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (formData) => {
    try {
      if (modalMode === "add") {
        const res = await createEmployee(formData);
        setEmployees((prev) => [...prev, remapEmployee(res.data)]);
      } else if (modalMode === "edit" && editEmployee) {
        const res = await updateEmployee(editEmployee.id, formData);
        setEmployees((prev) =>
          prev.map((e) => (e.id === editEmployee.id ? remapEmployee(res.data) : e))
        );
      }
      setModalMode(null);
      setEditEmployee(null);
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    }
  };

  const handleToggleStatus = async (emp) => {
    const newStatus = emp.status === "active" ? "inactive" : "active";
    setEmployees((prev) =>
      prev.map((e) => (e.id === emp.id ? { ...e, status: newStatus } : e))
    );
    try {
      await updateEmployee(emp.id, { status: newStatus });
    } catch (err) {
      load();
      alert(`Status update failed: ${err.message}`);
    }
  };

  const filtered = useMemo(() =>
    filterStatus === "all" ? employees : employees.filter((e) => e.status === filterStatus),
    [employees, filterStatus]
  );

  const activeCount   = employees.filter((e) => e.status === "active").length;
  const inactiveCount = employees.filter((e) => e.status === "inactive").length;

  if (loading) return <PageSpinner label="Loading Employees" />;
  if (apiError) return <PageError message={apiError} onRetry={load} />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-brand-black text-[26px] sm:text-[30px] tracking-[-1px] leading-none mb-1">Employees</h1>
          <p className="font-sans text-brand-smoke text-[13px]">
            {activeCount} active · {inactiveCount} inactive
          </p>
        </div>
        {canCreate && (
          <button onClick={() => setModalMode("add")}
            className="font-sans font-extrabold text-[12px] tracking-[1.5px] uppercase bg-brand-orange text-brand-cream border-2 border-brand-black px-6 py-3 cursor-pointer shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all self-start sm:self-auto flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Employee
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex gap-2">
          {[
            { key: "all",      label: `All (${employees.length})`   },
            { key: "active",   label: `Active (${activeCount})`      },
            { key: "inactive", label: `Inactive (${inactiveCount})`  },
          ].map((f) => (
            <button key={f.key} onClick={() => setFilterStatus(f.key)}
              className={`font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-4 py-2 border-2 cursor-pointer transition-colors ${
                filterStatus === f.key
                  ? "bg-brand-black text-brand-cream border-brand-black"
                  : "bg-white text-brand-smoke border-gray-200 hover:border-brand-black hover:text-brand-black"
              }`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {Object.entries(ROLE_META).map(([role, meta]) => (
            <div key={role} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: meta.color }} />
              <span className="font-sans font-extrabold text-[10px] tracking-[1px] uppercase text-brand-smoke">{meta.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {["Employee","Role","Contact","Hire Date","Status","Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-sans font-extrabold text-[10px] tracking-[1.5px] uppercase text-brand-smoke whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, i) => {
                const roleMeta = ROLE_META[emp.role] ?? ROLE_META.employee;
                return (
                  <tr key={emp.id}
                    className={`border-b border-gray-100 last:border-b-0 ${emp.status === "inactive" ? "opacity-50" : ""} ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 font-serif font-black text-[15px]"
                          style={{ background: `${roleMeta.color}15`, borderColor: `${roleMeta.color}40`, color: roleMeta.color }}>
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-sans font-extrabold text-[13px] text-brand-black">{emp.name}</div>
                          {emp.id === user.id && (
                            <span className="font-sans text-[9px] tracking-[1px] uppercase text-brand-orange font-extrabold">You</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-sans font-extrabold text-[10px] tracking-[1.5px] uppercase px-2.5 py-1 border"
                        style={{ color: roleMeta.color, borderColor: `${roleMeta.color}40`, background: `${roleMeta.color}12` }}>
                        {roleMeta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-sans text-[12px] text-brand-smoke">{emp.email}</div>
                      {emp.phone && <div className="font-sans text-[11px] text-brand-smoke/70">{emp.phone}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-sans text-[12px] text-brand-smoke">
                        {new Date(emp.hireDate + "T00:00:00").toLocaleDateString("en-US", { dateStyle: "medium" })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={emp.status} color={emp.status === "active" ? "#22C55E" : "#9CA3AF"} dot={emp.status === "active"} />
                    </td>
                    <td className="px-4 py-3">
                      {canEdit ? (
                        <div className="flex gap-2">
                          <button onClick={() => { setEditEmployee(emp); setModalMode("edit"); }}
                            className="font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-3 py-1.5 border-2 border-brand-black text-brand-black bg-transparent cursor-pointer hover:bg-brand-black hover:text-brand-cream transition-colors">
                            Edit
                          </button>
                          {emp.id !== Number(user.id) && (
                            <button onClick={() => handleToggleStatus(emp)}
                              className={`font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-3 py-1.5 border-2 bg-transparent cursor-pointer transition-colors ${
                                emp.status === "active"
                                  ? "border-gray-300 text-brand-smoke hover:border-red-400 hover:text-red-500"
                                  : "border-green-300 text-green-600 hover:bg-green-500 hover:text-white hover:border-green-500"
                              }`}>
                              {emp.status === "active" ? "Deactivate" : "Reactivate"}
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="font-sans text-[11px] text-brand-smoke/50 italic">View only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalMode && (
        <EmployeeModal mode={modalMode} employee={editEmployee}
          onSave={handleSave} onClose={() => { setModalMode(null); setEditEmployee(null); }} />
      )}
    </div>
  );
}


// ================================================================
//  SHARED UI — PageSpinner and PageError
//  Used by all four dashboard pages.
//  Add these to: src/app/components/dashboard/PageStates/PageStates.js
//  Then import in each page:
//    import { PageSpinner, PageError } from "@/app/components/dashboard/PageStates/PageStates";
// ================================================================

// FILE: src/app/components/dashboard/PageStates/PageStates.js

import { B } from "@/lib/brand";

export function PageSpinner({ label = "Loading" }) {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24"
          fill="none" stroke={B.orange} strokeWidth="2.5">
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
        <span className="font-sans font-extrabold text-[10px] tracking-[3px] uppercase text-brand-smoke animate-pulse">
          {label}
        </span>
      </div>
    </div>
  );
}

export function PageError({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center px-5">
      <div className="text-[56px] mb-4">⚠️</div>
      <h2 className="font-serif font-black text-brand-black text-[24px] mb-2">Could not load data</h2>
      <p className="font-sans text-brand-smoke text-[13px] max-w-[360px] leading-relaxed mb-4">{message}</p>
      <p className="font-sans text-brand-smoke/60 text-[12px] mb-6">
        Make sure the database is running:
        <code className="ml-1 bg-gray-100 px-2 py-1 border border-gray-200 text-[11px]">docker compose up -d</code>
      </p>
      <button onClick={onRetry}
        className="font-sans font-extrabold text-[12px] tracking-[1.5px] uppercase bg-brand-orange text-brand-cream border-2 border-brand-black px-6 py-3 cursor-pointer shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
        Retry
      </button>
    </div>
  );
}