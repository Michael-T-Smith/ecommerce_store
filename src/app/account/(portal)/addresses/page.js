
"use client";

import { useState, useEffect, useCallback } from "react";
import { C }                                 from "@/lib/brand";
import AddressModal                          from "@/app/components/account/AddressModal/AddressModal";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading,   setLoading  ] = useState(true);
  const [error,     setError    ] = useState(null);
  const [modalMode, setModalMode] = useState(null);   // null | "add" | "edit"
  const [editAddr,  setEditAddr ] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res  = await fetch("/api/customers/addresses");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setAddresses(json.data.map(remapAddress));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function remapAddress(row) {
    return {
      id         : row.id,
      label      : row.label,
      addressLine: row.address_line,
      city       : row.city,
      state      : row.state,
      zip        : row.zip,
      zone       : row.zone,
      isDefault  : row.is_default,
    };
  }

  const handleSave = async (formData) => {
    try {
      const url    = modalMode === "add" ? "/api/customers/addresses" : `/api/customers/addresses/${editAddr.id}`;
      const method = modalMode === "add" ? "POST" : "PATCH";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      await load();
      setModalMode(null);
      setEditAddr(null);
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this address?")) return;
    try {
      await fetch(`/api/customers/addresses/${id}`, { method: "DELETE" });
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.blush} strokeWidth="2.5"><path d="M21 12a9 9 0 11-6.219-8.56" /></svg></div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-brand-black text-[26px] tracking-[-1px] leading-none mb-1">Saved Addresses</h1>
          <p className="font-sans text-brand-smoke text-[13px]">{addresses.length} saved address{addresses.length !== 1 ? "es" : ""}</p>
        </div>
        <button onClick={() => setModalMode("add")}
          className="font-sans font-extrabold text-[11px] tracking-[1.5px] uppercase bg-brand-orange text-brand-cream border-2 border-brand-black px-5 py-2.5 cursor-pointer shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2 flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white border-[3px] border-dashed border-gray-200 px-8 py-16 text-center">
          <div className="text-[48px] mb-4">📍</div>
          <h2 className="font-serif font-black text-brand-black text-[20px] mb-2">No saved addresses</h2>
          <p className="font-sans text-brand-smoke text-[13px] leading-relaxed max-w-[280px] mx-auto">
            Save delivery addresses to speed up checkout.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id}
              className="bg-white border-[2px] border-gray-200 p-5 flex flex-col gap-3"
              style={{ borderLeft: addr.isDefault ? `4px solid ${C.blush}` : undefined }}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-extrabold text-[13px] text-brand-black">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="font-sans font-extrabold text-[9px] tracking-[1px] uppercase px-2 py-0.5 border"
                        style={{ color: C.blush, borderColor: `${C.blush}50`, background: `${C.blush}10` }}>
                        Default
                      </span>
                    )}
                  </div>
                  <div className="font-sans text-[13px] text-brand-smoke mt-1 leading-relaxed">
                    {addr.addressLine}<br />{addr.city}, {addr.state} {addr.zip}
                  </div>
                  {addr.zone && (
                    <div className="font-sans text-[11px] text-brand-smoke/60 mt-1 capitalize">
                      Zone: {addr.zone}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button onClick={() => { setEditAddr(addr); setModalMode("edit"); }}
                  className="font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-3 py-1.5 border-2 border-brand-black text-brand-black bg-transparent cursor-pointer hover:bg-brand-black hover:text-brand-cream transition-colors">
                  Edit
                </button>
                <button onClick={() => handleDelete(addr.id)}
                  className="font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-3 py-1.5 border-2 border-gray-300 text-brand-smoke bg-transparent cursor-pointer hover:border-red-400 hover:text-red-500 transition-colors">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalMode && (
        <AddressModal mode={modalMode} address={editAddr}
          onSave={handleSave} onClose={() => { setModalMode(null); setEditAddr(null); }} />
      )}
    </div>
  );
}
