import { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductCard from '../shop/ProductCard'
import NotFound from '../NotFound'
import { useGetBlogQuery, useGetBlogsQuery } from '../../redux/features/blogs/blogsApi'
import { useGetProductsQuery } from '../../redux/features/products/productsApi'
import { fmtDate } from '../../data/orders'

const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// /journal/:slug — a red bar tracks reading progress; the photo drifts as you scroll.
const JournalPost = () => {
    const { slug } = useParams();
    const { data, isLoading, isError } = useGetBlogQuery(slug);
    const { data: listData } = useGetBlogsQuery();
    // ponytail: "Shop the look" shows top-rated products; link posts to products when blogs get product refs
    const { data: lookData } = useGetProductsQuery({ sort: 'rating', limit: 3 });
    const bar = useRef(null);
    const img = useRef(null);
    const b = data?.data?.blog;

    useEffect(() => {
        window.scrollTo(0, 0);
        const onScroll = () => {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            bar.current?.style.setProperty('--p', h > 0 ? Math.min(1, window.scrollY / h) : 0);
            if (!reduce) img.current?.style.setProperty('--py', `${Math.min(window.scrollY, 600) * 0.08}px`);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [slug]);

    if (isLoading) return <main className='wf-wrap wf-pagehead'><p className='wf-muted'>Loading…</p></main>;
    if (isError || !b) return <NotFound />;

    const paras = (b.content || '').split(/\n+/).map((p) => p.trim()).filter(Boolean);
    const minutes = Math.max(1, Math.round((b.content || '').split(/\s+/).length / 200));
    const posts = listData?.data?.blogs || [];
    const i = posts.findIndex((p) => p.slug === slug);
    const prev = i > 0 ? posts[i - 1] : null;
    const next = i >= 0 && i < posts.length - 1 ? posts[i + 1] : null;
    const look = lookData?.data?.products || [];

    return (
        <main className='wf-page wf-article'>
            <div className='wf-progress' ref={bar} aria-hidden='true'></div>
            <div className='wf-wrap'>
                <header className='wf-article__head'>
                    <p className='wf-kick'>Journal{b.subtitle ? ` · ${b.subtitle}` : ''}</p>
                    <h1>{b.title}</h1>
                    <div className='wf-meta'>
                        {b.create_date && <span>{fmtDate(b.create_date, { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
                        <span>{minutes} min read</span>
                        <span>By {b.authorName || 'the Wearly Fashion team'}</span>
                    </div>
                </header>
                {b.image && <div className='wf-article__hero'><img ref={img} src={b.image} alt='' /></div>}
                <article className='wf-article__body'>
                    {paras.map((p, k) => <p key={k}>{p}</p>)}
                </article>
                {look.length > 0 && (
                    <section className='wf-look' aria-label='Shop the look'>
                        <div className='wf-rowhead'><p className='wf-sub'>Shop the look</p><Link to='/shop' className='wf-u'>Shop all</Link></div>
                        <ProductCard products={look} className='wf-grid--3' />
                    </section>
                )}
                {(prev || next) && (
                    <nav className='wf-pn' aria-label='More from the journal'>
                        {prev && <Link to={`/journal/${prev.slug}`} className='prev'><small><i className='ri-arrow-left-line'></i>Previous</small><b>{prev.title}</b></Link>}
                        {next && <Link to={`/journal/${next.slug}`}><small>Next<i className='ri-arrow-right-line'></i></small><b>{next.title}</b></Link>}
                    </nav>
                )}
                {!prev && !next && <div style={{ height: 88 }} />}
            </div>
        </main>
    );
};

export default JournalPost;
