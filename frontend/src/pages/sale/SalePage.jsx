import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ProductCard from '../shop/ProductCard'
import { useGetProductsQuery } from '../../redux/features/products/productsApi'
import { useActiveAudiences } from '../../hooks/useActiveAudiences'
import { PRICE_BANDS, PERKS, inBand } from '../../data/catalog'

const PAGE = 12;
const LABEL = { men: 'Men', women: 'Women', kids: 'Kids' };
const TIERS = [[0, 'All deals'], [25, '25% off or more'], [30, '30% off or more']];
const SIZE_ORDER = ['0-3M', '3-6M', '6-12M', '2-3Y', '4-5Y', '6-7Y', '8-9Y', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
const sizeRank = (s) => (SIZE_ORDER.includes(s) ? SIZE_ORDER.indexOf(s) : 100 + (parseFloat(s) || 0));
const offOf = (p) => Math.round((1 - p.price / p.oldPrice) * 100);
const toggle = (set, v) => { const n = new Set(set); n.has(v) ? n.delete(v) : n.add(v); return n; };

// Sale: its own page. Store switch in the hero, discount tiers, and a row of
// dropdown filters (category, size, price) instead of the listing's sidebar.
// ponytail: loads the whole sale (up to 200 items) once and filters in the browser;
// move tier/size filters to the API if the sale grows past that.
const SalePage = () => {
    const [sp] = useSearchParams();
    const { keys } = useActiveAudiences();
    const store = keys.includes(sp.get('store')) ? sp.get('store') : '';
    const { data, isLoading } = useGetProductsQuery({ sale: 'true', limit: 200, ...(store && { audience: store }) });
    const all = useMemo(() => (data?.data?.products || []).filter((p) => p.oldPrice > p.price), [data]);

    const [tier, setTier] = useState(0);
    const [cats, setCats] = useState(new Set());
    const [sizes, setSizes] = useState(new Set());
    const [price, setPrice] = useState('');
    const [sort, setSort] = useState('off');
    const [shown, setShown] = useState(PAGE);
    const [open, setOpen] = useState(null);
    const reset = () => { setTier(0); setCats(new Set()); setSizes(new Set()); setPrice(''); setShown(PAGE); };
    useEffect(reset, [store]);
    useEffect(() => { setShown(PAGE); }, [tier, cats, sizes, price, sort]);
    // a dropdown closes on outside click or Escape
    useEffect(() => {
        if (!open) return;
        const away = (e) => { if (!e.target.closest('.wf-dd')) setOpen(null); };
        const esc = (e) => { if (e.key === 'Escape') setOpen(null); };
        document.addEventListener('pointerdown', away);
        document.addEventListener('keydown', esc);
        return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', esc); };
    }, [open]);

    const catOpts = [...new Map(all.filter((p) => p.category).map((p) => [p.category.slug, p.category.name])).entries()];
    const sizeOpts = [...new Set(all.flatMap((p) => p.sizes || []))].sort((a, b) => sizeRank(a) - sizeRank(b));
    const list = all
        .filter((p) => offOf(p) >= tier
            && (!cats.size || cats.has(p.category?.slug))
            && (!sizes.size || (p.sizes || []).some((s) => sizes.has(s)))
            && (!price || inBand(p.price, price)))
        .sort({ off: (a, b) => offOf(b) - offOf(a), low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price }[sort]);
    const max = Math.max(0, ...all.map(offOf));
    const ticker = [`Up to ${max}% off`, 'No code needed', ...PERKS.map((p) => p.text)];
    const dirty = cats.size || sizes.size || price;

    const Dropdown = ({ id, label, count, children }) => (
        <div className='wf-dd'>
            <button type='button' className={count ? 'has' : ''} aria-expanded={open === id} onClick={() => setOpen(open === id ? null : id)}>
                {label}{count ? ` · ${count}` : ''} <i className='ri-arrow-down-s-line'></i>
            </button>
            {open === id && <div className='wf-dd__panel' role='group' aria-label={label}>{children}</div>}
        </div>
    );

    return (
        <main className='wf-page'>
            <section className='wf-sale-hero'>
                <div className='wf-wrap'>
                    <p className='wf-sale-hero__k'>Season sale · No code needed</p>
                    <h1>Up to {max}% off</h1>
                    <p>Prices are already marked down{store ? ` in ${LABEL[store]}` : ' across every store'}.</p>
                    <nav className='wf-sale-stores' aria-label='Shop the sale for'>
                        <Link to='/sale' aria-current={!store ? 'page' : undefined}>Everything</Link>
                        {keys.map((k) => <Link key={k} to={`/sale?store=${k}`} aria-current={store === k ? 'page' : undefined}>{LABEL[k]}</Link>)}
                    </nav>
                </div>
            </section>
            <div className='wf-ticker wf-ticker--ink' aria-hidden='true'>
                <div>{[...ticker, ...ticker].map((t, i) => <span key={i}>{t}</span>)}</div>
            </div>

            <div className='wf-wrap'>
                <div className='wf-tiers' aria-label='Discount'>
                    {TIERS.map(([t, l]) => (
                        <button key={t} type='button' className='wf-tier' aria-pressed={tier === t} onClick={() => setTier(t)}>
                            <b>{l}</b><small>{all.filter((p) => offOf(p) >= t).length} products</small>
                        </button>
                    ))}
                </div>

                <div className='wf-sale-bar'>
                    <Dropdown id='cat' label='Category' count={cats.size}>
                        {catOpts.map(([slug, name]) => <button key={slug} type='button' className='wf-tog' aria-pressed={cats.has(slug)} onClick={() => setCats(toggle(cats, slug))}>{name}</button>)}
                    </Dropdown>
                    <Dropdown id='size' label='Size' count={sizes.size}>
                        {sizeOpts.map((s) => <button key={s} type='button' className='wf-tog' aria-pressed={sizes.has(s)} onClick={() => setSizes(toggle(sizes, s))}>{s}</button>)}
                    </Dropdown>
                    <Dropdown id='price' label='Price' count={price ? 1 : 0}>
                        {PRICE_BANDS.map((b) => <button key={b.value} type='button' className='wf-tog' aria-pressed={price === b.value} onClick={() => setPrice(price === b.value ? '' : b.value)}>{b.label}</button>)}
                    </Dropdown>
                    {dirty ? <button type='button' className='wf-linkbtn wf-u' onClick={reset}>Clear</button> : null}
                    <span className='wf-count-t' style={{ marginLeft: 8 }} aria-live='polite'>{list.length} on sale</span>
                    <label className='wf-sort'><span>Sort by</span>
                        <select value={sort} onChange={(e) => setSort(e.target.value)}>
                            <option value='off'>Biggest discount</option>
                            <option value='low'>Price: low to high</option>
                            <option value='high'>Price: high to low</option>
                        </select>
                    </label>
                </div>

                <section className='wf-sale-list' aria-label='Sale products'>
                    {isLoading ? <p className='wf-muted'>Loading…</p> : list.length === 0 ? (
                        <p className='wf-empty'><b>No deals match</b>Try another size or price, or <button type='button' className='wf-linkbtn wf-u' onClick={reset}>clear the filters</button>.</p>
                    ) : (
                        <>
                            <ProductCard products={list.slice(0, shown)} />
                            <div className='wf-loadmore'>
                                <p>Showing {Math.min(shown, list.length)} of {list.length}</p>
                                <div className='wf-meter'><i style={{ width: `${(Math.min(shown, list.length) / list.length) * 100}%` }}></i></div>
                                {shown < list.length && <button type='button' className='wf-btn wf-btn--line' onClick={() => setShown((n) => n + PAGE)}>Load more</button>}
                            </div>
                        </>
                    )}
                </section>
            </div>
        </main>
    );
};

export default SalePage;
