import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { FolderKanban, CheckSquare, Receipt, AlertCircle } from "lucide-react";

export function PortalOverview() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    useEffect(() => {
        document.title = "Client Portal — PMR";
        api.get("/portal/overview").then((r) => setStats(r.data)).catch(() => setStats({ error: true }));
    }, []);
    return (
        <div data-testid="portal-overview" className="space-y-8">
            <div>
                <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#7957FF]">/ Portal</div>
                <h1 className="mt-2 font-display text-3xl lg:text-4xl font-black text-[#0B1020]">Welcome, {user?.name?.split(" ")[0] || "there"}.</h1>
                <p className="mt-2 text-neutral-500">Your projects, invoices, and progress — in one place.</p>
            </div>
            {!stats ? (
                <div className="h-32 rounded-2xl bg-white border border-neutral-200 pmr-shimmer" />
            ) : stats.error ? (
                <div className="rounded-2xl bg-white border border-neutral-200 p-10 text-center text-neutral-500">
                    <AlertCircle className="w-6 h-6 mx-auto mb-3 opacity-50" /> No client workspace linked yet. Please contact your account manager.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Card icon={FolderKanban} label="Active projects" value={stats.active_projects} total={stats.total_projects} />
                    <Card icon={CheckSquare} label="Projects total" value={stats.total_projects} />
                    <Card icon={Receipt} label="Outstanding" value={`₹${(stats.outstanding_amount || 0).toLocaleString("en-IN")}`} />
                </div>
            )}
        </div>
    );
}

function Card({ icon: Icon, label, value, total }) {
    return (
        <div className="rounded-2xl bg-white border border-neutral-200 p-6">
            <Icon className="w-5 h-5 text-[#7957FF]" />
            <div className="mt-3 font-display text-3xl font-black text-[#0B1020]">
                {value}{total !== undefined && <span className="text-neutral-400 text-lg font-semibold"> / {total}</span>}
            </div>
            <div className="mt-1 text-xs font-mono uppercase tracking-widest text-neutral-500">{label}</div>
        </div>
    );
}

export function PortalProjects() {
    const [items, setItems] = useState([]);
    useEffect(() => { api.get("/projects").then((r) => setItems(r.data)); }, []);
    return (
        <div data-testid="portal-projects" className="space-y-6">
            <h1 className="font-display text-3xl font-black text-[#0B1020]">Projects</h1>
            {items.length === 0 ? (
                <div className="rounded-2xl bg-white border border-neutral-200 p-10 text-center text-neutral-500">
                    No projects yet. Your account manager will set these up.
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map((p) => (
                        <div key={p.id} className="rounded-2xl bg-white border border-neutral-200 p-5" data-testid={`portal-project-${p.id}`}>
                            <div className="text-xs font-mono text-neutral-400 uppercase">{p.service_type}</div>
                            <div className="mt-2 font-display font-bold text-lg text-[#0B1020]">{p.name}</div>
                            <div className="mt-5">
                                <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                                    <span>Progress</span><span className="font-mono">{p.progress || 0}%</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-[#7957FF] to-[#C6F36B]" style={{ width: `${p.progress || 0}%` }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function PortalTasks() {
    const [items, setItems] = useState([]);
    useEffect(() => { api.get("/tasks").then((r) => setItems(r.data)); }, []);
    return (
        <div data-testid="portal-tasks" className="space-y-6">
            <h1 className="font-display text-3xl font-black text-[#0B1020]">Tasks</h1>
            {items.length === 0 ? (
                <div className="rounded-2xl bg-white border border-neutral-200 p-10 text-center text-neutral-500">No tasks yet.</div>
            ) : (
                <div className="rounded-2xl bg-white border border-neutral-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-neutral-50 text-left text-xs font-mono uppercase tracking-widest text-neutral-500">
                                <th className="px-5 py-3">Title</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">Due</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((t) => (
                                <tr key={t.id} className="border-t border-neutral-100" data-testid={`portal-task-${t.id}`}>
                                    <td className="px-5 py-3 text-[#0B1020]">{t.title}</td>
                                    <td className="px-5 py-3 text-neutral-500">{t.status.replace("_", " ")}</td>
                                    <td className="px-5 py-3 text-neutral-500">{t.due_date || "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export function PortalInvoices() {
    const [items, setItems] = useState([]);
    useEffect(() => { api.get("/invoices").then((r) => setItems(r.data)); }, []);
    return (
        <div data-testid="portal-invoices" className="space-y-6">
            <h1 className="font-display text-3xl font-black text-[#0B1020]">Invoices</h1>
            {items.length === 0 ? (
                <div className="rounded-2xl bg-white border border-neutral-200 p-10 text-center text-neutral-500">No invoices yet.</div>
            ) : (
                <div className="rounded-2xl bg-white border border-neutral-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-neutral-50 text-left text-xs font-mono uppercase tracking-widest text-neutral-500">
                                <th className="px-5 py-3">Number</th>
                                <th className="px-5 py-3">Issued</th>
                                <th className="px-5 py-3">Due</th>
                                <th className="px-5 py-3">Total</th>
                                <th className="px-5 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((inv) => (
                                <tr key={inv.id} className="border-t border-neutral-100" data-testid={`portal-invoice-${inv.id}`}>
                                    <td className="px-5 py-3 font-mono text-xs">{inv.invoice_number}</td>
                                    <td className="px-5 py-3 text-neutral-500">{inv.issue_date}</td>
                                    <td className="px-5 py-3 text-neutral-500">{inv.due_date}</td>
                                    <td className="px-5 py-3 font-semibold">₹{inv.total?.toLocaleString("en-IN")}</td>
                                    <td className="px-5 py-3 text-neutral-500">{inv.status.replace("_", " ")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export function PortalProfile() {
    const { user } = useAuth();
    return (
        <div data-testid="portal-profile" className="space-y-6">
            <h1 className="font-display text-3xl font-black text-[#0B1020]">Profile</h1>
            <div className="rounded-2xl bg-white border border-neutral-200 p-6 space-y-3">
                <Row label="Name" value={user?.name} />
                <Row label="Email" value={user?.email} />
                <Row label="Role" value={user?.role} />
                <Row label="Status" value={user?.status} />
            </div>
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex justify-between py-2 border-b border-neutral-100 last:border-0">
            <span className="text-xs font-mono uppercase text-neutral-400">{label}</span>
            <span className="text-sm text-[#0B1020] font-medium">{value || "—"}</span>
        </div>
    );
}
