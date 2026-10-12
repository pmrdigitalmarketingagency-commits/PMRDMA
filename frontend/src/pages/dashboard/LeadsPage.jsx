import React, { useEffect, useState, useMemo } from "react";
import { api, formatApiError } from "../../lib/api";
import { toast } from "sonner";
import { Search, Plus, X, ArrowRight } from "lucide-react";

const STAGES = [
    { key: "new", label: "New", color: "#53D8FB" },
    { key: "contacted", label: "Contacted", color: "#7957FF" },
    { key: "qualified", label: "Qualified", color: "#C6F36B" },
    { key: "proposal_sent", label: "Proposal Sent", color: "#FFB347" },
    { key: "negotiation", label: "Negotiation", color: "#FF6B6B" },
    { key: "won", label: "Won", color: "#06d6a0" },
    { key: "lost", label: "Lost", color: "#9297AD" },
];

export default function LeadsPage() {
    const [leads, setLeads] = useState([]);
    const [q, setQ] = useState("");
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        api.get("/leads").then((r) => setLeads(r.data)).catch(() => {}).finally(() => setLoading(false));
    };
    useEffect(() => { document.title = "Leads — PMR Workspace"; load(); }, []);

    const grouped = useMemo(() => {
        const result = {};
        STAGES.forEach((s) => (result[s.key] = []));
        leads.filter((l) =>
            !q || l.name?.toLowerCase().includes(q.toLowerCase()) || l.email?.toLowerCase().includes(q.toLowerCase()) || l.company?.toLowerCase().includes(q.toLowerCase())
        ).forEach((l) => {
            if (result[l.stage]) result[l.stage].push(l);
            else result.new.push(l);
        });
        return result;
    }, [leads, q]);

    const moveStage = async (lead, stage) => {
        try {
            await api.patch(`/leads/${lead.id}`, { stage });
            toast.success(`Moved to ${STAGES.find((s) => s.key === stage)?.label}`);
            load();
        } catch (e) { toast.error(formatApiError(e)); }
    };

    const convert = async (lead) => {
        try {
            const { data } = await api.post(`/leads/${lead.id}/convert`);
            toast.success(data.already_converted ? "Already converted" : "Lead converted to client ✨");
            load();
            setSelected(null);
        } catch (e) { toast.error(formatApiError(e)); }
    };

    return (
        <div data-testid="leads-page" className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div>
                    <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#53D8FB]">/ CRM</div>
                    <h1 className="mt-2 font-display text-3xl font-black">Leads & pipeline</h1>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input value={q} onChange={(e) => setQ(e.target.value)} data-testid="lead-search"
                            placeholder="Search leads…"
                            className="w-72 rounded-xl bg-[#13192E] border border-white/10 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#7957FF]" />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto pb-4">
                <div className="grid grid-cols-7 gap-4 min-w-[1200px]">
                    {STAGES.map((stage) => (
                        <div key={stage.key} className="rounded-2xl bg-[#13192E] border border-white/5 p-4" data-testid={`stage-${stage.key}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
                                    <span className="text-xs font-mono uppercase tracking-wider text-white/70">{stage.label}</span>
                                </div>
                                <span className="text-xs text-white/40 font-mono">{grouped[stage.key].length}</span>
                            </div>
                            <div className="space-y-2 min-h-[60px]">
                                {grouped[stage.key].map((lead) => (
                                    <button key={lead.id} onClick={() => setSelected(lead)}
                                        data-testid={`lead-card-${lead.id}`}
                                        className="w-full text-left rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#7957FF]/40 p-3 transition-colors">
                                        <div className="font-semibold text-sm truncate">{lead.name}</div>
                                        <div className="text-xs text-white/50 truncate">{lead.company || lead.email}</div>
                                        {lead.budget && <div className="mt-2 text-[10px] font-mono text-[#C6F36B]">{lead.budget}</div>}
                                    </button>
                                ))}
                                {!loading && grouped[stage.key].length === 0 && <div className="text-xs text-white/30 italic">No leads</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selected && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end" onClick={() => setSelected(null)}>
                    <div className="w-full max-w-xl h-full bg-[#0E1428] border-l border-white/5 overflow-y-auto" onClick={(e) => e.stopPropagation()} data-testid="lead-drawer">
                        <div className="sticky top-0 bg-[#0E1428]/95 backdrop-blur border-b border-white/5 px-6 py-4 flex items-center justify-between">
                            <div className="font-display font-bold text-lg">Lead details</div>
                            <button onClick={() => setSelected(null)} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="rounded-xl bg-white/5 p-4 space-y-2">
                                <div className="font-display font-bold text-xl">{selected.name}</div>
                                <div className="text-sm text-white/60">{selected.email}</div>
                                {selected.phone && <div className="text-sm text-white/60">{selected.phone}</div>}
                                {selected.company && <div className="text-sm text-white/60">{selected.company}</div>}
                            </div>

                            <Field label="Stage">
                                <select
                                    value={selected.stage}
                                    onChange={(e) => moveStage(selected, e.target.value)}
                                    data-testid="lead-stage-select"
                                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-[#7957FF]">
                                    {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                                </select>
                            </Field>

                            {selected.industry && <Row label="Industry" value={selected.industry} />}
                            {selected.budget && <Row label="Budget" value={selected.budget} />}
                            {selected.services?.length > 0 && <Row label="Services" value={selected.services.join(", ")} />}
                            {selected.goals && <Row label="Goals" value={selected.goals} />}
                            {selected.message && <Row label="Message" value={selected.message} />}
                            <Row label="Source" value={selected.source || "—"} />
                            <Row label="Created" value={new Date(selected.created_at).toLocaleString()} />

                            {selected.stage !== "won" && (
                                <button onClick={() => convert(selected)} data-testid="lead-convert-btn"
                                    className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B6B] to-[#7957FF]">
                                    Convert to client <ArrowRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div>
            <div className="text-xs font-mono uppercase tracking-widest text-white/40">{label}</div>
            <div className="mt-1 text-sm">{value}</div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <label className="block">
            <div className="text-xs font-mono uppercase tracking-widest text-white/40">{label}</div>
            <div className="mt-2">{children}</div>
        </label>
    );
}
