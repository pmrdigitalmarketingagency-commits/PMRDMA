import React, { useState } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth, isStaff } from "../../lib/auth";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
    const { user, login } = useAuth();
    const nav = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    if (user && user !== false) {
        const target = isStaff(user.role) ? "/app" : "/portal";
        return <Navigate to={location.state?.from?.pathname || target} replace />;
    }

    const submit = async (e) => {
        e.preventDefault();
        setErr("");
        setLoading(true);
        try {
            const u = await login(email, password);
            toast.success(`Welcome back, ${u.name || u.email}`);
            nav(isStaff(u.role) ? "/app" : "/portal", { replace: true });
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pmr-hero-gradient text-white flex items-center justify-center px-5 py-16 relative overflow-hidden" data-testid="login-page">
            <div className="absolute inset-0 pmr-grid-dots opacity-20" />
            <div className="relative w-full max-w-md">
                <Link to="/" className="inline-flex items-center gap-2 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7957FF] via-[#FF6B6B] to-[#53D8FB] flex items-center justify-center font-black text-sm">PMR</div>
                    <span className="font-display font-extrabold text-lg">Digital Agency</span>
                </Link>
                <div className="pmr-card rounded-3xl p-8">
                    <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#C6F36B]">/ Sign in</div>
                    <h1 className="mt-3 font-display text-3xl font-black">Welcome back.</h1>
                    <p className="mt-2 text-white/60 text-sm">Access your agency workspace or client portal.</p>

                    <form onSubmit={submit} className="mt-8 space-y-4">
                        <label className="block">
                            <div className="text-xs font-mono uppercase tracking-widest text-white/60">Email</div>
                            <div className="mt-2 relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                    data-testid="login-email"
                                    required type="email" autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-xl bg-white/5 border border-white/15 pl-10 pr-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#7957FF]"
                                    placeholder="you@company.com"
                                />
                            </div>
                        </label>
                        <label className="block">
                            <div className="text-xs font-mono uppercase tracking-widest text-white/60">Password</div>
                            <div className="mt-2 relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                    data-testid="login-password"
                                    required type="password" autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl bg-white/5 border border-white/15 pl-10 pr-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#7957FF]"
                                    placeholder="••••••••"
                                />
                            </div>
                        </label>

                        {err && <div data-testid="login-error" className="rounded-xl bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 px-4 py-3 text-sm text-[#FFB6B6]">{err}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            data-testid="login-submit"
                            className="w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B6B] to-[#7957FF] disabled:opacity-50"
                        >
                            {loading ? "Signing in…" : "Sign in"}
                            <ArrowRight className="w-4 h-4" />
                        </button>

                        <div className="flex justify-between text-xs">
                            <Link to="/forgot-password" className="text-white/60 hover:text-white" data-testid="forgot-password-link">Forgot password?</Link>
                            <Link to="/" className="text-white/60 hover:text-white">Back to site</Link>
                        </div>
                    </form>
                </div>

                <div className="mt-6 text-center text-xs text-white/40 font-mono">
                    Need an account? Staff is invitation-only. Clients are set up by their account manager.
                </div>
            </div>
        </div>
    );
}
