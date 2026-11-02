import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductCardItem } from '../shop/ProductCard'
import { useGetProductsQuery } from '../../redux/features/products/productsApi'
import { useGetCategoriesQuery } from '../../redux/features/categories/categoriesApi'
import { useGetBlogsQuery } from '../../redux/features/blogs/blogsApi'
import { useActiveAudiences } from '../../hooks/useActiveAudiences'
import StoreHero from './StoreHero'
import { STORE_HOME, HERO_SLIDES, PRICE_BANDS, PERKS, LIFESTYLE, inBand, listingLink } from '../../data/catalog'
import { formatINR } from '../../utils/formatCurrency'
import { slideTo } from '../../utils/slideTo'

const ALL_LABEL = { men: 'menswear', women: 'womenswear', kids: 'kidswear' };
const LIFESTYLE_IMG = Object.fromEntries(LIFESTYLE.map((l) => [l.slug, l.image]));

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
    const { settings } = useActiveAudiences();

    const { data: ownData, isLoading } = useGetProductsQuery({ audience: store, limit: 50 });
    const { data: sharedData } = useGetProductsQuery({ audience: 'unisex', limit: 50 }, { skip: !cfg.lifestyle });
    const { data: catData } = useGetCategoriesQuery();
    const { data: blogData } = useGetBlogsQuery();

    const own = useMemo(() => ownData?.data?.products || [], [ownData]);
    const products = useMemo(() => [...own, ...(sharedData?.data?.products || [])], [own, sharedData]);
    const allCats = catData?.data?.categories || [];
    const cats = allCats
        .filter((c) => c.audience === store || (cfg.lifestyle && c.audience === 'unisex'))
        .sort((a, b) => (a.audience === 'unisex') - (b.audience === 'unisex') || a.sortOrder - b.sortOrder);

    // Lowest live price per category slug, for every "from ₹" label.
    const fromBySlug = {};
    products.forEach((p) => {
        const s = p.category?.slug;
        if (s && !(fromBySlug[s] <= p.price)) fromBySlug[s] = p.price;
    });

    // ---- hero: the store's own slides from Settings, else the built-in ones ----
    const ownSlides = settings?.heroSlides?.[store];
    const slides = useMemo(() => (ownSlides?.length ? ownSlides : HERO_SLIDES[store]), [ownSlides, store]);

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

    return (
        <main className='wf-home'>
            <h1 className='wf-sr'>{cfg.title}</h1>
            <div className='wf-wrap'>
                <StoreHero store={store} slides={slides} label={`${ALL_LABEL[store]} highlights`} />
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
                                <div className='wf-cat__ph'><img src={c.image || LIFESTYLE_IMG[c.slug]} alt='' loading='lazy' /></div>
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
                                <Link to={`/journal/${b.slug}`}>
                                    <div className='wf-post__ph'><img src={b.image} alt='' loading='lazy' /></div>
                                    {b.subtitle && <small>{b.subtitle}</small>}
                                    <h3><span>{b.title}</span></h3>
                                    <p>{b.content}</p>
                                </Link>
                            </article>
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
};

export default StoreHome;
