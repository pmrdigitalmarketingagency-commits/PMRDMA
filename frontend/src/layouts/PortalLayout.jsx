import React, { useState } from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { LayoutDashboard, FolderKanban, CheckSquare, Receipt, LogOut, UserRound } from "lucide-react";

const NAV = [
    { to: "/portal", icon: LayoutDashboard, label: "Overview", end: true, testid: "portal-nav-overview" },
    { to: "/portal/projects", icon: FolderKanban, label: "Projects", testid: "portal-nav-projects" },
    { to: "/portal/tasks", icon: CheckSquare, label: "Tasks", testid: "portal-nav-tasks" },
    { to: "/portal/invoices", icon: Receipt, label: "Invoices", testid: "portal-nav-invoices" },
    { to: "/portal/profile", icon: UserRound, label: "Profile", testid: "portal-nav-profile" },
];

export default function PortalLayout() {
    const { user, logout } = useAuth();
    const nav = useNavigate();
    return (
        <div className="min-h-screen bg-[#F8F8FC]" data-testid="portal-layout">
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-neutral-200 h-16 flex items-center">
                <div className="max-w-7xl mx-auto px-5 lg:px-10 w-full flex items-center gap-4">
                    <Link to="/portal" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7957FF] via-[#FF6B6B] to-[#53D8FB] flex items-center justify-center font-black text-sm text-white">PMR</div>
                        <div>
                            <div className="font-display font-bold text-sm text-[#0B1020]">Client Portal</div>
                        </div>
                    </Link>
                    <nav className="hidden lg:flex ml-10 gap-6">
                        {NAV.map((n) => (
                            <NavLink key={n.to} to={n.to} end={n.end} data-testid={n.testid}
                                className={({ isActive }) => `text-sm font-medium ${isActive ? "text-[#0B1020]" : "text-neutral-500 hover:text-[#0B1020]"}`}>
                                {n.label}
                            </NavLink>
                        ))}
                    </nav>
                    <div className="ml-auto flex items-center gap-3">
                        <div className="text-xs font-mono text-neutral-500 hidden sm:block">{user?.name || user?.email}</div>
                        <button data-testid="portal-logout" onClick={async () => { await logout(); nav("/login"); }}
                            className="w-9 h-9 rounded-lg bg-neutral-100 hover:bg-[#FF6B6B]/10 flex items-center justify-center text-neutral-500 hover:text-[#FF6B6B]">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>
            <nav className="lg:hidden bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-5 flex gap-4 overflow-x-auto">
                    {NAV.map((n) => (
                        <NavLink key={n.to} to={n.to} end={n.end}
                            className={({ isActive }) => `py-3 text-sm font-medium whitespace-nowrap ${isActive ? "text-[#0B1020] border-b-2 border-[#7957FF]" : "text-neutral-500"}`}>
                            {n.label}
                        </NavLink>
                    ))}
                </div>
            </nav>
            <main className="max-w-7xl mx-auto px-5 lg:px-10 py-10">
                <Outlet />
            </main>
        </div>
    );
}
