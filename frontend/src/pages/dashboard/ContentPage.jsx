import React, { useEffect, useState } from "react";
import { api, formatApiError } from "../../lib/api";
import { toast } from "sonner";
import { Plus, X, FileText, Image as ImageIcon, Star } from "lucide-react";

export default function ContentPage() {
    const [tab, setTab] = useState("blog");
    useEffect(() => { document.title = "Content — PMR"; }, []);
    return (
        <div data-testid="content-page" className="space-y-6">
            <div>
                <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#53D8FB]">/ Content</div>
                <h1 className="mt-2 font-display text-3xl font-black">CMS workspace</h1>
                <p className="mt-2 text-white/60 text-sm">Blog articles, portfolio projects, testimonials.</p>
            </div>
            <div className="flex gap-2 border-b border-white/10">
                {[
                    { key: "blog", label: "Blog", icon: FileText },
                    { key: "portfolio", label: "Portfolio", icon: ImageIcon },
                    { key: "testimonials", label: "Testimonials", icon: Star },
                ].map((t) => {
                    const Icon = t.icon;
                    return (
                        <button key={t.key} onClick={() => setTab(t.key)} data-testid={`content-tab-${t.key}`}
                            className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                                tab === t.key ? "border-[#7957FF] text-white" : "border-transparent text-white/50 hover:text-white"
                            }`}>
                            <Icon className="w-4 h-4" /> {t.label}
                        </button>
                    );
                })}
            </div>
            {tab === "blog" && <BlogAdmin />}
            {tab === "portfolio" && <PortfolioAdmin />}
            {tab === "testimonials" && <TestimonialsAdmin />}
        </div>
    );
}

function BlogAdmin() {
    const [posts, setPosts] = useState([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "", category: "", status: "published", cover_image: "", tags: [], author: "PMR Team" });

    const load = () => api.get("/blog").then((r) => setPosts(r.data));
    useEffect(() => { load(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/blog", { ...form, tags: form.tags || [] });
            toast.success("Article published");
            setOpen(false);
            setForm({ title: "", slug: "", excerpt: "", content: "", category: "", status: "published", cover_image: "", tags: [], author: "PMR Team" });
            load();
        } catch (err) { toast.error(formatApiError(err)); }
    };

    const togglePublish = async (p) => {
        try {
            await api.patch(`/blog/${p.id}`, { ...p, status: p.status === "published" ? "draft" : "published" });
            load();
        } catch (err) { toast.error(formatApiError(err)); }
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={() => setOpen(true)} data-testid="new-blog-btn"
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B6B] to-[#7957FF]">
                    <Plus className="w-4 h-4" /> New article
                </button>
            </div>
            <div className="rounded-2xl bg-[#13192E] border border-white/5 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-white/5 text-left text-xs font-mono uppercase tracking-widest text-white/50">
                            <th className="px-5 py-3">Title</th>
                            <th className="px-5 py-3">Category</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.length === 0 ? (
                            <tr><td colSpan={4} className="px-5 py-10 text-center text-white/40">No articles yet. Publish your first growth playbook.</td></tr>
                        ) : posts.map((p) => (
                            <tr key={p.id} className="border-t border-white/5" data-testid={`blog-row-${p.id}`}>
                                <td className="px-5 py-3 font-semibold">{p.title}</td>
                                <td className="px-5 py-3 text-white/60">{p.category || "—"}</td>
                                <td className="px-5 py-3">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-mono uppercase border ${p.status === "published" ? "border-[#C6F36B]/30 text-[#C6F36B]" : "border-white/10 text-white/50"}`}>{p.status}</span>
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <button onClick={() => togglePublish(p)} className="text-xs text-[#53D8FB] hover:text-white">
                                        {p.status === "published" ? "Unpublish" : "Publish"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {open && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5" onClick={() => setOpen(false)}>
                    <form onSubmit={submit} onClick={(e) => e.stopPropagation()} data-testid="blog-modal"
                        className="w-full max-w-2xl bg-[#0E1428] rounded-2xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <div className="font-display font-bold text-xl">New article</div>
                            <button type="button" onClick={() => setOpen(false)}><X className="w-5 h-5 text-white/60" /></button>
                        </div>
                        <div className="space-y-4">
                            <Input label="Title *" required value={form.title} onChange={(v) => setForm({ ...form, title: v, slug: form.slug || v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g,"") })} tid="blog-title" />
                            <Input label="Slug *" required value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} tid="blog-slug" />
                            <Input label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
                            <Input label="Cover image URL" value={form.cover_image} onChange={(v) => setForm({ ...form, cover_image: v })} />
                            <Textarea label="Excerpt" rows={2} value={form.excerpt} onChange={(v) => setForm({ ...form, excerpt: v })} />
                            <Textarea label="Content *" required rows={8} value={form.content} onChange={(v) => setForm({ ...form, content: v })} tid="blog-content" />
                            <label className="block">
                                <div className="text-xs font-mono uppercase tracking-widest text-white/60">Status</div>
                                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-[#7957FF]">
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </label>
                        </div>
                        <button type="submit" data-testid="blog-submit"
                            className="mt-6 w-full rounded-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B6B] to-[#7957FF]">
                            Save article
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

function PortfolioAdmin() {
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ title: "", slug: "", industry: "", category: "SEO", cover_image: "", challenge: "", strategy: "", results: "", services: [], status: "published" });

    const load = () => api.get("/portfolio").then((r) => setItems(r.data));
    useEffect(() => { load(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/portfolio", form);
            toast.success("Portfolio item added");
            setOpen(false); load();
            setForm({ title: "", slug: "", industry: "", category: "SEO", cover_image: "", challenge: "", strategy: "", results: "", services: [], status: "published" });
        } catch (err) { toast.error(formatApiError(err)); }
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={() => setOpen(true)} data-testid="new-portfolio-btn"
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B6B] to-[#7957FF]">
                    <Plus className="w-4 h-4" /> New project
                </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.length === 0 ? <div className="col-span-full py-10 text-center text-white/40">No portfolio items yet.</div> :
                    items.map((p) => (
                        <div key={p.id} className="rounded-2xl bg-[#13192E] border border-white/5 p-5" data-testid={`portfolio-row-${p.id}`}>
                            <div className="text-xs font-mono text-white/40 uppercase">{p.industry} · {p.category}</div>
                            <div className="mt-2 font-display font-bold">{p.title}</div>
                            <div className="mt-2 text-xs text-white/60 line-clamp-2">{p.challenge}</div>
                        </div>
                    ))
                }
            </div>
            {open && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5" onClick={() => setOpen(false)}>
                    <form onSubmit={submit} onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-2xl bg-[#0E1428] rounded-2xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto" data-testid="portfolio-modal">
                        <div className="flex items-center justify-between mb-5">
                            <div className="font-display font-bold text-xl">New portfolio item</div>
                            <button type="button" onClick={() => setOpen(false)}><X className="w-5 h-5 text-white/60" /></button>
                        </div>
                        <div className="space-y-4">
                            <Input label="Title *" required value={form.title} onChange={(v) => setForm({ ...form, title: v, slug: form.slug || v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g,"") })} />
                            <Input label="Slug *" required value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
                            <Input label="Industry" value={form.industry} onChange={(v) => setForm({ ...form, industry: v })} />
                            <label className="block">
                                <div className="text-xs font-mono uppercase tracking-widest text-white/60">Category</div>
                                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-[#7957FF]">
                                    {["SEO","Paid Advertising","Social Media","Branding","Web Development","Content Marketing"].map((c) => <option key={c}>{c}</option>)}
                                </select>
                            </label>
                            <Input label="Cover image URL" value={form.cover_image} onChange={(v) => setForm({ ...form, cover_image: v })} />
                            <Textarea label="Challenge" rows={2} value={form.challenge} onChange={(v) => setForm({ ...form, challenge: v })} />
                            <Textarea label="Strategy" rows={2} value={form.strategy} onChange={(v) => setForm({ ...form, strategy: v })} />
                            <Textarea label="Results" rows={2} value={form.results} onChange={(v) => setForm({ ...form, results: v })} />
                        </div>
                        <button type="submit" className="mt-6 w-full rounded-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B6B] to-[#7957FF]">
                            Save project
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

function TestimonialsAdmin() {
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ author: "", company: "", role: "", quote: "", rating: 5, approved: true });

    const load = () => api.get("/testimonials").then((r) => setItems(r.data));
    useEffect(() => { load(); }, []);
    const submit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/testimonials", form);
            toast.success("Testimonial added");
            setOpen(false); load();
            setForm({ author: "", company: "", role: "", quote: "", rating: 5, approved: true });
        } catch (err) { toast.error(formatApiError(err)); }
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={() => setOpen(true)} data-testid="new-testimonial-btn"
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B6B] to-[#7957FF]">
                    <Plus className="w-4 h-4" /> New testimonial
                </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                {items.length === 0 ? <div className="col-span-full py-10 text-center text-white/40">No testimonials yet.</div> :
                    items.map((t) => (
                        <div key={t.id} className="rounded-2xl bg-[#13192E] border border-white/5 p-5" data-testid={`testimonial-row-${t.id}`}>
                            <div className="text-sm italic text-white/80">"{t.quote}"</div>
                            <div className="mt-3 text-xs">
                                <div className="font-semibold">{t.author}</div>
                                <div className="text-white/50">{t.role}, {t.company}</div>
                            </div>
                        </div>
                    ))
                }
            </div>
            {open && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5" onClick={() => setOpen(false)}>
                    <form onSubmit={submit} onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md bg-[#0E1428] rounded-2xl border border-white/10 p-6" data-testid="testimonial-modal">
                        <div className="flex items-center justify-between mb-5">
                            <div className="font-display font-bold text-xl">New testimonial</div>
                            <button type="button" onClick={() => setOpen(false)}><X className="w-5 h-5 text-white/60" /></button>
                        </div>
                        <div className="space-y-4">
                            <Input label="Author *" required value={form.author} onChange={(v) => setForm({ ...form, author: v })} />
                            <Input label="Role" value={form.role} onChange={(v) => setForm({ ...form, role: v })} />
                            <Input label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
                            <Textarea label="Quote *" required rows={4} value={form.quote} onChange={(v) => setForm({ ...form, quote: v })} />
                            <label className="flex items-center gap-2 text-sm text-white/70">
                                <input type="checkbox" checked={form.approved} onChange={(e) => setForm({ ...form, approved: e.target.checked })} className="accent-[#7957FF]" />
                                Approved for public display
                            </label>
                        </div>
                        <button type="submit" className="mt-6 w-full rounded-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B6B] to-[#7957FF]">
                            Save
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

function Input({ label, value, onChange, required, tid }) {
    return (
        <label className="block">
            <div className="text-xs font-mono uppercase tracking-widest text-white/60">{label}</div>
            <input required={required} value={value || ""} onChange={(e) => onChange(e.target.value)} data-testid={tid}
                className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-[#7957FF]" />
        </label>
    );
}
function Textarea({ label, value, onChange, required, rows, tid }) {
    return (
        <label className="block">
            <div className="text-xs font-mono uppercase tracking-widest text-white/60">{label}</div>
            <textarea required={required} rows={rows || 3} value={value || ""} onChange={(e) => onChange(e.target.value)} data-testid={tid}
                className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-[#7957FF]" />
        </label>
    );
}
