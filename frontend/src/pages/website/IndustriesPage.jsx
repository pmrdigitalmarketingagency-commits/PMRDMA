import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Store, HeartPulse, GraduationCap, Home, Rocket, Briefcase, UserRound, ArrowRight } from "lucide-react";

const INDUSTRIES = [
    { label: "E-commerce & D2C", icon: Store, desc: "Scale Shopify, Amazon & marketplace revenue with full-funnel performance." },
    { label: "Healthcare", icon: HeartPulse, desc: "Compliant lead generation for hospitals, clinics & specialists." },
    { label: "Education", icon: GraduationCap, desc: "Admissions, counsellor pipelines & brand building for institutions." },
    { label: "Real Estate", icon: Home, desc: "High-intent leads for projects, developers & property platforms." },
    { label: "Startups & MSMEs", icon: Rocket, desc: "Go-to-market playbooks that fit lean teams and tight runways." },
    { label: "Professional Services", icon: Briefcase, desc: "Authority building for consultancies, agencies & B2B services." },
    { label: "Coaches & Personal Brands", icon: UserRound, desc: "Content ecosystems that convert attention into clients." },
];

export default function IndustriesPage() {
    useEffect(() => { document.title = "Industries — PMR"; }, []);
    return (
        <div data-testid="industries-page">
            <section className="relative overflow-hidden pmr-hero-gradient text-white py-20 lg:py-28">
                <div className="absolute inset-0 pmr-grid-dots opacity-20" />
                <div className="relative max-w-7xl mx-auto px-5 lg:px-10">
                    <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#C6F36B]">/ Industries</div>
                    <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">Built for how your market actually buys.</h1>
                </div>
            </section>
            <section className="bg-[#F8F8FC] py-20">
                <div className="max-w-7xl mx-auto px-5 lg:px-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {INDUSTRIES.map((i) => {
                        const Icon = i.icon;
                        return (
                            <div key={i.label} data-testid={`industry-card-${i.label.toLowerCase().replace(/\s+/g,"-")}`}
                                className="rounded-2xl bg-white border border-neutral-200 p-6 hover:-translate-y-1 transition-transform">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7957FF] to-[#FF6B6B] flex items-center justify-center text-white">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <h3 className="mt-5 font-display font-bold text-xl text-[#0B1020]">{i.label}</h3>
                                <p className="mt-2 text-neutral-500 text-sm leading-relaxed">{i.desc}</p>
                                <Link to="/contact" className="mt-5 inline-flex items-center gap-2 text-sm text-[#7957FF] font-semibold">
                                    Talk to our team <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
