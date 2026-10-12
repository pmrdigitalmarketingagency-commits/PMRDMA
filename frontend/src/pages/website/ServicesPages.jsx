import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import { ArrowRight, CheckCircle2, Search, Share2, Target, Code, Sparkles, FileText, Video, ShoppingCart, BarChart3, Clock } from "lucide-react";

const ICONS = {
    search: Search, "share-2": Share2, target: Target, code: Code, sparkles: Sparkles,
    "file-text": FileText, video: Video, "shopping-cart": ShoppingCart, "bar-chart-3": BarChart3,
};

export function ServicesListPage() {
    const [services, setServices] = useState([]);
    useEffect(() => {
        document.title = "Services — PMR Digital Marketing Agency";
        api.get("/public/services").then((r) => setServices(r.data)).catch(() => {});
    }, []);
    return (
        <div data-testid="services-page">
            <section className="relative overflow-hidden pmr-hero-gradient text-white py-20 lg:py-28">
                <div className="absolute inset-0 pmr-grid-dots opacity-20" />
                <div className="relative max-w-7xl mx-auto px-5 lg:px-10">
                    <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#C6F36B]">/ Services</div>
                    <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
                        Integrated marketing, <span className="pmr-gradient-text italic">built to grow.</span>
                    </h1>
                    <p className="mt-6 max-w-2xl text-white/70 text-lg">
                        Nine deeply connected capabilities, orchestrated to turn marketing into a repeatable growth system.
                    </p>
                </div>
            </section>
            <section className="bg-[#F8F8FC] py-20 lg:py-28">
                <div className="max-w-7xl mx-auto px-5 lg:px-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((svc) => {
                        const Icon = ICONS[svc.icon] || Sparkles;
                        return (
                            <Link key={svc.id} to={`/services/${svc.slug}`} data-testid={`service-link-${svc.slug}`}
                                className="group rounded-2xl bg-white border border-neutral-200 p-6 hover:-translate-y-1 hover:border-[#7957FF]/40 hover:shadow-xl transition-all">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7957FF] to-[#FF6B6B] flex items-center justify-center text-white">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <h3 className="mt-5 font-display font-bold text-xl text-[#0B1020]">{svc.name}</h3>
                                <p className="mt-2 text-neutral-500 text-sm">{svc.description}</p>
                                <div className="mt-5 flex items-center gap-2 text-sm text-[#7957FF] font-semibold">
                                    Learn more <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}

export function ServiceDetailPage() {
    const { slug } = useParams();
    const [svc, setSvc] = useState(null);
    useEffect(() => {
        api.get("/public/services").then((r) => {
            const found = r.data.find((s) => s.slug === slug);
            setSvc(found || null);
            if (found) document.title = `${found.name} — PMR`;
        });
    }, [slug]);

    if (svc === null) {
        return (
            <section className="min-h-[60vh] flex items-center justify-center">
                <div className="text-neutral-400 font-mono">Loading service…</div>
            </section>
        );
    }
    const Icon = ICONS[svc.icon] || Sparkles;
    return (
        <div data-testid={`service-detail-${slug}`}>
            <section className="relative overflow-hidden pmr-hero-gradient text-white py-20 lg:py-28">
                <div className="absolute inset-0 pmr-grid-dots opacity-20" />
                <div className="relative max-w-7xl mx-auto px-5 lg:px-10">
                    <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-[#C6F36B]">
                        <Icon className="w-4 h-4" /> {svc.category}
                    </div>
                    <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-3xl">
                        {svc.name}
                    </h1>
                    <p className="mt-6 max-w-2xl text-white/70 text-lg">{svc.description}</p>
                    <Link to="/contact" className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B6B] to-[#7957FF] hover:shadow-[0_0_40px_rgba(255,107,107,0.5)]" data-testid="service-cta">
                        Discuss this service <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
            <section className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-5 lg:px-10 grid lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-7">
                        <h2 className="font-display text-3xl font-extrabold text-[#0B1020]">What you get</h2>
                        <div className="mt-6 space-y-3">
                            {(svc.deliverables || []).map((d) => (
                                <div key={d} className="flex items-start gap-3 text-neutral-700">
                                    <CheckCircle2 className="w-5 h-5 text-[#7957FF] flex-shrink-0 mt-0.5" />
                                    <span>{d}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-5">
                        <div className="rounded-2xl bg-[#0B1020] text-white p-8">
                            <div className="font-mono text-xs uppercase tracking-widest text-[#53D8FB]">How we work</div>
                            <ol className="mt-6 space-y-4">
                                {["Discovery call & audit", "Strategy & scope", "Kickoff & delivery sprints", "Measure & iterate"].map((s, i) => (
                                    <li key={s} className="flex items-start gap-3">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C6F36B] to-[#53D8FB] text-[#0B1020] text-xs font-bold flex items-center justify-center flex-shrink-0">0{i+1}</div>
                                        <span className="text-white/80 text-sm">{s}</span>
                                    </li>
                                ))}
                            </ol>
                            <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3 text-white/60 text-sm">
                                <Clock className="w-4 h-4" /> Indicative timeline: 4–12 weeks
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
