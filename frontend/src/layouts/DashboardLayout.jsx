import React, { useState } from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import {
    LayoutDashboard, Users, Briefcase, FolderKanban, CheckSquare, UserCog,
    FileText, Receipt, Settings, LogOut, Menu, X, ChevronRight, Image as ImageIcon,
} from "lucide-react";

const NAV = [
    { to: "/app", icon: LayoutDashboard, label: "Overview", end: true, testid: "sidebar-overview" },
    { to: "/app/leads", icon: Users, label: "Leads & CRM", testid: "sidebar-leads" },
    { to: "/app/clients", icon: Briefcase, label: "Clients", testid: "sidebar-clients" },
    { to: "/app/projects", icon: FolderKanban, label: "Projects", testid: "sidebar-projects" },
    { to: "/app/tasks", icon: CheckSquare, label: "Tasks", testid: "sidebar-tasks" },
    { to: "/app/team", icon: UserCog, label: "Team", testid: "sidebar-team" },
    { to: "/app/content", icon: ImageIcon, label: "Content", testid: "sidebar-content" },
    { to: "/app/invoices", icon: Receipt, label: "Invoices", testid: "sidebar-invoices" },
    { to: "/app/settings", icon: Settings, label: "Settings", testid: "sidebar-settings" },
];

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const nav = useNavigate();

    const onLogout = async () => {
        await logout();
        nav("/login", { replace: true });
    };

    return (
        <div className="min-h-screen bg-[#0B1020] text-white flex" data-testid="dashboard-layout">
            {/* Sidebar */}
            <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-[#0E1428] border-r border-white/5 flex flex-col transition-transform ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
                <Link to="/app" className="h-16 px-5 flex items-center gap-2 border-b border-white/5">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7957FF] via-[#FF6B6B] to-[#53D8FB] flex items-center justify-center font-black text-sm">PMR</div>
                    <div>
                        <div className="font-display font-extrabold text-sm">PMR Workspace</div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">Agency OS</div>
                    </div>
                </Link>
                <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                    {NAV.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink key={item.to} to={item.to} end={item.end} data-testid={item.testid}
                                onClick={() => setOpen(false)}
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                        isActive
                                            ? "bg-gradient-to-r from-[#7957FF]/20 to-[#FF6B6B]/10 border border-[#7957FF]/30 text-white"
                                            : "text-white/60 hover:text-white hover:bg-white/5"
                                    }`
                                }>
                                <Icon className="w-4 h-4" />
                                <span className="flex-1">{item.label}</span>
                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </NavLink>
                        );
                    })}
                </nav>
                <div className="p-3 border-t border-white/5">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C6F36B] to-[#53D8FB] text-[#0B1020] font-bold text-xs flex items-center justify-center">
                            {(user?.name || user?.email || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate">{user?.name || "User"}</div>
                            <div className="text-[10px] font-mono uppercase text-white/40 truncate">{user?.role}</div>
                        </div>
                        <button onClick={onLogout} data-testid="logout-btn" title="Log out" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#FF6B6B]/20 flex items-center justify-center text-white/70 hover:text-[#FF6B6B]">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <header className="sticky top-0 z-30 bg-[#0B1020]/80 backdrop-blur-xl border-b border-white/5 h-16 flex items-center px-5 lg:px-8 gap-4">
                    <button className="lg:hidden text-white/70" onClick={() => setOpen((o) => !o)} data-testid="sidebar-toggle">
                        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                    <div className="flex-1 flex items-center justify-between">
                        <div className="font-display font-bold text-sm text-white/90">PMR Agency Workspace</div>
                        <div className="flex items-center gap-3">
                            <Link to="/" className="text-xs font-mono text-white/50 hover:text-white">View public site →</Link>
                        </div>
                    </div>
                </header>
                <main className="p-5 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
