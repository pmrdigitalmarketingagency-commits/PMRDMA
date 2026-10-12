import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    ArrowUpRight,
    Search,
    Share2,
    Target,
    Code,
    Sparkles,
    FileText,
    Video,
    ShoppingCart,
    BarChart3,
    CheckCircle2,
    MessageSquare,
    Compass,
    Palette,
    Rocket,
    Gauge,
    TrendingUp,
    Building2,
    HeartPulse,
    GraduationCap,
    Home,
    Briefcase,
    UserRound,
    Store,
} from "lucide-react";
import { api } from "../../lib/api";

const ICONS = {
    search: Search,
    "share-2": Share2,
    target: Target,
    code: Code,
    sparkles: Sparkles,
    "file-text": FileText,
    video: Video,
    "shopping-cart": ShoppingCart,
    "bar-chart-3": BarChart3,
};

const CHALLENGES = [
    "Low-quality leads with no conversions",
    "Inconsistent brand identity across channels",
    "Website visitors that don't convert",
    "Limited online visibility and reach",
    "Unclear campaign performance data",
    "Disconnected marketing activities",
];

const METHODOLOGY = [
    { label: "Discover", icon: Compass, desc: "Audit, research & customer insight." },
    { label: "Strategize", icon: Target, desc: "Positioning, channels & roadmap." },
    { label: "Create", icon: Palette, desc: "Brand, content & creative systems." },
    { label: "Launch", icon: Rocket, desc: "Campaigns, websites & assets go live." },
    { label: "Optimize", icon: Gauge, desc: "A/B tests, CRO & creative iteration." },
    { label: "Scale", icon: TrendingUp, desc: "Compound growth with new channels." },
];

const INDUSTRIES = [
    { label: "E-commerce & D2C", icon: Store },
    { label: "Healthcare", icon: HeartPulse },
    { label: "Education", icon: GraduationCap },
    { label: "Real Estate", icon: Home },
    { label: "Startups & MSMEs", icon: Rocket },
    { label: "Professional Services", icon: Briefcase },
    { label: "Coaches & Personal Brands", icon: UserRound },
];

const WHY_PMR = [
    { title: "Strategy-led execution", desc: "Every campaign starts from a documented strategy, not a template." },
    { title: "Integrated services", desc: "Brand, performance, SEO, and content under one roof." },
    { title: "Clear communication", desc: "A single point of contact and transparent weekly updates." },
    { title: "Transparent deliverables", desc: "You know what's being made, by whom, and when." },
    { title: "Data-informed optimization", desc: "GA4, Search Console & paid platforms wired into decisions." },
    { title: "Business-focused reporting", desc: "Reports speak in revenue, pipeline, and ROAS — not vanity." },
];

