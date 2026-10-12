import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Users, Briefcase, FolderKanban, CheckSquare, TrendingUp, UserCheck, Target, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";

const STAGE_COLORS = ["#53D8FB", "#7957FF", "#FF6B6B", "#C6F36B", "#FFB347", "#06d6a0", "#ef476f"];
const KPI_CONFIG = [
    { key: "leads_total", label: "Total Leads", icon: Users, color: "from-[#7957FF] to-[#53D8FB]" },
    { key: "leads_new", label: "New Leads", icon: UserCheck, color: "from-[#53D8FB] to-[#C6F36B]" },
    { key: "leads_qualified", label: "Qualified", icon: Target, color: "from-[#C6F36B] to-[#FFB347]" },
    { key: "leads_won", label: "Won", icon: TrendingUp, color: "from-[#C6F36B] to-[#06d6a0]" },
    { key: "clients_active", label: "Active Clients", icon: Briefcase, color: "from-[#FF6B6B] to-[#7957FF]" },
    { key: "projects_active", label: "Active Projects", icon: FolderKanban, color: "from-[#7957FF] to-[#FF6B6B]" },
    { key: "tasks_due", label: "Open Tasks", icon: CheckSquare, color: "from-[#53D8FB] to-[#7957FF]" },
];

export default function OverviewPage() {
    const [data, setData] = useState(null);

    useEffect(() => {
        document.title = "Overview — PMR Workspace";
        api.get("/overview").then((r) => setData(r.data)).catch(() => setData({ error: true }));
    }, []);

    if (!data) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-testid="overview-loading">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-28 rounded-2xl bg-white/5 border border-white/5 pmr-shimmer" />
                ))}
            </div>
        );
    }
    if (data.error) {
        return <div className="text-white/60">Unable to load overview.</div>;
    }

    return (
        <div data-testid="overview-page" className="space-y-8">
            <div>
                <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#53D8FB]">/ Dashboard</div>
                <h1 className="mt-2 font-display text-3xl lg:text-4xl font-black">Agency pulse.</h1>
                <p className="mt-2 text-white/60 text-sm">Everything about today, at a glance.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {KPI_CONFIG.map((k) => {
                    const Icon = k.icon;
                    return (
                        <div key={k.key} data-testid={`kpi-${k.key}`} className="relative rounded-2xl bg-[#13192E] border border-white/5 p-5 overflow-hidden">
                            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${k.color} opacity-20 blur-2xl`} />
                            <Icon className="w-5 h-5 text-white/60" />
                            <div className="mt-3 font-display text-3xl font-black">{data.kpis[k.key] ?? 0}</div>
                            <div className="mt-1 text-xs font-mono uppercase tracking-widest text-white/50">{k.label}</div>
                        </div>
                    );
                })}
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
                <div className="rounded-2xl bg-[#13192E] border border-white/5 p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <div className="font-mono text-xs uppercase tracking-widest text-[#53D8FB]">Leads by stage</div>
                            <div className="mt-1 font-display font-bold text-lg">Pipeline distribution</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={data.leads_by_stage}>
                            <CartesianGrid stroke="#1E2640" vertical={false} />
                            <XAxis dataKey="stage" tick={{ fill: "#9297AD", fontSize: 11 }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fill: "#9297AD", fontSize: 11 }} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ background: "#0B1020", border: "1px solid #1E2640", borderRadius: 12 }} labelStyle={{ color: "#fff" }} />
                            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                {data.leads_by_stage.map((_, i) => (
                                    <Cell key={i} fill={STAGE_COLORS[i % STAGE_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="rounded-2xl bg-[#13192E] border border-white/5 p-6">
                    <div className="font-mono text-xs uppercase tracking-widest text-[#53D8FB]">Leads by source</div>
                    <div className="mt-1 font-display font-bold text-lg">Where leads come from</div>
                    {data.leads_by_source.length === 0 ? (
                        <div className="h-56 flex items-center justify-center text-white/40 text-sm">No leads captured yet.</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie data={data.leads_by_source} dataKey="count" nameKey="source" outerRadius={90} innerRadius={55}>
                                    {data.leads_by_source.map((_, i) => (
                                        <Cell key={i} fill={STAGE_COLORS[i % STAGE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: "#0B1020", border: "1px solid #1E2640", borderRadius: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            <div className="rounded-2xl bg-[#13192E] border border-white/5 p-6">
                <div className="flex items-center justify-between mb-5">
                    <div className="font-mono text-xs uppercase tracking-widest text-[#53D8FB]">Recent leads</div>
                    <a href="/app/leads" className="text-xs text-white/50 hover:text-white font-mono">View all →</a>
                </div>
                {data.recent_leads.length === 0 ? (
                    <div className="py-10 text-center text-white/40 text-sm">
                        <AlertCircle className="w-5 h-5 mx-auto mb-3 opacity-50" />
                        No leads yet. Share your contact form or ad campaigns to start capturing enquiries.
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {data.recent_leads.map((l) => (
                            <div key={l.id} className="py-3 flex items-center gap-4">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7957FF] to-[#FF6B6B] flex items-center justify-center text-white font-bold text-xs">
                                    {(l.name || "?").charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm truncate">{l.name}</div>
                                    <div className="text-xs text-white/50 truncate">{l.email} · {l.company || "—"}</div>
                                </div>
                                <span className="px-2 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-white/5 border border-white/10">{l.stage}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
