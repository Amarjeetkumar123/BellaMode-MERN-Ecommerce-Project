import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ProductCardItem } from '../shop/ProductCard'
import { useGetProductsQuery } from '../../redux/features/products/productsApi'
import { useGetCategoriesQuery } from '../../redux/features/categories/categoriesApi'
import { useGetBlogsQuery } from '../../redux/features/blogs/blogsApi'
import { useActiveAudiences } from '../../hooks/useActiveAudiences'
import { STORE_HOME, PRICE_BANDS, PERKS, LIFESTYLE, inBand, listingLink } from '../../data/catalog'
import { formatINR } from '../../utils/formatCurrency'
import { slideTo } from '../../utils/slideTo'

const ALL_LABEL = { men: 'menswear', women: 'womenswear', kids: 'kidswear' };
const LIFESTYLE_IMG = Object.fromEntries(LIFESTYLE.map((l) => [l.slug, l.image]));
const canHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

// "a, b and c"
const listOf = (arr) => (arr.length < 2 ? arr.join('') : `${arr.slice(0, -1).join(', ')} and ${arr[arr.length - 1]}`);
// Sets --mx/--my on the hovered element (spotlight / bubble position).
const trackPointer = (e, el = e.currentTarget, x = '--mx', y = '--my') => {
    const r = e.currentTarget.getBoundingClientRect();
    el.style.setProperty(x, `${e.clientX - r.left}px`);
    el.style.setProperty(y, `${e.clientY - r.top}px`);
};

