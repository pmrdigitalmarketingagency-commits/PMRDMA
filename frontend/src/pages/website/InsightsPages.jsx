import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import { ArrowRight, Search } from "lucide-react";

export function InsightsListPage() {
    const [posts, setPosts] = useState([]);
    const [q, setQ] = useState("");

    useEffect(() => {
        document.title = "Insights — PMR";
        api.get("/public/blog").then((r) => setPosts(r.data)).catch(() => {});
    }, []);

    const filtered = posts.filter((p) =>
        !q || p.title.toLowerCase().includes(q.toLowerCase()) || (p.excerpt || "").toLowerCase().includes(q.toLowerCase())
    );

    return (
        <div data-testid="insights-page">
            <section className="relative overflow-hidden pmr-hero-gradient text-white py-20 lg:py-28">
                <div className="absolute inset-0 pmr-grid-dots opacity-20" />
                <div className="relative max-w-7xl mx-auto px-5 lg:px-10">
                    <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#C6F36B]">/ Insights</div>
                    <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
                        Fresh thinking on marketing & growth.
                    </h1>
                    <div className="mt-10 max-w-lg relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                        <input
                            data-testid="blog-search"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search articles…"
                            className="w-full rounded-full bg-white/5 border border-white/15 pl-11 pr-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#53D8FB]"
                        />
                    </div>
                </div>
            </section>
            <section className="bg-[#F8F8FC] py-16">
                <div className="max-w-7xl mx-auto px-5 lg:px-10">
                    {filtered.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-neutral-300 p-16 text-center bg-white">
                            <div className="font-display font-bold text-2xl text-[#0B1020]">Articles coming soon</div>
                            <p className="mt-3 text-neutral-500">Our editors are preparing in-depth growth playbooks. Check back shortly.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map((p) => (
                                <Link to={`/insights/${p.slug}`} key={p.id} data-testid={`blog-card-${p.slug}`}
                                    className="rounded-2xl bg-white border border-neutral-200 overflow-hidden hover:-translate-y-1 transition-transform">
                                    {p.cover_image && <img src={p.cover_image} alt={p.title} className="h-48 w-full object-cover" />}
                                    <div className="p-6">
                                        <div className="text-xs font-mono text-neutral-400 uppercase">{p.category}</div>
                                        <h3 className="mt-2 font-display font-bold text-xl text-[#0B1020]">{p.title}</h3>
                                        <p className="mt-2 text-sm text-neutral-500 line-clamp-3">{p.excerpt}</p>
                                        <div className="mt-5 inline-flex items-center gap-2 text-[#7957FF] text-sm font-semibold">
                                            Read article <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export function InsightsDetailPage() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        api.get(`/public/blog/${slug}`)
            .then((r) => { setPost(r.data); document.title = `${r.data.title} — PMR`; })
            .catch(() => setNotFound(true));
    }, [slug]);

    if (notFound) {
        return (
            <section className="min-h-[50vh] flex items-center justify-center text-center">
                <div>
                    <h2 className="font-display text-2xl font-bold">Article not found</h2>
                    <Link to="/insights" className="mt-4 inline-flex text-[#7957FF] font-semibold">Back to insights</Link>
                </div>
            </section>
        );
    }
    if (!post) return <section className="min-h-[50vh] flex items-center justify-center text-neutral-400 font-mono">Loading…</section>;

    return (
        <article data-testid="blog-detail" className="bg-white">
            <section className="relative overflow-hidden pmr-hero-gradient text-white py-20">
                <div className="absolute inset-0 pmr-grid-dots opacity-20" />
                <div className="relative max-w-4xl mx-auto px-5 lg:px-10">
                    <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#C6F36B]">{post.category}</div>
                    <h1 className="mt-4 font-display text-4xl lg:text-5xl font-black tracking-tight">{post.title}</h1>
                    <p className="mt-5 text-white/70 text-lg">{post.excerpt}</p>
                </div>
            </section>
            <section className="py-16">
                <div className="max-w-3xl mx-auto px-5 lg:px-10 prose prose-neutral prose-lg">
                    <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br/>") }} />
                </div>
            </section>
        </article>
    );
}
