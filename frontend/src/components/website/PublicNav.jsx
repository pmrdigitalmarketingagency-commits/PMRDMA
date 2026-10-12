import React, { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";

const NAV_LINKS = [
    { label: "Services", href: "/services" },
    { label: "Industries", href: "/industries" },
    { label: "Our Work", href: "/work" },
    { label: "Pricing", href: "/pricing" },
    { label: "Insights", href: "/insights" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
];

export default function PublicNav() {
    const [open, setOpen] = useState(false);
    const location = useLocation();
    const onDark = location.pathname === "/";

    return (
        <header
            data-testid="public-nav"
            className={`sticky top-0 z-50 w-full ${onDark ? "backdrop-blur-xl bg-[#0B1020]/70 border-b border-white/5" : "backdrop-blur-xl bg-white/80 border-b border-neutral-200"}`}
        >
            <div className="max-w-7xl mx-auto px-5 lg:px-10 flex items-center justify-between h-16 lg:h-20">
                <Link to="/" className="flex items-center gap-2" data-testid="brand-link">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7957FF] via-[#FF6B6B] to-[#53D8FB] flex items-center justify-center font-black text-white text-sm shadow-lg shadow-[#7957FF]/30">
                        PMR
                    </div>
                    <span
                        className={`font-display font-extrabold tracking-tight text-lg hidden sm:inline ${onDark ? "text-white" : "text-[#0B1020]"}`}
                    >
                        Digital Agency
                    </span>
                </Link>

                <nav className="hidden lg:flex items-center gap-8">
                    {NAV_LINKS.map((l) => (
                        <NavLink
                            key={l.href}
                            to={l.href}
                            data-testid={`nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                            className={({ isActive }) =>
                                `text-sm font-medium pmr-link-underline transition-colors ${
                                    onDark
                                        ? isActive
                                            ? "text-white"
                                            : "text-white/70 hover:text-white"
                                        : isActive
                                          ? "text-[#0B1020]"
                                          : "text-neutral-600 hover:text-[#0B1020]"
                                }`
                            }
                        >
                            {l.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="hidden lg:flex items-center gap-3">
                    <Link
                        to="/login"
                        data-testid="nav-login"
                        className={`text-sm font-medium ${onDark ? "text-white/70 hover:text-white" : "text-neutral-600 hover:text-[#0B1020]"}`}
                    >
                        Sign in
                    </Link>
                    <Link
                        to="/contact"
                        data-testid="nav-book-call"
                        className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B6B] to-[#7957FF] hover:shadow-[0_0_30px_rgba(255,107,107,0.5)] transition-shadow"
                    >
                        Book a Strategy Call
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>

                <button
                    onClick={() => setOpen((o) => !o)}
                    className={`lg:hidden ${onDark ? "text-white" : "text-[#0B1020]"}`}
                    aria-label="Toggle menu"
                    data-testid="nav-mobile-toggle"
                >
                    {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {open && (
                <div
                    className="lg:hidden bg-[#0B1020] border-t border-white/10"
                    data-testid="mobile-menu"
                >
                    <div className="px-5 py-4 flex flex-col gap-3">
                        {NAV_LINKS.map((l) => (
                            <NavLink
                                key={l.href}
                                to={l.href}
                                onClick={() => setOpen(false)}
                                className="text-white/80 py-2 font-medium"
                                data-testid={`mobile-nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                            >
                                {l.label}
                            </NavLink>
                        ))}
                        <Link
                            to="/login"
                            onClick={() => setOpen(false)}
                            className="text-white/80 py-2 font-medium"
                            data-testid="mobile-nav-login"
                        >
                            Sign in
                        </Link>
                        <Link
                            to="/contact"
                            onClick={() => setOpen(false)}
                            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B6B] to-[#7957FF]"
                            data-testid="mobile-nav-book-call"
                        >
                            Book a Strategy Call
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
