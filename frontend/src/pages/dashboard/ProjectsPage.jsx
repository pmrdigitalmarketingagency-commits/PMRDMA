import React, { useEffect, useState } from "react";
import { api, formatApiError } from "../../lib/api";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

const STATUSES = ["planning", "in_progress", "review", "on_hold", "completed", "cancelled"];
const STATUS_COLORS = {
    planning: "border-[#53D8FB]/30 text-[#53D8FB]",
    in_progress: "border-[#C6F36B]/30 text-[#C6F36B]",
    review: "border-[#FFB347]/30 text-[#FFB347]",
    on_hold: "border-white/10 text-white/50",
    completed: "border-[#06d6a0]/30 text-[#06d6a0]",
    cancelled: "border-[#FF6B6B]/30 text-[#FF6B6B]",
};

export default function ProjectsPage() {
    const [items, setItems] = useState([]);
    const [clients, setClients] = useState([]);
    const [services, setServices] = useState([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ name: "", client_id: "", service_type: "", status: "planning", start_date: "", due_date: "", budget: "", description: "" });

    const load = () => api.get("/projects").then((r) => setItems(r.data)).catch(() => {});
    useEffect(() => {
        document.title = "Projects — PMR";
        load();
        api.get("/clients").then((r) => setClients(r.data));
        api.get("/services").then((r) => setServices(r.data));
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/projects", { ...form, budget: form.budget ? parseFloat(form.budget) : null });
            toast.success("Project created");
            setOpen(false);
            setForm({ name: "", client_id: "", service_type: "", status: "planning", start_date: "", due_date: "", budget: "", description: "" });
            load();
        } catch (err) { toast.error(formatApiError(err)); }
    };

    return (
        <div data-testid="projects-page" className="space-y-6">
            <div className="flex justify-between items-start gap-4">
                <div>
                    <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#53D8FB]">/ Projects</div>
                    <h1 className="mt-2 font-display text-3xl font-black">Projects</h1>
                </div>
                <button onClick={() => setOpen(true)} data-testid="new-project-btn"
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B6B] to-[#7957FF]">
                    <Plus className="w-4 h-4" /> New project
                </button>
            </div>

            {items.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center text-white/50 bg-[#13192E]">
                    No projects yet. Create your first project to track delivery.
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map((p) => {
                        const cl = clients.find((c) => c.id === p.client_id);
                        return (
                            <div key={p.id} data-testid={`project-card-${p.id}`}
                                className="rounded-2xl bg-[#13192E] border border-white/5 p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="font-display font-bold text-lg">{p.name}</div>
                                        <div className="text-xs text-white/50 mt-1">{cl?.name || "No client"} · {p.service_type}</div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest border ${STATUS_COLORS[p.status] || "border-white/10"}`}>{p.status.replace("_", " ")}</span>
                                </div>
                                <div className="mt-5">
                                    <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                                        <span>Progress</span>
                                        <span className="font-mono">{p.progress || 0}%</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-[#7957FF] to-[#C6F36B]" style={{ width: `${p.progress || 0}%` }} />
                                    </div>
                                </div>
                                {p.due_date && (
                                    <div className="mt-4 text-xs font-mono text-white/50">Due {new Date(p.due_date).toLocaleDateString()}</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {open && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5" onClick={() => setOpen(false)}>
                    <form onSubmit={submit} onClick={(e) => e.stopPropagation()} data-testid="project-modal"
                        className="w-full max-w-lg bg-[#0E1428] rounded-2xl border border-white/10 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div className="font-display font-bold text-xl">New project</div>
                            <button type="button" onClick={() => setOpen(false)}><X className="w-5 h-5 text-white/60" /></button>
                        </div>
                        <div className="space-y-4">
                            <label className="block">
                                <div className="text-xs font-mono uppercase tracking-widest text-white/60">Project name *</div>
                                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="project-name"
                                    className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-[#7957FF]" />
                            </label>
                            <label className="block">
                                <div className="text-xs font-mono uppercase tracking-widest text-white/60">Client *</div>
                                <select required value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} data-testid="project-client"
                                    className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-[#7957FF]">
                                    <option value="">Select client…</option>
                                    {clients.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.company}</option>)}
                                </select>
                            </label>
                            <label className="block">
                                <div className="text-xs font-mono uppercase tracking-widest text-white/60">Service type *</div>
                                <select required value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })} data-testid="project-service"
                                    className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-[#7957FF]">
                                    <option value="">Select…</option>
                                    {services.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                                </select>
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <label className="block">
                                    <div className="text-xs font-mono uppercase tracking-widest text-white/60">Start</div>
                                    <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                                        className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-[#7957FF]" />
                                </label>
                                <label className="block">
                                    <div className="text-xs font-mono uppercase tracking-widest text-white/60">Due</div>
                                    <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                                        className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-[#7957FF]" />
                                </label>
                            </div>
                            <label className="block">
                                <div className="text-xs font-mono uppercase tracking-widest text-white/60">Budget (₹)</div>
                                <input type="number" min="0" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}
                                    className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-[#7957FF]" />
                            </label>
                        </div>
                        <button type="submit" data-testid="project-submit"
                            className="mt-6 w-full rounded-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B6B] to-[#7957FF]">
                            Create project
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
