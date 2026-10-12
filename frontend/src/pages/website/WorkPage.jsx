import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { ArrowRight } from "lucide-react";

const CATEGORIES = ["All", "SEO", "Paid Advertising", "Social Media", "Branding", "Web Development", "Content Marketing"];

export default function WorkPage() {
    const [items, setItems] = useState([]);
    const [cat, setCat] = useState("All");

    useEffect(() => {
        document.title = "Our Work — PMR";
        api.get("/public/portfolio").then((r) => setItems(r.data)).catch(() => {});
    }, []);

    const filtered = cat === "All" ? items : items.filter((i) => i.category === cat);

    return (
        <div data-testid="work-page">
            <section className="relative overflow-hidden pmr-hero-gradient text-white py-20 lg:py-28">
                <div className="absolute inset-0 pmr-grid-dots opacity-20" />
                <div className="relative max-w-7xl mx-auto px-5 lg:px-10">
                    <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#C6F36B]">/ Portfolio</div>
                    <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
                        Projects we're <span className="pmr-gradient-text italic">proud of.</span>
                    </h1>
                </div>
            </section>
            <section className="bg-[#F8F8FC] py-16">
                <div className="max-w-7xl mx-auto px-5 lg:px-10">
                    <div className="flex flex-wrap gap-2 mb-10">
                        {CATEGORIES.map((c) => (
                            <button
                                key={c}
                                onClick={() => setCat(c)}
                                data-testid={`portfolio-filter-${c.toLowerCase().replace(/\s+/g, "-")}`}
                                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                                    cat === c
                                        ? "bg-[#0B1020] text-white border-[#0B1020]"
                                        : "bg-white text-neutral-700 border-neutral-200 hover:border-[#7957FF]"
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                    {filtered.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-neutral-300 p-16 text-center bg-white">
                            <div className="font-display font-bold text-2xl text-[#0B1020]">Case studies coming soon</div>
                            <p className="mt-3 text-neutral-500 max-w-md mx-auto">
                                We publish real, measurable work. Projects appear here once results are approved by our clients.
                            </p>
                            <Link to="/contact" className="mt-6 inline-flex items-center gap-2 text-[#7957FF] font-semibold">
                                Discuss your project <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map((p) => (
                                <div key={p.id} data-testid={`work-item-${p.slug}`} className="rounded-2xl bg-white border border-neutral-200 overflow-hidden group">
                                    {p.cover_image && (
                                        <div className="h-52 bg-neutral-100 overflow-hidden">
                                            <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <div className="text-xs font-mono text-neutral-400 uppercase">{p.industry} · {p.category}</div>
                                        <h3 className="mt-2 font-display font-bold text-lg text-[#0B1020]">{p.title}</h3>
                                        <p className="mt-2 text-sm text-neutral-500 line-clamp-3">{p.challenge}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