// Landing page for one store (men / women / kids). No visible section headings:
// tiles and tabs label themselves; screen readers still get an h2 per section.
const StoreHome = ({ store }) => {
    const cfg = STORE_HOME[store];
    const navigate = useNavigate();
    const { settings } = useActiveAudiences();

    const { data: ownData, isLoading } = useGetProductsQuery({ audience: store, limit: 50 });
    const { data: sharedData } = useGetProductsQuery({ audience: 'unisex', limit: 50 }, { skip: !cfg.lifestyle });
    const { data: catData } = useGetCategoriesQuery();
    const { data: blogData } = useGetBlogsQuery();

    const own = useMemo(() => ownData?.data?.products || [], [ownData]);
    const products = useMemo(() => [...own, ...(sharedData?.data?.products || [])], [own, sharedData]);
    const allCats = catData?.data?.categories || [];
    const catBySlug = Object.fromEntries(allCats.map((c) => [c.slug, c]));
    const cats = allCats
        .filter((c) => c.audience === store || (cfg.lifestyle && c.audience === 'unisex'))
        .sort((a, b) => (a.audience === 'unisex') - (b.audience === 'unisex') || a.sortOrder - b.sortOrder);

    // Lowest live price per category slug, for every "from ₹" label.
    const fromBySlug = {};
    products.forEach((p) => {
        const s = p.category?.slug;
        if (s && !(fromBySlug[s] <= p.price)) fromBySlug[s] = p.price;
    });
    const fromOf = (slugs) => Math.min(...slugs.map((s) => fromBySlug[s] ?? Infinity));

    // ---- hero: hovering a department wipes its photo in ----
    const depts = cfg.depts.map((d, i) => ({
        ...d,
        image: (i === 0 && settings?.audienceHeroImages?.[store]) || d.image || catBySlug[d.cats[0]]?.image || LIFESTYLE_IMG[d.cats[0]],
        from: fromOf(d.cats),
        // a department of this store's own categories lists the whole store; otherwise open its first category
        to: d.cats.length > 1 && d.cats.every((s) => s.endsWith(`-${store}`))
            ? listingLink(store)
            : listingLink(store, catBySlug[d.cats[0]] || { slug: d.cats[0], audience: d.cats[0].endsWith('-unisex') ? 'unisex' : store }),
    }));
    const [cur, setCur] = useState(0);
    const [prev, setPrev] = useState(-1);
    const show = (i) => { if (i !== cur) { setPrev(cur); setCur(i); } };
    useEffect(() => { setCur(0); setPrev(-1); }, [store]);
    const dept = depts[cur] || depts[0];
    const bubbleRef = useRef(null);

    // ---- product tabs: Trending / New in, then "more" after the price tiles ----
    const lists = useMemo(() => {
        const trending = products.filter((p) => p.isTrending).slice(0, 8);
        const rest = products.filter((p) => !trending.includes(p));
        const newIn = [...rest].sort((a, b) => (b.create_date || 0) - (a.create_date || 0)).slice(0, 8);
        const more = rest.filter((p) => !newIn.includes(p)).slice(0, 4);
        return { Trending: trending.length ? trending : newIn, 'New in': newIn, more };
    }, [products]);
    const [tab, setTab] = useState('Trending');
    const tabsRef = useRef(null);
    const tabInd = () => tabsRef.current?.querySelector('.wf-tab-ind');
    const tabEl = (name) => tabsRef.current?.querySelector(`[data-tab="${name}"]`);
    useLayoutEffect(() => {
        const sync = () => slideTo(tabInd(), tabEl(tab));
        sync();
        document.fonts?.ready.then(sync);
        window.addEventListener('resize', sync);
        return () => window.removeEventListener('resize', sync);
    }, [tab, isLoading]);

    // ---- price tiles: this store's own products, linking to the filtered shop ----
    const bands = PRICE_BANDS.map((b) => {
        const items = own.filter((p) => inBand(p.price, b.value));
        const names = [...new Set(items.map((p) => p.category?.name).filter(Boolean))].slice(0, 3);
        return { ...b, items, desc: listOf(names), images: [...new Set(items.map((p) => p.images?.[0]).filter(Boolean))].slice(0, 3) };
    }).filter((b) => b.items.length);

    const maxOff = Math.max(0, ...products.filter((p) => p.oldPrice > p.price).map((p) => Math.round((1 - p.price / p.oldPrice) * 100)));
    const ticker = [`Up to ${maxOff}% off`, 'No code needed', ...PERKS.map((p) => p.text)];
    const blogs = (blogData?.data?.blogs || []).slice(0, 3);
    const allTo = listingLink(store);

    // magnetic CTA: pulled up to 30% toward the pointer
    const magnet = (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .3}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`;
    };

    return (
        <main className='wf-home'>
            <section className='wf-hero' aria-label='Shop this store'>
                <div
                    className='wf-stage'
                    onPointerMove={(e) => trackPointer(e, bubbleRef.current, '--cx', '--cy')}
                    onClick={() => navigate(dept.to)}
                >
                    {depts.map((d, i) => (
                        <img key={d.name} src={d.image} alt={`${d.name}: ${d.desc}`} className={i === cur ? 'on' : i === prev ? 'was' : ''} />
                    ))}
                    <div className='wf-caption' key={cur} aria-live='polite'><b>{dept.name}</b><span>{dept.desc}</span></div>
                    <span className='wf-bubble' ref={bubbleRef} aria-hidden='true'>Shop now</span>
                </div>
                <div className='wf-panel'>
                    <div>
                        <p className='wf-kicker'>{cfg.kicker}</p>
                        <h1>{cfg.title}</h1>
                        <p className='wf-lead'>{cfg.lead}</p>
                    </div>
                    <ul className='wf-dlist'>
                        {depts.map((d, i) => (
                            <li key={d.name}>
                                <Link to={d.to} className={`wf-drow ${i === cur ? 'on' : ''}`} onPointerEnter={() => show(i)} onFocus={() => show(i)}>
                                    <b>{d.name}</b>
                                    <span>{Number.isFinite(d.from) ? `from ${formatINR(d.from)}` : 'Shop now'}<i className='ri-arrow-right-line'></i></span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <Link
                        to={dept.to}
                        className='wf-btn'
                        {...(canHover && { onPointerMove: magnet, onPointerLeave: (e) => { e.currentTarget.style.transform = ''; } })}
                    >
                        Shop {dept.name.toLowerCase()} <i className='ri-arrow-right-line'></i>
                    </Link>
                </div>
            </section>

            <div className='wf-wrap'>
                <div className='wf-perks'>
                    {PERKS.map((p) => <span key={p.text}><i className={p.icon}></i>{p.text}</span>)}
                </div>
            </div>

            {cats.length > 0 && (
                <section className='wf-block wf-wrap' aria-labelledby='wf-cat-h'>
                    <h2 className='wf-sr' id='wf-cat-h'>Categories</h2>
                    <div className='wf-cats'>
                        {cats.map((c) => (
                            <Link key={c._id} to={listingLink(store, c)} className='wf-cat'>
                                <div className='wf-cat__ph wf-glint'><img src={c.image || LIFESTYLE_IMG[c.slug]} alt='' loading='lazy' /></div>
                                <div className='wf-cat__name'>{c.name}<i className='ri-arrow-right-line'></i></div>
                                {fromBySlug[c.slug] != null && <small>from {formatINR(fromBySlug[c.slug])}</small>}
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <section className='wf-block wf-wrap' aria-labelledby='wf-pr-h'>
                <h2 className='wf-sr' id='wf-pr-h'>Products</h2>
                <div className='wf-bar'>
                    <div
                        className='wf-tabs'
                        role='tablist'
                        aria-label='Product lists'
                        ref={tabsRef}
                        onPointerLeave={() => slideTo(tabInd(), tabEl(tab))}
                    >
                        {['Trending', 'New in'].map((t) => (
                            <button
                                key={t}
                                type='button'
                                role='tab'
                                data-tab={t}
                                aria-selected={tab === t}
                                onClick={() => setTab(t)}
                                onPointerEnter={(e) => slideTo(tabInd(), e.currentTarget)}
                            >
                                {t}
                            </button>
                        ))}
                        <span className='wf-tab-ind' aria-hidden='true'></span>
                    </div>
                    <Link to={allTo} className='wf-u'>View all {ALL_LABEL[store]}</Link>
                </div>
                {isLoading
                    ? <p className='text-text-light'>Loading…</p>
                    : (
                        <div className='wf-grid' role='tabpanel' key={tab}>
                            {lists[tab].map((p, i) => <ProductCardItem key={p._id} product={p} index={i} />)}
                        </div>
                    )}
            </section>

            {bands.length > 0 && (
                <section className='wf-block wf-wrap' aria-labelledby='wf-bud-h'>
                    <h2 className='wf-sr' id='wf-bud-h'>Shop by budget</h2>
                    <div className='wf-budget' style={{ '--n': bands.length }}>
                        {bands.map((b) => (
                            <Link key={b.value} to={`${allTo}&priceRange=${b.value}`} className='wf-band' onPointerMove={trackPointer}>
                                <span className='wf-fan' aria-hidden='true'>{b.images.map((src) => <img key={src} src={src} alt='' loading='lazy' />)}</span>
                                <b>{b.label}</b>
                                <small>{b.desc}</small>
                                <span className='wf-band__cta'>Shop this range <i className='ri-arrow-right-line'></i></span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {lists.more.length > 0 && (
                <section className='wf-block wf-wrap' aria-labelledby='wf-more-h'>
                    <h2 className='wf-sr' id='wf-more-h'>More to explore</h2>
                    <div className='wf-grid'>
                        {lists.more.map((p, i) => <ProductCardItem key={p._id} product={p} index={i} />)}
                    </div>
                    <div className='wf-more'><Link to={allTo} className='wf-btn wf-btn--line'>View all {ALL_LABEL[store]} <i className='ri-arrow-right-line'></i></Link></div>
                </section>
            )}

            {maxOff > 0 && (
                <>
                    <div className='wf-ticker' aria-hidden='true'>
                        <div>{[...ticker, ...ticker].map((t, i) => <span key={i}>{t}</span>)}</div>
                    </div>
                    <Link to={`/sale?store=${store}`} className='wf-sale wf-wrap' aria-label={`Up to ${maxOff}% off. Shop the sale`}>
                        <span className='wf-sale__big'>Up to {maxOff}% off</span>
                        <p><b>Season sale.</b> Prices are already marked down, no code needed.</p>
                    </Link>
                </>
            )}

            {blogs.length > 0 && (
                <section className='wf-block wf-wrap' aria-labelledby='wf-j-h'>
                    <h2 className='wf-sr' id='wf-j-h'>From the journal</h2>
                    <div className='wf-journal'>
                        {blogs.map((b) => (
                            <article key={b._id} className='wf-post'>
                                <div className='wf-post__ph'><img src={b.image} alt='' loading='lazy' /></div>
                                {b.subtitle && <small>{b.subtitle}</small>}
                                <h3><span>{b.title}</span></h3>
                                <p>{b.content}</p>
                            </article>
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
};

export default StoreHome;
