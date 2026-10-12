import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const PLANS = [
    {
        name: "Starter",
        price: "₹35,000",
        period: "/mo",
        tagline: "Right for solopreneurs & new businesses.",
        features: ["Social media management (3 posts/week)", "Monthly content calendar", "Google Business profile optimization", "Monthly report"],
        cta: "Request a Custom Quote",
    },
    {
        name: "Growth",
        price: "₹85,000",
        period: "/mo",
        tagline: "Most popular for growing SMBs.",
        features: ["Integrated SEO + Social + Content", "Paid ads management (ad spend extra)", "Landing page + CRO sprints", "Analytics & GA4 setup", "Weekly performance review"],
        cta: "Request a Custom Quote",
        highlight: true,
    },
    {
        name: "Scale",
        price: "Custom",
        period: "",
        tagline: "For brands scaling multi-channel growth.",
        features: ["Dedicated strategist + delivery pod", "Multi-channel paid campaigns", "Content, video & creative production", "CRM/marketing automation", "Executive reporting cadence"],
        cta: "Request a Proposal",
    },
];

export default function PricingPage() {
    useEffect(() => { document.title = "Pricing — PMR"; }, []);
    return (
        <div data-testid="pricing-page">
            <section className="relative overflow-hidden pmr-hero-gradient text-white py-20 lg:py-28">
                <div className="absolute inset-0 pmr-grid-dots opacity-20" />
                <div className="relative max-w-5xl mx-auto px-5 lg:px-10 text-center">
                    <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#C6F36B]">/ Pricing</div>
                    <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
                        Transparent engagements, <span className="pmr-gradient-text italic">built for your stage.</span>
                    </h1>
                    <p className="mt-6 text-white/70 text-lg max-w-2xl mx-auto">
                        Indicative packages below. Every engagement is scoped around your goals. Agency fees exclude ad spend, GST, and third-party software.
                    </p>
                </div>
            </section>
            <section className="bg-[#F8F8FC] py-20">
                <div className="max-w-7xl mx-auto px-5 lg:px-10 grid md:grid-cols-3 gap-6">
                    {PLANS.map((p) => (
                        <div
                            key={p.name}
                            data-testid={`plan-${p.name.toLowerCase()}`}
                            className={`rounded-3xl p-8 ${
                                p.highlight
                                    ? "bg-[#0B1020] text-white border border-[#7957FF]/40 pmr-glow"
                                    : "bg-white border border-neutral-200"
                            }`}
                        >
                            {p.highlight && (
                                <div className="inline-flex px-3 py-1 rounded-full bg-[#C6F36B] text-[#0B1020] text-xs font-bold mb-4">Most popular</div>
                            )}
                            <div className={`font-display text-2xl font-black ${p.highlight ? "text-white" : "text-[#0B1020]"}`}>{p.name}</div>
                            <div className={`mt-1 text-sm ${p.highlight ? "text-white/60" : "text-neutral-500"}`}>{p.tagline}</div>
                            <div className="mt-6 flex items-baseline gap-1">
                                <span className={`font-display text-4xl font-black ${p.highlight ? "text-white" : "text-[#0B1020]"}`}>{p.price}</span>
                                <span className={p.highlight ? "text-white/60" : "text-neutral-500"}>{p.period}</span>
                            </div>
                            <ul className="mt-6 space-y-3">
                                {p.features.map((f) => (
                                    <li key={f} className={`flex items-start gap-3 text-sm ${p.highlight ? "text-white/80" : "text-neutral-700"}`}>
                                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${p.highlight ? "text-[#C6F36B]" : "text-[#7957FF]"}`} />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                to="/contact?intent=proposal"
                                data-testid={`plan-cta-${p.name.toLowerCase()}`}
                                className={`mt-8 inline-flex items-center justify-center gap-2 w-full rounded-full px-5 py-3 text-sm font-semibold ${
                                    p.highlight
                                        ? "bg-gradient-to-r from-[#FF6B6B] to-[#7957FF] text-white"
                                        : "bg-[#0B1020] text-white"
                                }`}
                            >
                                {p.cta} <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ))}
                </div>
                <p className="max-w-3xl mx-auto px-5 text-center text-xs text-neutral-400 font-mono mt-10">
                    Prices are indicative and shown for discovery only. Final pricing is confirmed in a written proposal. GST, ad spend, and premium third-party software are billed separately.
                </p>
            </section>
        </div>
    );
}