export default function HomePage() {
    const [services, setServices] = useState([]);
    const [portfolio, setPortfolio] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [blog, setBlog] = useState([]);

    useEffect(() => {
        document.title = "PMR Digital Marketing Agency — Growth that moves your business forward";
        api.get("/public/services").then((r) => setServices(r.data)).catch(() => {});
        api.get("/public/portfolio").then((r) => setPortfolio(r.data)).catch(() => {});
        api.get("/public/testimonials").then((r) => setTestimonials(r.data)).catch(() => {});
        api.get("/public/blog").then((r) => setBlog(r.data.slice(0, 3))).catch(() => {});
    }, []);

    return (
        <div data-testid="home-page">
            {/* HERO */}
            <section
                className="relative overflow-hidden text-white pmr-hero-gradient"
                data-testid="hero-section"
            >
                <div className="absolute inset-0 pmr-grid-dots opacity-40" />
                <div className="absolute -top-32 -left-24 w-[480px] h-[480px] rounded-full bg-[#7957FF]/30 blur-[120px] pmr-float" />
                <div className="absolute top-20 right-0 w-[460px] h-[460px] rounded-full bg-[#FF6B6B]/20 blur-[120px]" />

                <div className="relative max-w-7xl mx-auto px-5 lg:px-10 pt-16 lg:pt-24 pb-24 lg:pb-32">
                    <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
                        <div className="lg:col-span-7">
                            <div
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-xs font-mono tracking-widest uppercase text-[#C6F36B]"
                                data-testid="hero-eyebrow"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#C6F36B] animate-pulse" />
                                Hyderabad · Full-service digital agency
                            </div>

                            <h1
                                className="mt-6 font-display font-black tracking-tight text-4xl sm:text-5xl lg:text-[72px] leading-[1.05]"
                                data-testid="hero-headline"
                            >
                                Your Growth{" "}
                                <span className="pmr-gradient-text italic">Deserves More</span>
                                <br /> Than Ordinary Marketing.
                            </h1>

                            <p className="mt-6 max-w-xl text-white/70 text-lg leading-relaxed">
                                From building your brand to generating qualified leads, PMR combines
                                strategy, creative execution, and performance marketing to help your
                                business grow — measurably.
                            </p>

                            <div className="mt-10 flex flex-wrap gap-3">
                                <Link
                                    to="/contact"
                                    data-testid="hero-cta-primary"
                                    className="group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B6B] to-[#7957FF] hover:shadow-[0_0_40px_rgba(255,107,107,0.5)] transition-shadow"
                                >
                                    Book a Strategy Call
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    to="/services"
                                    data-testid="hero-cta-secondary"
                                    className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white border border-white/20 hover:border-white/50 hover:bg-white/5 transition-colors"
                                >
                                    Explore Our Services
                                </Link>
                            </div>

                            <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3">
                                {["Branding", "Performance Marketing", "SEO", "Digital Experiences"].map(
                                    (t) => (
                                        <div
                                            key={t}
                                            className="flex items-center gap-2 text-white/60 text-sm"
                                        >
                                            <CheckCircle2 className="w-4 h-4 text-[#53D8FB]" /> {t}
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-5 relative">
                            <div className="relative pmr-card rounded-3xl p-6 pmr-glow pmr-float" style={{ animationDelay: "1s" }}>
                                <div className="flex items-center justify-between">
                                    <div className="text-xs font-mono uppercase tracking-widest text-[#53D8FB]">
                                        Strategy snapshot
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-[#C6F36B]" />
                                </div>
                                <div className="mt-5 space-y-4">
                                    {[
                                        { label: "Monthly Qualified Leads", v: "↑ 3.2×", c: "#C6F36B" },
                                        { label: "Avg. ROAS", v: "↑ 4.8×", c: "#53D8FB" },
                                        { label: "Organic Traffic", v: "↑ 212%", c: "#FF6B6B" },
                                        { label: "Cost per Lead", v: "↓ 46%", c: "#7957FF" },
                                    ].map((row) => (
                                        <div
                                            key={row.label}
                                            className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                                        >
                                            <span className="text-sm text-white/70">
                                                {row.label}
                                            </span>
                                            <span
                                                className="font-mono font-semibold"
                                                style={{ color: row.c }}
                                            >
                                                {row.v}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-5 text-xs text-white/40 font-mono">
                                    Indicative benchmarks from engagements. Real results vary by
                                    industry & objective.
                                </p>
                            </div>

                            <div className="absolute -bottom-6 -left-6 pmr-card rounded-2xl p-4 hidden sm:block">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C6F36B] to-[#53D8FB] flex items-center justify-center text-[#0B1020] font-bold text-xs">
                                        PMR
                                    </div>
                                    <div>
                                        <div className="text-xs text-white/50 font-mono">
                                            Live pipeline
                                        </div>
                                        <div className="text-sm font-semibold text-white">
                                            12 strategies in motion
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CHALLENGES */}
            <section className="bg-[#F8F8FC] py-20 lg:py-28" data-testid="challenges-section">
                <div className="max-w-7xl mx-auto px-5 lg:px-10">
                    <div className="grid lg:grid-cols-12 gap-10 items-end">
                        <div className="lg:col-span-6">
                            <div className="font-mono text-xs tracking-[0.3em] uppercase text-[#7957FF]">
                                / The problem
                            </div>
                            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0B1020]">
                                Marketing should move your business forward.
                            </h2>
                        </div>
                        <div className="lg:col-span-6">
                            <p className="text-neutral-600 text-lg">
                                Most businesses don't need more agencies — they need a partner that
                                connects strategy, creative, and measurement into one system.
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {CHALLENGES.map((c, i) => (
                            <div
                                key={c}
                                data-testid={`challenge-${i}`}
                                className="group relative rounded-2xl bg-white p-6 border border-neutral-200 hover:border-[#7957FF]/40 hover:-translate-y-1 transition-all"
                            >
                                <div className="font-mono text-xs text-neutral-400">
                                    0{i + 1}
                                </div>
                                <div className="mt-3 text-[#0B1020] font-display font-bold text-lg leading-snug">
                                    {c}
                                </div>
                                <div className="mt-4 h-1 w-10 rounded-full bg-gradient-to-r from-[#7957FF] to-[#FF6B6B] group-hover:w-20 transition-all" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SERVICES */}
            <section className="bg-[#0B1020] text-white py-20 lg:py-28 relative overflow-hidden" data-testid="services-section">
                <div className="absolute inset-0 pmr-grid-dots opacity-30" />
                <div className="relative max-w-7xl mx-auto px-5 lg:px-10">
                    <div className="flex flex-col lg:flex-row justify-between gap-6 mb-14">
                        <div>
                            <div className="font-mono text-xs tracking-[0.3em] uppercase text-[#53D8FB]">
                                / What we do
                            </div>
                            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                                Nine capabilities,
                                <br /> one growth system.
                            </h2>
                        </div>
                        <Link
                            to="/services"
                            data-testid="services-view-all"
                            className="self-start lg:self-end inline-flex items-center gap-2 text-sm text-white/80 hover:text-white font-semibold"
                        >
                            View all services <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {services.length === 0
                            ? Array.from({ length: 9 }).map((_, i) => (
                                  <div key={i} className="pmr-card rounded-2xl p-6 h-64 pmr-shimmer" />
                              ))
                            : services.map((svc, i) => {
                                  const Icon = ICONS[svc.icon] || Sparkles;
                                  return (
                                      <Link
                                          key={svc.id || svc.slug}
                                          to={`/services/${svc.slug}`}
                                          data-testid={`service-card-${svc.slug}`}
                                          className="group pmr-card rounded-2xl p-6 hover:-translate-y-1 hover:border-[#7957FF]/50 transition-all"
                                      >
                                          <div className="flex items-start justify-between">
                                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7957FF]/30 to-[#FF6B6B]/20 border border-white/10 flex items-center justify-center">
                                                  <Icon className="w-5 h-5 text-[#C6F36B]" />
                                              </div>
                                              <span className="font-mono text-xs text-white/40">
                                                  0{i + 1}
                                              </span>
                                          </div>
                                          <h3 className="mt-6 font-display font-bold text-xl">
                                              {svc.name}
                                          </h3>
                                          <p className="mt-2 text-sm text-white/60 leading-relaxed">
                                              {svc.description}
                                          </p>
                                          <div className="mt-6 flex items-center gap-2 text-sm text-[#53D8FB] font-semibold">
                                              Learn more
                                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                          </div>
                                      </Link>
                                  );
                              })}
                    </div>
                </div>
            </section>

            {/* METHODOLOGY */}
            <section className="bg-white py-20 lg:py-28" data-testid="methodology-section">
                <div className="max-w-7xl mx-auto px-5 lg:px-10">
                    <div className="text-center max-w-2xl mx-auto">
                        <div className="font-mono text-xs tracking-[0.3em] uppercase text-[#7957FF]">
                            / Our methodology
                        </div>
                        <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0B1020]">
                            A six-step growth engine
                        </h2>
                        <p className="mt-4 text-neutral-600">
                            Repeatable, measurable, and tuned for your business — not for an awards
                            reel.
                        </p>
                    </div>

                    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
                        {METHODOLOGY.map((step, i) => {
                            const Icon = step.icon;
                            return (
                                <div
                                    key={step.label}
                                    data-testid={`methodology-step-${i}`}
                                    className="relative rounded-2xl p-5 border border-neutral-200 bg-[#F8F8FC] hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all"
                                >
                                    <div className="font-mono text-xs text-neutral-400 mb-3">
                                        0{i + 1}
                                    </div>
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7957FF] to-[#FF6B6B] flex items-center justify-center text-white">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="mt-4 font-display font-bold text-lg text-[#0B1020]">
                                        {step.label}
                                    </div>
                                    <div className="mt-1 text-sm text-neutral-500 leading-relaxed">
                                        {step.desc}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* PORTFOLIO */}
            <section className="bg-[#F8F8FC] py-20 lg:py-28" data-testid="portfolio-section">
                <div className="max-w-7xl mx-auto px-5 lg:px-10">
                    <div className="flex flex-col lg:flex-row justify-between gap-6 mb-14">
                        <div>
                            <div className="font-mono text-xs tracking-[0.3em] uppercase text-[#7957FF]">
                                / Our work
                            </div>
                            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0B1020]">
                                Projects we're proud of.
                            </h2>
                        </div>
                        <Link
                            to="/work"
                            data-testid="portfolio-view-all"
                            className="self-start lg:self-end inline-flex items-center gap-2 text-sm text-[#0B1020] font-semibold"
                        >
                            View portfolio <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {portfolio.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-neutral-300 p-12 text-center bg-white">
                            <div className="font-display font-bold text-xl text-[#0B1020]">
                                Case studies coming soon
                            </div>
                            <p className="mt-2 text-neutral-500 max-w-md mx-auto">
                                We publish real, measurable work. Projects appear here once results
                                are approved by our clients.
                            </p>
                            <Link
                                to="/contact"
                                className="mt-6 inline-flex items-center gap-2 text-sm text-[#7957FF] font-semibold"
                                data-testid="portfolio-empty-cta"
                            >
                                Discuss your project <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {portfolio.slice(0, 6).map((p) => (
                                <div
                                    key={p.id}
                                    data-testid={`portfolio-item-${p.slug}`}
                                    className="group rounded-2xl bg-white overflow-hidden border border-neutral-200"
                                >
                                    {p.cover_image && (
                                        <div className="h-48 bg-neutral-100 overflow-hidden">
                                            <img
                                                src={p.cover_image}
                                                alt={p.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            />
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                                            {p.industry} · {p.category}
                                        </div>
                                        <h3 className="mt-2 font-display font-bold text-lg text-[#0B1020]">
                                            {p.title}
                                        </h3>
                                        <p className="mt-2 text-sm text-neutral-500 line-clamp-2">
                                            {p.challenge}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* INDUSTRIES */}
            <section className="bg-[#0B1020] text-white py-20 lg:py-28" data-testid="industries-section">
                <div className="max-w-7xl mx-auto px-5 lg:px-10">
                    <div className="font-mono text-xs tracking-[0.3em] uppercase text-[#53D8FB]">
                        / Industries we serve
                    </div>
                    <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                        Built for how your market actually buys.
                    </h2>

                    <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {INDUSTRIES.map((i) => {
                            const Icon = i.icon;
                            return (
                                <Link
                                    to="/industries"
                                    key={i.label}
                                    data-testid={`industry-${i.label.toLowerCase().replace(/\s+/g, "-")}`}
                                    className="group pmr-card rounded-2xl p-5 hover:border-[#7957FF]/50 hover:-translate-y-1 transition-all"
                                >
                                    <Icon className="w-6 h-6 text-[#C6F36B]" />
                                    <div className="mt-4 font-display font-semibold text-white">
                                        {i.label}
                                    </div>
                                    <div className="mt-1 text-xs text-white/50 font-mono">
                                        View playbook →
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* WHY PMR */}
            <section className="bg-white py-20 lg:py-28" data-testid="why-section">
                <div className="max-w-7xl mx-auto px-5 lg:px-10 grid lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-5">
                        <div className="font-mono text-xs tracking-[0.3em] uppercase text-[#7957FF]">
                            / Why PMR
                        </div>
                        <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0B1020]">
                            A partner, not just a vendor.
                        </h2>
                        <p className="mt-5 text-neutral-600 text-lg">
                            We lead with strategy, deliver with craft, and report with honesty. If
                            something isn't working, we say so and change the plan.
                        </p>
                    </div>
                    <div className="lg:col-span-7 grid sm:grid-cols-2 gap-5">
                        {WHY_PMR.map((w, i) => (
                            <div
                                key={w.title}
                                data-testid={`why-${i}`}
                                className="rounded-2xl bg-[#F8F8FC] p-6 border border-neutral-200"
                            >
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7957FF] to-[#FF6B6B] flex items-center justify-center text-white font-mono text-xs font-bold">
                                    0{i + 1}
                                </div>
                                <div className="mt-4 font-display font-bold text-[#0B1020]">
                                    {w.title}
                                </div>
                                <div className="mt-2 text-sm text-neutral-500 leading-relaxed">
                                    {w.desc}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            {testimonials.length > 0 && (
                <section className="bg-[#F8F8FC] py-20 lg:py-28" data-testid="testimonials-section">
                    <div className="max-w-7xl mx-auto px-5 lg:px-10">
                        <div className="font-mono text-xs tracking-[0.3em] uppercase text-[#7957FF] text-center">
                            / Voices
                        </div>
                        <h2 className="mt-4 text-center font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0B1020]">
                            What clients say.
                        </h2>
                        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {testimonials.map((t) => (
                                <div
                                    key={t.id}
                                    data-testid={`testimonial-${t.id}`}
                                    className="rounded-2xl p-6 bg-white border border-neutral-200"
                                >
                                    <MessageSquare className="w-6 h-6 text-[#7957FF]" />
                                    <p className="mt-4 text-[#0B1020] leading-relaxed">
                                        "{t.quote}"
                                    </p>
                                    <div className="mt-6 pt-4 border-t border-neutral-200">
                                        <div className="font-display font-bold text-[#0B1020]">
                                            {t.author}
                                        </div>
                                        <div className="text-sm text-neutral-500">
                                            {t.role}
                                            {t.company && `, ${t.company}`}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* INSIGHTS */}
            {blog.length > 0 && (
                <section className="bg-white py-20 lg:py-28" data-testid="insights-section">
                    <div className="max-w-7xl mx-auto px-5 lg:px-10">
                        <div className="flex justify-between gap-6 mb-10">
                            <div>
                                <div className="font-mono text-xs tracking-[0.3em] uppercase text-[#7957FF]">
                                    / Insights
                                </div>
                                <h2 className="mt-4 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0B1020]">
                                    Fresh perspectives.
                                </h2>
                            </div>
                            <Link
                                to="/insights"
                                className="self-end text-sm text-[#0B1020] font-semibold inline-flex items-center gap-2"
                            >
                                All articles <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {blog.map((p) => (
                                <Link
                                    to={`/insights/${p.slug}`}
                                    key={p.id}
                                    className="group rounded-2xl bg-[#F8F8FC] p-6 border border-neutral-200 hover:-translate-y-1 transition-all"
                                >
                                    <div className="text-xs font-mono text-neutral-400 uppercase">
                                        {p.category}
                                    </div>
                                    <h3 className="mt-3 font-display font-bold text-lg text-[#0B1020]">
                                        {p.title}
                                    </h3>
                                    <p className="mt-2 text-sm text-neutral-500 line-clamp-3">
                                        {p.excerpt}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* FINAL CTA */}
            <section className="relative overflow-hidden text-white py-20 lg:py-32 pmr-hero-gradient" data-testid="final-cta-section">
                <div className="absolute inset-0 pmr-grid-dots opacity-30" />
                <div className="relative max-w-5xl mx-auto px-5 lg:px-10 text-center">
                    <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
                        Let's build your <span className="pmr-gradient-text italic">next stage</span>{" "}
                        of growth.
                    </h2>
                    <p className="mt-6 text-white/70 text-lg max-w-2xl mx-auto">
                        Tell us about your business, your goals, and the challenges you want to
                        solve. We'll reply with a clear next step.
                    </p>
                    <div className="mt-10 flex flex-wrap justify-center gap-3">
                        <Link
                            to="/contact"
                            data-testid="final-cta-primary"
                            className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B6B] to-[#7957FF] hover:shadow-[0_0_40px_rgba(255,107,107,0.5)]"
                        >
                            Book a Strategy Call <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            to="/contact?intent=proposal"
                            data-testid="final-cta-secondary"
                            className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white border border-white/20 hover:border-white/50"
                        >
                            Request a Proposal
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
