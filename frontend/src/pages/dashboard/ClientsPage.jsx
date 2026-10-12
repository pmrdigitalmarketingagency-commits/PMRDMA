import React, { useEffect, useState } from "react";
import { api, formatApiError } from "../../lib/api";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

const EMPTY = { name: "", company: "", email: "", phone: "", industry: "", website: "", status: "active", services: [], notes: "" };

export default function ClientsPage() {
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [loading, setLoading] = useState(false);

    const load = () => api.get("/clients").then((r) => setItems(r.data)).catch(() => {});
    useEffect(() => { document.title = "Clients — PMR"; load(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/clients", form);
            toast.success("Client created");
            setOpen(false); setForm(EMPTY); load();
        } catch (err) { toast.error(formatApiError(err)); }
        finally { setLoading(false); }
    };

    return (
        <div data-testid="clients-page" className="space-y-6">
            <div className="flex justify-between items-start gap-4">
                <div>
                    <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#53D8FB]">/ Clients</div>
                    <h1 className="mt-2 font-display text-3xl font-black">Client directory</h1>
                </div>
                <button onClick={() => setOpen(true)} data-testid="new-client-btn"
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B6B] to-[#7957FF]">
                    <Plus className="w-4 h-4" /> New client
                </button>
            </div>

            <div className="rounded-2xl bg-[#13192E] border border-white/5 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-white/5 text-left text-xs font-mono uppercase tracking-widest text-white/50">
                            <th className="px-5 py-3">Client</th>
                            <th className="px-5 py-3">Email</th>
                            <th className="px-5 py-3">Industry</th>
                            <th className="px-5 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr><td colSpan={4} className="px-5 py-10 text-center text-white/40">No clients yet. Convert a lead or add one manually.</td></tr>
                        ) : items.map((c) => (
                            <tr key={c.id} className="border-t border-white/5 hover:bg-white/5" data-testid={`client-row-${c.id}`}>
                                <td className="px-5 py-3">
                                    <div className="font-semibold">{c.name}</div>
                                    <div className="text-xs text-white/50">{c.company}</div>
                                </td>
                                <td className="px-5 py-3 text-white/70">{c.email}</td>
                                <td className="px-5 py-3 text-white/70">{c.industry || "—"}</td>
                                <td className="px-5 py-3">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest border ${c.status === "active" ? "border-[#C6F36B]/30 text-[#C6F36B]" : "border-white/10 text-white/50"}`}>{c.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {open && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5" onClick={() => setOpen(false)}>
                    <form onSubmit={submit} onClick={(e) => e.stopPropagation()} data-testid="client-modal"
                        className="w-full max-w-lg bg-[#0E1428] rounded-2xl border border-white/10 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div className="font-display font-bold text-xl">New client</div>
                            <button type="button" onClick={() => setOpen(false)} className="text-white/60"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { k: "name", l: "Name *", req: true },
                                { k: "company", l: "Company *", req: true },
                                { k: "email", l: "Email *", req: true, type: "email" },
                                { k: "phone", l: "Phone" },
                                { k: "industry", l: "Industry" },
                                { k: "website", l: "Website" },
                            ].map((f) => (
                                <label key={f.k} className="block">
                                    <div className="text-xs font-mono uppercase tracking-widest text-white/60">{f.l}</div>
                                    <input required={f.req} type={f.type || "text"} value={form[f.k] || ""}
                                        onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                                        data-testid={`client-field-${f.k}`}
                                        className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-[#7957FF]" />
                                </label>
                            ))}
                        </div>
                        <button type="submit" disabled={loading} data-testid="client-submit"
                            className="mt-6 w-full rounded-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B6B] to-[#7957FF] disabled:opacity-50">
                            {loading ? "Saving…" : "Create client"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
