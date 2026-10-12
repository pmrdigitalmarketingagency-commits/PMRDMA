import React, { useEffect } from "react";
import { Settings, Plug, Shield, FileText } from "lucide-react";

const INTEGRATIONS = [
    { name: "Google Analytics 4", status: "not_connected", desc: "Website analytics & conversion tracking." },
    { name: "Google Search Console", status: "not_connected", desc: "Organic search performance." },
    { name: "Google Ads", status: "not_connected", desc: "Search, display, YouTube campaigns." },
    { name: "Meta Ads", status: "not_connected", desc: "Facebook & Instagram advertising." },
    { name: "WhatsApp Business", status: "not_connected", desc: "Automated lead nurture." },
    { name: "Resend (Email)", status: "not_connected", desc: "Transactional & lead notifications." },
    { name: "Stripe", status: "not_connected", desc: "Online invoice payments." },
    { name: "Razorpay", status: "not_connected", desc: "Online invoice payments (India)." },
];

export default function SettingsPage() {
    useEffect(() => { document.title = "Settings — PMR"; }, []);
    return (
        <div data-testid="settings-page" className="space-y-6">
            <div>
                <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#53D8FB]">/ Settings</div>
                <h1 className="mt-2 font-display text-3xl font-black">Workspace settings</h1>
            </div>

            <section className="rounded-2xl bg-[#13192E] border border-white/5 p-6">
                <div className="flex items-start gap-3 mb-4">
                    <Settings className="w-5 h-5 text-[#53D8FB]" />
                    <div>
                        <div className="font-display font-bold">Agency profile</div>
                        <div className="text-sm text-white/60">Public details shown on invoices and the website.</div>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Agency name" value="PMR Digital Marketing Agency" />
                    <Field label="Domain" value="pmratnam.com" />
                    <Field label="Location" value="Hyderabad, Telangana, India" />
                    <Field label="Time zone" value="Asia/Kolkata" />
                    <Field label="Currency" value="INR (₹)" />
                    <Field label="Default GST" value="18%" />
                </div>
            </section>

            <section className="rounded-2xl bg-[#13192E] border border-white/5 p-6">
                <div className="flex items-start gap-3 mb-4">
                    <Plug className="w-5 h-5 text-[#53D8FB]" />
                    <div>
                        <div className="font-display font-bold">Integrations</div>
                        <div className="text-sm text-white/60">Connect external services. Credentials are stored server-side only.</div>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                    {INTEGRATIONS.map((i) => (
                        <div key={i.name} className="rounded-xl bg-white/5 border border-white/5 p-4 flex items-center justify-between" data-testid={`integration-${i.name.toLowerCase().replace(/\s+/g,"-")}`}>
                            <div>
                                <div className="font-semibold text-sm">{i.name}</div>
                                <div className="text-xs text-white/50 mt-0.5">{i.desc}</div>
                            </div>
                            <span className="px-2 py-1 rounded-full text-[10px] font-mono uppercase border border-white/10 text-white/50">Not connected</span>
                        </div>
                    ))}
                </div>
                <p className="mt-4 text-xs text-white/40 font-mono">Integration adapters are prepared — connect them once credentials are available.</p>
            </section>

            <section className="rounded-2xl bg-[#13192E] border border-white/5 p-6">
                <div className="flex items-start gap-3 mb-4">
                    <Shield className="w-5 h-5 text-[#53D8FB]" />
                    <div>
                        <div className="font-display font-bold">Security</div>
                        <div className="text-sm text-white/60">Auth, roles & audit controls.</div>
                    </div>
                </div>
                <div className="text-sm text-white/70 space-y-2">
                    <div>• JWT authentication with HTTP-only cookies</div>
                    <div>• Password hashing with bcrypt</div>
                    <div>• Brute-force lockout after 5 failed logins</div>
                    <div>• Role-based access control enforced server-side</div>
                </div>
            </section>
        </div>
    );
}

function Field({ label, value }) {
    return (
        <div>
            <div className="text-xs font-mono uppercase tracking-widest text-white/40">{label}</div>
            <div className="mt-1 text-sm">{value}</div>
        </div>
    );
}
