import React, { useEffect, useState } from "react";
import { api, formatApiError } from "../../lib/api";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

const COLUMNS = [
    { key: "backlog", label: "Backlog", color: "#9297AD" },
    { key: "todo", label: "To Do", color: "#53D8FB" },
    { key: "in_progress", label: "In Progress", color: "#7957FF" },
    { key: "in_review", label: "In Review", color: "#FFB347" },
    { key: "done", label: "Done", color: "#06d6a0" },
];

const PRIORITY_COLORS = {
    low: "border-white/10 text-white/50",
    normal: "border-[#53D8FB]/30 text-[#53D8FB]",
    high: "border-[#FFB347]/30 text-[#FFB347]",
    urgent: "border-[#FF6B6B]/30 text-[#FF6B6B]",
};

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ title: "", description: "", project_id: "", priority: "normal", status: "todo", due_date: "" });

    const load = () => api.get("/tasks").then((r) => setTasks(r.data)).catch(() => {});
    useEffect(() => {
        document.title = "Tasks — PMR";
        load();
        api.get("/projects").then((r) => setProjects(r.data));
    }, []);

    const grouped = COLUMNS.reduce((acc, c) => { acc[c.key] = tasks.filter((t) => t.status === c.key); return acc; }, {});

    const moveTask = async (task, status) => {
        try {
            await api.patch(`/tasks/${task.id}/status`, { status });
            toast.success("Task moved");
            load();
        } catch (e) { toast.error(formatApiError(e)); }
    };

    const submit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/tasks", form);
            toast.success("Task created");
            setOpen(false);
            setForm({ title: "", description: "", project_id: "", priority: "normal", status: "todo", due_date: "" });
            load();
        } catch (err) { toast.error(formatApiError(err)); }
    };

    return (
        <div data-testid="tasks-page" className="space-y-6">
            <div className="flex justify-between items-start gap-4">
                <div>
                    <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#53D8FB]">/ Tasks</div>
                    <h1 className="mt-2 font-display text-3xl font-black">Delivery board</h1>
                </div>
                <button onClick={() => setOpen(true)} data-testid="new-task-btn"
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B6B] to-[#7957FF]">
                    <Plus className="w-4 h-4" /> New task
                </button>
            </div>

            <div className="overflow-x-auto pb-4">
                <div className="grid grid-cols-5 gap-4 min-w-[1000px]">
                    {COLUMNS.map((col) => (
                        <div key={col.key} className="rounded-2xl bg-[#13192E] border border-white/5 p-4" data-testid={`task-col-${col.key}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                                    <span className="text-xs font-mono uppercase tracking-wider text-white/70">{col.label}</span>
                                </div>
                                <span className="text-xs text-white/40 font-mono">{grouped[col.key].length}</span>
                            </div>
                            <div className="space-y-2 min-h-[80px]">
                                {grouped[col.key].map((t) => {
                                    const project = projects.find((p) => p.id === t.project_id);
                                    return (
                                        <div key={t.id} data-testid={`task-card-${t.id}`}
                                            className="rounded-xl bg-white/5 border border-white/5 p-3">
                                            <div className="font-semibold text-sm">{t.title}</div>
                                            {project && <div className="text-xs text-white/50 mt-1">{project.name}</div>}
                                            <div className="mt-3 flex items-center justify-between gap-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase border ${PRIORITY_COLORS[t.priority]}`}>{t.priority}</span>
                                                <select value={t.status} onChange={(e) => moveTask(t, e.target.value)}
                                                    data-testid={`task-status-${t.id}`}
                                                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] text-white/70 focus:outline-none">
                                                    {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    );
                                })}
                                {grouped[col.key].length === 0 && <div className="text-xs text-white/30 italic">Empty</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {open && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5" onClick={() => setOpen(false)}>
                    <form onSubmit={submit} onClick={(e) => e.stopPropagation()} data-testid="task-modal"
                        className="w-full max-w-md bg-[#0E1428] rounded-2xl border border-white/10 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div className="font-display font-bold text-xl">New task</div>
                            <button type="button" onClick={() => setOpen(false)}><X className="w-5 h-5 text-white/60" /></button>
                        </div>
                        <div className="space-y-4">
                            <label className="block">
                                <div className="text-xs font-mono uppercase tracking-widest text-white/60">Title *</div>
                                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="task-title"
                                    className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-[#7957FF]" />
                            </label>
                            <label className="block">
                                <div className="text-xs font-mono uppercase tracking-widest text-white/60">Description</div>
                                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-[#7957FF]" />
                            </label>
                            <label className="block">
                                <div className="text-xs font-mono uppercase tracking-widest text-white/60">Project</div>
                                <select value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })} data-testid="task-project"
                                    className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-[#7957FF]">
                                    <option value="">(none)</option>
                                    {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <label className="block">
                                    <div className="text-xs font-mono uppercase tracking-widest text-white/60">Priority</div>
                                    <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                        className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-[#7957FF]">
                                        {["low","normal","high","urgent"].map((p) => <option key={p}>{p}</option>)}
                                    </select>
                                </label>
                                <label className="block">
                                    <div className="text-xs font-mono uppercase tracking-widest text-white/60">Due</div>
                                    <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                                        className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-[#7957FF]" />
                                </label>
                            </div>
                        </div>
                        <button type="submit" data-testid="task-submit"
                            className="mt-6 w-full rounded-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B6B] to-[#7957FF]">
                            Create task
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
