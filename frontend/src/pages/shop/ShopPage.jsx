import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ProductCard from './ProductCard'
import { useGetProductsQuery, useGetProductFiltersQuery } from '../../redux/features/products/productsApi'
import { useGetCategoriesQuery } from '../../redux/features/categories/categoriesApi'
import { useActiveAudiences } from '../../hooks/useActiveAudiences'
import { AUDIENCES, LIFESTYLE, PRICE_BANDS, STORE_HOME, listingLink } from '../../data/catalog'
import { SkeletonGrid } from '../../components/Loaders'

const PAGE = 12;
const SORTS = [['newest', 'Newest'], ['price_asc', 'Price: low to high'], ['price_desc', 'Price: high to low'], ['rating', 'Top rated']];
const LABEL = { men: 'Men', women: 'Women', kids: 'Kids', unisex: 'Lifestyle' };
const STORE_IMG = Object.fromEntries(AUDIENCES.map((a) => [a.key, a.image]));
const LIFESTYLE_IMG = Object.fromEntries(LIFESTYLE.map((l) => [l.slug, l.image]));
const tick = <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='#fff' strokeWidth='3.5' aria-hidden='true'><path d='m4 12 5 5L20 6' /></svg>;

// The product listing. Every filter lives in the URL (?store=men&audience=men&category=shirts-men
// &priceRange=0-1000&color=black,navy&sort=price_asc), so links, refresh and Back all keep it.
const ShopPage = () => {
    const [sp, setSp] = useSearchParams();
    const { keys, settings } = useActiveAudiences();
    const audience = sp.get('audience') || '';
    const category = sp.get('category') || '';
    const priceRange = sp.get('priceRange') || '';
    const colors = (sp.get('color') || '').split(',').filter(Boolean);
    const sort = SORTS.some(([v]) => v === sp.get('sort')) ? sp.get('sort') : 'newest';
    // the store you came from (Men / Women / Kids) frames the page
    const store = [sp.get('store'), audience].find((s) => keys.includes(s)) || '';

    const [limit, setLimit] = useState(PAGE);
    const [more, setMore] = useState(false); // fetching the next page, not new filters
    const [panel, setPanel] = useState(false);
    useEffect(() => { setLimit(PAGE); }, [sp]);
    useEffect(() => { window.scrollTo(0, 0); }, [store, category]);

    const set = (patch) => {
        const next = new URLSearchParams(sp);
        Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
        setSp(next, { replace: true });
    };

    const [min, max] = priceRange.split('-');
    const { data, isLoading, isFetching } = useGetProductsQuery({
        limit, sort,
        ...(audience && { audience }), ...(category && { category }),
        ...(min && { minPrice: min }), ...(max && { maxPrice: max }),
        ...(colors.length && { color: colors.join(',') }),
    });
    const products = data?.data?.products || [];
    useEffect(() => { if (!isFetching) setMore(false); }, [isFetching]);
    const refreshing = isFetching && !isLoading && !more;
    const total = data?.data?.total ?? 0;

    const { data: catData } = useGetCategoriesQuery();
    // a store's own categories first, the shared lifestyle ones after
    const cats = [...(catData?.data?.categories || [])].sort((a, b) => (a.audience === 'unisex') - (b.audience === 'unisex') || a.sortOrder - b.sortOrder);
    const current = cats.find((c) => c.slug === category);
    const { data: facetData } = useGetProductFiltersQuery(audience ? { audience } : undefined);
    const facetColors = facetData?.data?.colors || [];

    // categories that make sense for the chosen audience (its own + the shared lifestyle ones)
    const catOptions = cats.filter((c) => !audience || c.audience === audience || (c.audience === 'unisex' && audience !== 'kids'));
    const strip = store ? [
        ...cats.filter((c) => c.audience === store),
        ...(STORE_HOME[store]?.lifestyle ? cats.filter((c) => c.audience === 'unisex') : []),
    ] : [];

    const pickAudience = (a) => set({
        audience: a, store: keys.includes(a) ? a : '',
        // a store-specific category doesn't survive switching to another store
        category: current && current.audience !== 'unisex' && current.audience !== a ? '' : category,
    });
    const toggleColor = (c) => set({ color: (colors.includes(c) ? colors.filter((x) => x !== c) : [...colors, c]).join(',') });
    const band = PRICE_BANDS.find((b) => b.value === priceRange);
    const chips = [
        audience && { label: LABEL[audience], clear: () => pickAudience('') },
        current && { label: current.name, clear: () => set({ category: '' }) },
        band && { label: band.label, clear: () => set({ priceRange: '' }) },
        ...colors.map((c) => ({ label: c, clear: () => toggleColor(c) })),
    ].filter(Boolean);
    const title = [store && LABEL[store], current?.name].filter(Boolean).join(' ') || 'All products';

    return (
        <main className='wf-page'>
            <div className='wf-wrap wf-page-top'>
                <nav className='wf-crumbs' aria-label='Breadcrumb'>
                    <Link to='/' className='wf-u'>Home</Link><span>/</span>
                    {store && <><Link to={`/categories/${store}`} className='wf-u'>{LABEL[store]}</Link><span>/</span></>}
                    <span>{current?.name || (store ? 'All' : 'All products')}</span>
                </nav>
                <h1 className='wf-sr'>{title}</h1>
                {strip.length > 0 && (
                    <div className='wf-cat-strip' aria-label={`${LABEL[store]} categories`}>
                        <Link to={listingLink(store)} className='wf-cs' aria-current={!category}>
                            <span className='wf-cs__ph'><img src={settings?.heroSlides?.[store]?.[0]?.image || settings?.audienceHeroImages?.[store] || STORE_IMG[store]} alt='' /></span>All
                        </Link>
                        {strip.map((c) => (
                            <Link key={c._id} to={listingLink(store, c)} className='wf-cs' aria-current={c.slug === category}>
                                <span className='wf-cs__ph'><img src={c.image || LIFESTYLE_IMG[c.slug]} alt='' loading='lazy' /></span>{c.name}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <div className='wf-toolbar'>
                <div className='wf-wrap'>
                    <button type='button' className='wf-tool-btn' onClick={() => setPanel(true)}><i className='ri-equalizer-line'></i> Filters</button>
                    <span className='wf-count-t' aria-live='polite'>{total} product{total === 1 ? '' : 's'}{isFetching ? ' …' : ''}</span>
                    <div className='wf-chips'>
                        {chips.map((c) => (
                            <button key={c.label} type='button' className='wf-chip' onClick={c.clear} aria-label={`Remove filter ${c.label}`} style={{ textTransform: 'capitalize' }}>
                                {c.label}<i className='ri-close-line'></i>
                            </button>
                        ))}
                    </div>
                    <label className='wf-sort'><span>Sort by</span>
                        <select value={sort} onChange={(e) => set({ sort: e.target.value })}>
                            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                    </label>
                </div>
            </div>

            <div className='wf-wrap wf-shop'>
                <div className={`wf-scrim ${panel ? 'is-open' : ''}`} onClick={() => setPanel(false)} />
                <aside className={`wf-filters ${panel ? 'is-open' : ''}`} aria-label='Filters'>
                    <div className='wf-filters__head'>
                        <b>Filters</b>
                        {chips.length > 0 && <button type='button' className='wf-linkbtn wf-u' onClick={() => setSp({}, { replace: true })}>Clear all</button>}
                        <button type='button' className='wf-x' onClick={() => setPanel(false)} aria-label='Close filters'><i className='ri-close-line'></i></button>
                    </div>
                    <div className='wf-fgroup'>
                        <h3>Shop for</h3>
                        <div className='wf-pills'>
                            {['', ...keys, 'unisex'].map((a) => (
                                <button key={a || 'all'} type='button' aria-pressed={audience === a} onClick={() => pickAudience(a)}>{a ? LABEL[a] : 'All'}</button>
                            ))}
                        </div>
                    </div>
                    <div className='wf-fgroup'>
                        <h3>Category</h3>
                        <div className='wf-checks'>
                            {catOptions.map((c) => (
                                <label key={c._id} className='wf-check'>
                                    <input type='checkbox' checked={c.slug === category} onChange={() => set({ category: c.slug === category ? '' : c.slug })} />
                                    <span className='wf-box'>{tick}</span>{c.name}
                                    {!audience && <small>{LABEL[c.audience]}</small>}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className='wf-fgroup'>
                        <h3>Price</h3>
                        <div className='wf-checks'>
                            {PRICE_BANDS.map((b) => (
                                <label key={b.value} className='wf-check'>
                                    <input type='checkbox' checked={b.value === priceRange} onChange={() => set({ priceRange: b.value === priceRange ? '' : b.value })} />
                                    <span className='wf-box'>{tick}</span>{b.label}
                                </label>
                            ))}
                        </div>
                    </div>
                    {facetColors.length > 0 && (
                        <div className='wf-fgroup'>
                            <h3>Colour</h3>
                            <div className='wf-swatches'>
                                {facetColors.map((c) => (
                                    <button key={c} type='button' className='wf-sw' style={{ '--c': c }} title={c} aria-label={c} aria-pressed={colors.includes(c)} onClick={() => toggleColor(c)} />
                                ))}
                            </div>
                        </div>
                    )}
                </aside>

                <section aria-label='Products'>
                    {isLoading ? <SkeletonGrid count={9} className='wf-grid--3' /> : products.length === 0 && !refreshing ? (
                        <p className='wf-empty'><b>Nothing matches those filters</b>Try removing one, or <button type='button' className='wf-linkbtn wf-u' onClick={() => setSp({}, { replace: true })}>clear them all</button>.</p>
                    ) : (
                        <>
                            <ProductCard products={products} className={`wf-grid--3 ${refreshing ? 'wf-refreshing' : ''}`} />
                            <div className='wf-loadmore'>
                                <p>Showing {products.length} of {total}</p>
                                <div className='wf-meter'><i style={{ width: `${(products.length / (total || 1)) * 100}%` }}></i></div>
                                {products.length < total && (
                                    <button type='button' className='wf-btn wf-btn--line' onClick={() => { setMore(true); setLimit((l) => l + PAGE); }} disabled={isFetching}>
                                        {more ? <><span className='wf-ring wf-ring--sm'></span>Loading more</> : 'Load more'}
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </section>
            </div>
        </main>
    );
};

export default ShopPage;
