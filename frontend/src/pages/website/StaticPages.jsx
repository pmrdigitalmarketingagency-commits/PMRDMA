import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function AboutPage() {
    useEffect(() => { document.title = "About — PMR"; }, []);
    return (
        <div data-testid="about-page">
            <section className="relative overflow-hidden pmr-hero-gradient text-white py-20 lg:py-28">
                <div className="absolute inset-0 pmr-grid-dots opacity-20" />
                <div className="relative max-w-7xl mx-auto px-5 lg:px-10 grid lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-7">
                        <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#C6F36B]">/ About PMR</div>
                        <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
                            Strategy, creativity & <span className="pmr-gradient-text italic">measurable growth.</span>
                        </h1>
                        <p className="mt-6 text-white/70 text-lg leading-relaxed max-w-2xl">
                            PMR is a Hyderabad-based digital marketing agency helping ambitious businesses build strong brands,
                            reach the right audience, and turn marketing into a measurable growth engine.
                        </p>
                    </div>
                </div>
            </section>
            <section className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-5 lg:px-10 grid lg:grid-cols-2 gap-10">
                    <div>
                        <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#7957FF]">/ Mission</div>
                        <h2 className="mt-3 font-display text-3xl font-extrabold text-[#0B1020]">Make growth marketing accessible to every ambitious business.</h2>
                    </div>
                    <div>
                        <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#7957FF]">/ Vision</div>
                        <h2 className="mt-3 font-display text-3xl font-extrabold text-[#0B1020]">To be the growth partner of record for the next 1,000 MSMEs and D2C brands in India.</h2>
                    </div>
                </div>
            </section>
            <section className="bg-[#F8F8FC] py-20">
                <div className="max-w-7xl mx-auto px-5 lg:px-10">
                    <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#7957FF]">/ Our values</div>
                    <h2 className="mt-3 font-display text-3xl font-extrabold text-[#0B1020]">What we live by.</h2>
                    <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            { t: "Strategy first", d: "Every decision maps to a documented strategy." },
                            { t: "Craft matters", d: "Design, writing & code we're proud to sign." },
                            { t: "Transparent", d: "Clear scopes, timelines, costs & deliverables." },
                            { t: "Outcome-driven", d: "We care about pipeline and revenue, not just reach." },
                        ].map((v, i) => (
                            <div key={v.t} className="rounded-2xl bg-white border border-neutral-200 p-6">
                                <div className="font-mono text-xs text-neutral-400">0{i+1}</div>
                                <div className="mt-3 font-display font-bold text-[#0B1020]">{v.t}</div>
                                <div className="mt-1 text-sm text-neutral-500">{v.d}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section className="bg-white py-20">
                <div className="max-w-5xl mx-auto px-5 lg:px-10 text-center">
                    <h2 className="font-display text-3xl lg:text-4xl font-extrabold text-[#0B1020]">Ready to work with us?</h2>
                    <Link to="/contact" className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B6B] to-[#7957FF]">
                        Book a Strategy Call <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}

export function PrivacyPage() {
    useEffect(() => { document.title = "Privacy Policy — PMR"; }, []);
    return (
        <div className="bg-white py-20" data-testid="privacy-page">
            <div className="max-w-3xl mx-auto px-5 lg:px-10 prose prose-neutral">
                <h1 className="font-display font-black">Privacy Policy</h1>
                <p className="text-neutral-500">Last updated: {new Date().toLocaleDateString()}</p>
                <p>This privacy policy template describes how PMR Digital Marketing Agency ("PMR", "we", "us") handles data submitted through pmratnam.com. Please review and finalize with your legal counsel before publication.</p>
                <h2>Information we collect</h2>
                <p>We collect information you voluntarily provide through contact and lead forms, including name, email, phone, company, and project details.</p>
                <h2>How we use information</h2>
                <p>We use this information to respond to enquiries, provide proposals, and operate our client relationships.</p>
                <h2>Data sharing</h2>
                <p>We do not sell personal data. We may share limited information with service providers who help us operate the business, under confidentiality obligations.</p>
                <h2>Contact</h2>
                <p>Questions: hello@pmratnam.com</p>
                <p className="text-xs text-neutral-400 mt-10">Template content for business/legal review before publication.</p>
            </div>
        </div>
    );
}

export function TermsPage() {
    useEffect(() => { document.title = "Terms & Conditions — PMR"; }, []);
    return (
        <div className="bg-white py-20" data-testid="terms-page">
            <div className="max-w-3xl mx-auto px-5 lg:px-10 prose prose-neutral">
                <h1 className="font-display font-black">Terms & Conditions</h1>
                <p className="text-neutral-500">Last updated: {new Date().toLocaleDateString()}</p>
                <p>These terms govern your use of pmratnam.com. This is a template — please finalize with your legal counsel.</p>
                <h2>Use of site</h2>
                <p>Content is provided for informational purposes only. All trademarks and content remain the property of their respective owners.</p>
                <h2>Engagements</h2>
                <p>Specific project engagements are governed by a separately signed Statement of Work.</p>
                <p className="text-xs text-neutral-400 mt-10">Template content for business/legal review before publication.</p>
            </div>
        </div>
    );
}

export function NotFoundPage() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center text-center px-5" data-testid="not-found-page">
            <div>
                <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#7957FF]">404</div>
                <h1 className="mt-3 font-display text-4xl font-black text-[#0B1020]">Lost in the funnel.</h1>
                <p className="mt-4 text-neutral-500">The page you're looking for doesn't exist.</p>
                <Link to="/" className="mt-6 inline-flex items-center gap-2 text-[#7957FF] font-semibold">Back to home <ArrowRight className="w-4 h-4" /></Link>
            </div>
        </div>
    );
}

export function UnauthorizedPage() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center text-center px-5" data-testid="unauthorized-page">
            <div>
                <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#FF6B6B]">403</div>
                <h1 className="mt-3 font-display text-4xl font-black text-[#0B1020]">You don't have access.</h1>
                <p className="mt-4 text-neutral-500">Your role doesn't permit this view. Contact your administrator.</p>
                <Link to="/" className="mt-6 inline-flex items-center gap-2 text-[#7957FF] font-semibold">Back to home</Link>
            </div>
        </div>
    );
}
