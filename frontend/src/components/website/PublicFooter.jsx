import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Linkedin, Facebook, MapPin, Mail, Phone } from "lucide-react";

const SERVICES = [
    { label: "SEO & Local SEO", href: "/services/seo" },
    { label: "Social Media", href: "/services/social-media-marketing" },
    { label: "Paid Advertising", href: "/services/paid-advertising" },
    { label: "Website Development", href: "/services/website-development" },
    { label: "Branding", href: "/services/branding" },
    { label: "Content Marketing", href: "/services/content-marketing" },
];

const INDUSTRIES = [
    { label: "E-commerce & D2C", href: "/industries" },
    { label: "Healthcare", href: "/industries" },
    { label: "Education", href: "/industries" },
    { label: "Real Estate", href: "/industries" },
    { label: "Startups & MSMEs", href: "/industries" },
];

export default function PublicFooter() {
    return (
        <footer
            className="relative overflow-hidden bg-[#0B1020] text-white border-t border-white/5"
            data-testid="public-footer"
        >
            <div className="absolute inset-0 pmr-grid-dots opacity-30" />
            <div className="relative max-w-7xl mx-auto px-5 lg:px-10 py-16 lg:py-24">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                    <div className="md:col-span-4">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7957FF] via-[#FF6B6B] to-[#53D8FB] flex items-center justify-center font-black text-sm">
                                PMR
                            </div>
                            <span className="font-display font-extrabold text-xl">
                                Digital Agency
                            </span>
                        </div>
                        <p className="text-white/60 text-sm leading-relaxed max-w-sm">
                            A full-service digital marketing agency in Hyderabad, India. We help
                            businesses build strong brands, reach the right audience, and turn
                            digital marketing into a measurable growth engine.
                        </p>

                        <div className="mt-6 space-y-2 text-sm text-white/60">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#53D8FB]" /> Hyderabad, Telangana,
                                India
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-[#53D8FB]" />{" "}
                                <a
                                    href="mailto:hello@pmratnam.com"
                                    className="hover:text-white"
                                    data-testid="footer-email"
                                >
                                    hello@pmratnam.com
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-[#53D8FB]" />{" "}
                                <span>Available on request</span>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            {[
                                {
                                    icon: Instagram,
                                    href: "https://www.instagram.com/pmrdigitalmarketingagency/",
                                    label: "Instagram",
                                },
                                {
                                    icon: Linkedin,
                                    href: "https://in.linkedin.com/company/pmr-digital-marketing-agency",
                                    label: "LinkedIn",
                                },
                                {
                                    icon: Facebook,
                                    href: "https://www.facebook.com/pmrdigitalmarketingagency/",
                                    label: "Facebook",
                                },
                            ].map(({ icon: Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    data-testid={`social-${label.toLowerCase()}`}
                                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:border-[#7957FF] hover:bg-[#7957FF]/10 transition-all"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <h4 className="font-display font-bold text-sm uppercase tracking-widest text-[#53D8FB] mb-4">
                            Services
                        </h4>
                        <ul className="space-y-2">
                            {SERVICES.map((s) => (
                                <li key={s.href}>
                                    <Link
                                        to={s.href}
                                        className="text-sm text-white/60 hover:text-white"
                                    >
                                        {s.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="md:col-span-2">
                        <h4 className="font-display font-bold text-sm uppercase tracking-widest text-[#53D8FB] mb-4">
                            Industries
                        </h4>
                        <ul className="space-y-2">
                            {INDUSTRIES.map((s) => (
                                <li key={s.label}>
                                    <Link
                                        to={s.href}
                                        className="text-sm text-white/60 hover:text-white"
                                    >
                                        {s.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="md:col-span-2">
                        <h4 className="font-display font-bold text-sm uppercase tracking-widest text-[#53D8FB] mb-4">
                            Company
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/about" className="text-sm text-white/60 hover:text-white">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link to="/work" className="text-sm text-white/60 hover:text-white">
                                    Our Work
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/insights"
                                    className="text-sm text-white/60 hover:text-white"
                                >
                                    Insights
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contact"
                                    className="text-sm text-white/60 hover:text-white"
                                >
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="text-sm text-white/60 hover:text-white">
                                    Client Login
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="md:col-span-2">
                        <h4 className="font-display font-bold text-sm uppercase tracking-widest text-[#53D8FB] mb-4">
                            Legal
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/privacy-policy"
                                    className="text-sm text-white/60 hover:text-white"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/terms-and-conditions"
                                    className="text-sm text-white/60 hover:text-white"
                                >
                                    Terms & Conditions
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-14 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <p className="text-xs text-white/40 font-mono">
                        © {new Date().getFullYear()} PMR Digital Marketing Agency. All rights
                        reserved.
                    </p>
                    <p className="text-xs text-white/40 font-mono">
                        pmratnam.com · Built with strategy, creativity & data.
                    </p>
                </div>
            </div>
        </footer>
    );
}
