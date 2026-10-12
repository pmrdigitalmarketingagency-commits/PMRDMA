import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api, formatApiError } from "../../lib/api";
import { toast } from "sonner";
import { ArrowRight, Mail } from "lucide-react";

export function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/auth/forgot-password", { email });
            setSent(true);
        } catch (err) {
            toast.error(formatApiError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pmr-hero-gradient text-white flex items-center justify-center px-5 py-16" data-testid="forgot-password-page">
            <div className="w-full max-w-md">
                <div className="pmr-card rounded-3xl p-8">
                    <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#C6F36B]">/ Password reset</div>
                    <h1 className="mt-3 font-display text-3xl font-black">Reset your password.</h1>
                    {sent ? (
                        <div className="mt-6 text-white/70 text-sm" data-testid="forgot-sent">
                            If an account exists for <strong>{email}</strong>, we've sent a reset link. Please check your inbox.
                        </div>
                    ) : (
                        <form onSubmit={submit} className="mt-6 space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    data-testid="forgot-email"
                                    className="w-full rounded-xl bg-white/5 border border-white/15 pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#7957FF]" placeholder="you@company.com" />
                            </div>
                            <button type="submit" disabled={loading} data-testid="forgot-submit"
                                className="w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B6B] to-[#7957FF] disabled:opacity-50">
                                {loading ? "Sending…" : "Send reset link"} <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    )}
                    <Link to="/login" className="mt-6 inline-block text-xs text-white/60 hover:text-white font-mono">← Back to sign in</Link>
                </div>
            </div>
        </div>
    );
}

export function ResetPasswordPage() {
    const [token, setToken] = useState(() => new URLSearchParams(window.location.search).get("token") || "");
    const [password, setPassword] = useState("");
    const [done, setDone] = useState(false);
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
        setLoading(true);
        try {
            await api.post("/auth/reset-password", { token, password });
            setDone(true);
        } catch (err) {
            toast.error(formatApiError(err));
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen pmr-hero-gradient text-white flex items-center justify-center px-5 py-16" data-testid="reset-password-page">
            <div className="w-full max-w-md">
                <div className="pmr-card rounded-3xl p-8">
                    <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#C6F36B]">/ Set new password</div>
                    <h1 className="mt-3 font-display text-3xl font-black">Pick a new password.</h1>
                    {done ? (
                        <div className="mt-6 text-white/70 text-sm" data-testid="reset-done">
                            Your password has been updated. <Link to="/login" className="text-[#53D8FB] underline">Sign in now</Link>.
                        </div>
                    ) : (
                        <form onSubmit={submit} className="mt-6 space-y-4">
                            <input required value={token} onChange={(e) => setToken(e.target.value)}
                                data-testid="reset-token"
                                placeholder="Reset token"
                                className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#7957FF]" />
                            <input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                                data-testid="reset-password"
                                placeholder="New password (min 8 chars)"
                                className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#7957FF]" />
                            <button type="submit" disabled={loading} data-testid="reset-submit"
                                className="w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B6B] to-[#7957FF] disabled:opacity-50">
                                {loading ? "Updating…" : "Update password"} <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
