import React, { useEffect, useState } from "react";
import { api, formatApiError } from "../../lib/api";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

const ROLES = ["admin", "sales_manager", "project_manager", "marketing_executive", "finance_manager", "employee"];
const ROLE_LABELS = {
    super_admin: "Super Admin",
    admin: "Admin",
    sales_manager: "Sales Manager",
    project_manager: "Project Manager",
    marketing_executive: "Marketing Executive",
    finance_manager: "Finance Manager",
    employee: "Employee",
    client: "Client",
};

export default function TeamPage() {
    const [users, setUsers] = useState([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ email: "", password: "", name: "", role: "employee", phone: "" });

    const load = () => api.get("/users").then((r) => setUsers(r.data)).catch(() => {});
    useEffect(() => { document.title = "Team — PMR"; load(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/users", form);
            toast.success("Team member added");
            setOpen(false);
            setForm({ email: "", password: "", name: "", role: "employee", phone: "" });
            load();
        } catch (err) { toast.error(formatApiError(err)); }
    };

    const staff = users.filter((u) => u.role !== "client");

    return (
        <div data-testid="team-page" className="space-y-6">
            <div className="flex justify-between items-start gap-4">
                <div>
                    <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#53D8FB]">/ Team</div>
                    <h1 className="mt-2 font-display text-3xl font-black">Team members</h1>
                </div>
                <button onClick={() => setOpen(true)} data-testid="new-user-btn"
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B6B] to-[#7957FF]">
                    <Plus className="w-4 h-4" /> Add member
                </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {staff.map((u) => (
                    <div key={u.id} data-testid={`user-card-${u.id}`} className="rounded-2xl bg-[#13192E] border border-white/5 p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7957FF] to-[#FF6B6B] flex items-center justify-center font-bold">
                                {(u.name || "?").charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold truncate">{u.name}</div>
                                <div className="text-xs text-white/50 truncate">{u.email}</div>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <span className="px-2 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest border border-[#7957FF]/30 text-[#C5B7FF]">{ROLE_LABELS[u.role]}</span>
                            <span className={`px-2 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest border ${u.status === "active" ? "border-[#C6F36B]/30 text-[#C6F36B]" : "border-white/10 text-white/50"}`}>{u.status}</span>
                        </div>
                    </div>
                ))}
            </div>

            {open && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5" onClick={() => setOpen(false)}>
                    <form onSubmit={submit} onClick={(e) => e.stopPropagation()} data-testid="user-modal"
                        className="w-full max-w-md bg-[#0E1428] rounded-2xl border border-white/10 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div className="font-display font-bold text-xl">Add team member</div>
                            <button type="button" onClick={() => setOpen(false)}><X className="w-5 h-5 text-white/60" /></button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { k: "name", l: "Full name *" },
                                { k: "email", l: "Email *", type: "email" },
                                { k: "password", l: "Temporary password *", type: "password", min: 8 },
                                { k: "phone", l: "Phone" },
                            ].map((f) => (
                                <label key={f.k} className="block">
                                    <div className="text-xs font-mono uppercase tracking-widest text-white/60">{f.l}</div>
                                    <input required={f.l.includes("*")} type={f.type || "text"} minLength={f.min} value={form[f.k]}
                                        onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                                        data-testid={`user-field-${f.k}`}
                                        className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-[#7957FF]" />
                                </label>
                            ))}
                            <label className="block">
                                <div className="text-xs font-mono uppercase tracking-widest text-white/60">Role *</div>
                                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} data-testid="user-field-role"
                                    className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-[#7957FF]">
                                    {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                                </select>
                            </label>
                        </div>
                        <button type="submit" data-testid="user-submit"
                            className="mt-6 w-full rounded-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B6B] to-[#7957FF]">
                            Add member
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
