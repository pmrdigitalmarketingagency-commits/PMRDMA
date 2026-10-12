import React, { useEffect, useState } from "react";
import { api, formatApiError } from "../../lib/api";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

const STATUS_COLORS = {
    draft: "border-white/10 text-white/50",
    sent: "border-[#53D8FB]/30 text-[#53D8FB]",
    partially_paid: "border-[#FFB347]/30 text-[#FFB347]",
    paid: "border-[#C6F36B]/30 text-[#C6F36B]",
    overdue: "border-[#FF6B6B]/30 text-[#FF6B6B]",
    cancelled: "border-white/10 text-white/40",
};

export default function InvoicesPage() {
    const [items, setItems] = useState([]);
    const [clients, setClients] = useState([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ client_id: "", issue_date: new Date().toISOString().slice(0,10), due_date: "", notes: "", items: [{ description: "", quantity: 1, rate: 0, tax_rate: 18 }], discount: 0 });

    const load = () => api.get("/invoices").then((r) => setItems(r.data));
    useEffect(() => {
        document.title = "Invoices — PMR";
        load();
        api.get("/clients").then((r) => setClients(r.data));
    }, []);

    const addLine = () => setForm({ ...form, items: [...form.items, { description: "", quantity: 1, rate: 0, tax_rate: 18 }] });
    const updateLine = (idx, k, v) => {
        const next = [...form.items];
        next[idx] = { ...next[idx], [k]: v };
        setForm({ ...form, items: next });
    };
    const removeLine = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });

    const previewTotal = form.items.reduce((sum, it) => {
        const amt = Number(it.quantity || 0) * Number(it.rate || 0);
        return sum + amt + (amt * Number(it.tax_rate || 0) / 100);
    }, 0) - Number(form.discount || 0);

    const submit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/invoices", {
                ...form,
                discount: Number(form.discount || 0),
                items: form.items.map((it) => ({
                    description: it.description,
                    quantity: Number(it.quantity),
                    rate: Number(it.rate),
                    tax_rate: Number(it.tax_rate),
                })),
            });
            toast.success("Invoice created");
            setOpen(false); load();
            setForm({ client_id: "", issue_date: new Date().toISOString().slice(0,10), due_date: "", notes: "", items: [{ description: "", quantity: 1, rate: 0, tax_rate: 18 }], discount: 0 });
        } catch (err) { toast.error(formatApiError(err)); }
    };

    return (
        <div data-testid="invoices-page" className="space-y-6">
            <div className="flex justify-between items-start gap-4">
                <div>
                    <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#53D8FB]">/ Finance</div>
                    <h1 className="mt-2 font-display text-3xl font-black">Invoices</h1>
                </div>
                <button onClick={() => setOpen(true)} data-testid="new-invoice-btn"
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B6B] to-[#7957FF]">
                    <Plus className="w-4 h-4" /> New invoice
                </button>
            </div>

            <div className="rounded-2xl bg-[#13192E] border border-white/5 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-white/5 text-left text-xs font-mono uppercase tracking-widest text-white/50">
                            <th className="px-5 py-3">Number</th>
                            <th className="px-5 py-3">Client</th>
                            <th className="px-5 py-3">Issued</th>
                            <th className="px-5 py-3">Due</th>
                            <th className="px-5 py-3">Total</th>
                            <th className="px-5 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr><td colSpan={6} className="px-5 py-10 text-center text-white/40">No invoices yet.</td></tr>
                        ) : items.map((inv) => {
                            const cl = clients.find((c) => c.id === inv.client_id);
                            return (
                                <tr key={inv.id} className="border-t border-white/5" data-testid={`invoice-row-${inv.id}`}>
                                    <td className="px-5 py-3 font-mono text-xs">{inv.invoice_number}</td>
                                    <td className="px-5 py-3">{cl?.name || "—"}</td>
                                    <td className="px-5 py-3 text-white/60">{inv.issue_date}</td>
                                    <td className="px-5 py-3 text-white/60">{inv.due_date}</td>
                                    <td className="px-5 py-3 font-semibold">₹{inv.total?.toLocaleString("en-IN")}</td>
                                    <td className="px-5 py-3">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-mono uppercase border ${STATUS_COLORS[inv.status]}`}>{inv.status.replace("_", " ")}</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {open && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5" onClick={() => setOpen(false)}>
                    <form onSubmit={submit} onClick={(e) => e.stopPropagation()} data-testid="invoice-modal"
                        className="w-full max-w-3xl bg-[#0E1428] rounded-2xl border border-white/10 p-6 max-h-[92vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <div className="font-display font-bold text-xl">New invoice</div>
                            <button type="button" onClick={() => setOpen(false)}><X className="w-5 h-5 text-white/60" /></button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <label className="block col-span-3">
                                <div className="text-xs font-mono uppercase tracking-widest text-white/60">Client *</div>
                                <select required value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} data-testid="invoice-client"
                                    className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-[#7957FF]">
                                    <option value="">Select client…</option>
                                    {clients.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.company}</option>)}
                                </select>
                            </label>
                            <label className="block">
                                <div className="text-xs font-mono uppercase tracking-widest text-white/60">Issue date</div>
                                <input type="date" required value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                                    className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-[#7957FF]" />
                            </label>
                            <label className="block">
                                <div className="text-xs font-mono uppercase tracking-widest text-white/60">Due date</div>
                                <input type="date" required value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                                    className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-[#7957FF]" />
                            </label>
                            <label className="block">
                                <div className="text-xs font-mono uppercase tracking-widest text-white/60">Discount (₹)</div>
                                <input type="number" min="0" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })}
                                    className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-[#7957FF]" />
                            </label>
                        </div>

                        <div className="mt-5">
                            <div className="text-xs font-mono uppercase tracking-widest text-white/60 mb-3">Line items</div>
                            <div className="space-y-2">
                                {form.items.map((it, i) => (
                                    <div key={i} className="grid grid-cols-12 gap-2 items-center" data-testid={`line-${i}`}>
                                        <input placeholder="Description" required value={it.description} onChange={(e) => updateLine(i, "description", e.target.value)}
                                            className="col-span-5 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs focus:outline-none focus:border-[#7957FF]" />
                                        <input type="number" min="0" step="0.01" placeholder="Qty" value={it.quantity} onChange={(e) => updateLine(i, "quantity", e.target.value)}
                                            className="col-span-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs focus:outline-none focus:border-[#7957FF]" />
                                        <input type="number" min="0" step="0.01" placeholder="Rate" value={it.rate} onChange={(e) => updateLine(i, "rate", e.target.value)}
                                            className="col-span-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs focus:outline-none focus:border-[#7957FF]" />
                                        <input type="number" min="0" placeholder="GST %" value={it.tax_rate} onChange={(e) => updateLine(i, "tax_rate", e.target.value)}
                                            className="col-span-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs focus:outline-none focus:border-[#7957FF]" />
                                        <button type="button" onClick={() => removeLine(i)} className="col-span-1 text-white/40 hover:text-[#FF6B6B]"><X className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={addLine} className="mt-3 text-xs text-[#53D8FB] font-semibold" data-testid="add-line">+ Add line</button>
                        </div>

                        <div className="mt-5 rounded-xl bg-white/5 p-4 flex items-center justify-between">
                            <span className="text-sm text-white/60">Preview total (incl. GST)</span>
                            <span className="font-display font-bold text-xl">₹{previewTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                        </div>

                        <button type="submit" data-testid="invoice-submit"
                            className="mt-5 w-full rounded-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B6B] to-[#7957FF]">
                            Create invoice
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
