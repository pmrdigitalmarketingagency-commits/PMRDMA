import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api, formatApiError } from "../../lib/api";
import { toast } from "sonner";
import { CheckCircle2, ArrowRight, Mail, MapPin, Phone } from "lucide-react";

const SERVICES_LIST = [
    "SEO",
    "Social Media Marketing",
    "Paid Advertising",
    "Website Development",
    "Branding",
    "Content Marketing",
    "Video Production",
    "E-commerce Marketing",
    "Analytics & Automation",
];

const BUDGETS = [
    "< ₹50,000/mo",
    "₹50,000 – ₹1,50,000/mo",
    "₹1,50,000 – ₹5,00,000/mo",
    "> ₹5,00,000/mo",
    "One-time project",
];

export default function ContactPage() {
    const [params] = useSearchParams();
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        website: "",
        industry: "",
        services: [],
        budget: "",
        goals: "",
        preferred_contact: "email",
        message: params.get("intent") === "proposal" ? "I'd like a custom proposal for my business." : "",
        consent: false,
    });

    const toggleService = (s) =>
        setForm((f) => ({
            ...f,
            services: f.services.includes(s)
                ? f.services.filter((x) => x !== s)
                : [...f.services, s],
        }));

    const submit = async (e) => {
        e.preventDefault();
        if (!form.consent) {
            toast.error("Please accept the privacy consent to continue.");
            return;
        }
        setLoading(true);
        try {
            await api.post("/leads", { ...form, utm_source: params.get("utm_source") });
            setSubmitted(true);
            toast.success("Thanks! We'll be in touch within one business day.");
        } catch (e) {
            toast.error(formatApiError(e));
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <section className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-[#0B1020] to-[#140B33] text-white px-5 py-20">
                <div className="max-w-xl text-center" data-testid="contact-success">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C6F36B] to-[#53D8FB] mx-auto flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-[#0B1020]" />
                    </div>
                    <h1 className="mt-8 font-display text-4xl lg:text-5xl font-black">
                        Thanks for reaching out.
                    </h1>
                    <p className="mt-4 text-white/70 text-lg">
                        We'll review your details and reply within one business day with a next step.
                    </p>
                    <Link
                        to="/"
                        className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white border border-white/20 hover:border-white/50"
                        data-testid="contact-back-home"
                    >
                        Back to home <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="relative overflow-hidden text-white pmr-hero-gradient" data-testid="contact-page">
            <div className="absolute inset-0 pmr-grid-dots opacity-20" />
            <div className="relative max-w-7xl mx-auto px-5 lg:px-10 py-16 lg:py-24 grid lg:grid-cols-12 gap-12">
                <div className="lg:col-span-5">
                    <div className="font-mono text-xs tracking-[0.3em] uppercase text-[#C6F36B]">
                        / Let's talk
                    </div>
                    <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
                        Tell us about your business.
                    </h1>
                    <p className="mt-6 text-white/70 text-lg leading-relaxed">
                        Fill the form and we'll come back with a clear next step — a strategy call,
                        proposal, or roadmap tailored to your goals.
                    </p>

                    <div className="mt-10 space-y-4">
                        <div className="flex items-center gap-3 text-white/70">
                            <Mail className="w-4 h-4 text-[#53D8FB]" /> hello@pmratnam.com
                        </div>
                        <div className="flex items-center gap-3 text-white/70">
                            <MapPin className="w-4 h-4 text-[#53D8FB]" /> Hyderabad, Telangana, India
                        </div>
                        <div className="flex items-center gap-3 text-white/70">
                            <Phone className="w-4 h-4 text-[#53D8FB]" /> Available on request
                        </div>
                    </div>
                </div>

                <form
                    onSubmit={submit}
                    className="lg:col-span-7 pmr-card rounded-3xl p-6 lg:p-10"
                    data-testid="contact-form"
                >
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Full name *">
                            <input
                                data-testid="field-name"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Business email *">
                            <input
                                data-testid="field-email"
                                required
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Phone">
                            <input
                                data-testid="field-phone"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Company">
                            <input
                                data-testid="field-company"
                                value={form.company}
                                onChange={(e) => setForm({ ...form, company: e.target.value })}
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Website">
                            <input
                                data-testid="field-website"
                                value={form.website}
                                onChange={(e) => setForm({ ...form, website: e.target.value })}
                                placeholder="https://"
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Industry">
                            <input
                                data-testid="field-industry"
                                value={form.industry}
                                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                                className={inputCls}
                            />
                        </Field>
                    </div>

                    <div className="mt-6">
                        <Label>Services required</Label>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {SERVICES_LIST.map((s) => {
                                const active = form.services.includes(s);
                                return (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => toggleService(s)}
                                        data-testid={`service-chip-${s.toLowerCase().replace(/\s+/g, "-")}`}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                                            active
                                                ? "bg-gradient-to-r from-[#FF6B6B] to-[#7957FF] border-transparent text-white"
                                                : "bg-white/5 border-white/15 text-white/70 hover:bg-white/10"
                                        }`}
                                    >
                                        {s}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-6 grid sm:grid-cols-2 gap-4">
                        <Field label="Monthly marketing budget">
                            <select
                                data-testid="field-budget"
                                value={form.budget}
                                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                                className={inputCls}
                            >
                                <option value="">Select budget</option>
                                {BUDGETS.map((b) => (
                                    <option key={b} value={b}>
                                        {b}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Preferred contact">
                            <select
                                data-testid="field-preferred-contact"
                                value={form.preferred_contact}
                                onChange={(e) =>
                                    setForm({ ...form, preferred_contact: e.target.value })
                                }
                                className={inputCls}
                            >
                                <option value="email">Email</option>
                                <option value="phone">Phone</option>
                                <option value="whatsapp">WhatsApp</option>
                            </select>
                        </Field>
                    </div>

                    <div className="mt-6">
                        <Field label="Project goals">
                            <textarea
                                data-testid="field-goals"
                                rows={3}
                                value={form.goals}
                                onChange={(e) => setForm({ ...form, goals: e.target.value })}
                                className={inputCls}
                            />
                        </Field>
                    </div>

                    <div className="mt-4">
                        <Field label="Message">
                            <textarea
                                data-testid="field-message"
                                rows={3}
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                className={inputCls}
                            />
                        </Field>
                    </div>

                    <label className="mt-6 flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            data-testid="field-consent"
                            checked={form.consent}
                            onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                            className="mt-1 w-4 h-4 accent-[#7957FF]"
                        />
                        <span className="text-xs text-white/60">
                            I agree to be contacted by PMR Digital Marketing Agency about my
                            enquiry. I've read the{" "}
                            <Link to="/privacy-policy" className="text-[#53D8FB] underline">
                                privacy policy
                            </Link>
                            .
                        </span>
                    </label>

                    <button
                        type="submit"
                        disabled={loading}
                        data-testid="contact-submit"
                        className="mt-8 w-full group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B6B] to-[#7957FF] hover:shadow-[0_0_40px_rgba(255,107,107,0.5)] disabled:opacity-50"
                    >
                        {loading ? "Submitting…" : "Send my enquiry"}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>
            </div>
        </section>
    );
}

const inputCls =
    "w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#7957FF] focus:bg-white/10 transition-colors";

function Label({ children }) {
    return (
        <div className="font-mono text-xs uppercase tracking-widest text-white/60">
            {children}
        </div>
    );
}

function Field({ label, children }) {
    return (
        <label className="block">
            <Label>{label}</Label>
            <div className="mt-2">{children}</div>
        </label>
    );
}
