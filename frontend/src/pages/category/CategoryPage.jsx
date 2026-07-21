import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import ProductCard from '../shop/ProductCard';
import ProductRail from '../../components/ProductRail';
import { useGetProductsQuery } from '../../redux/features/products/productsApi';
import { useGetCategoriesQuery } from '../../redux/features/categories/categoriesApi';
import { AUDIENCES, LIFESTYLE, AUDIENCE_THEME, DEFAULT_THEME } from '../../data/catalog';
import { useActiveAudiences } from '../../hooks/useActiveAudiences';

const AUDIENCE_KEYS = ['men', 'women', 'kids', 'unisex'];
const AUDIENCE_LABEL = { men: 'Men', women: 'Women', kids: 'Kids', unisex: 'Footwear & Lifestyle' };

// Hero image per audience, drawn from the bundled AI studio shots.
const AUDIENCE_IMG = AUDIENCES.reduce((acc, a) => ({ ...acc, [a.key]: a.image }), {});
const LIFESTYLE_IMG = LIFESTYLE.reduce((acc, l) => ({ ...acc, [l.slug]: l.image }), {});

const CategoryPage = () => {
    const { categoryName: routeCategory } = useParams();
    const navigate = useNavigate();
    const [sort, setSort] = useState('newest');
    // Lifestyle pages (Footwear, Watches, …) are shared across every audience,
    // so they get their own audience filter rather than being locked to unisex.
    const [audFilter, setAudFilter] = useState('all');

    const { data: catData } = useGetCategoriesQuery();
    const allCats = catData?.data?.categories || [];
    const { isActive, keys: activeKeys, settings } = useActiveAudiences();

    // There is no separate homepage: the root route renders the first active
    // department (Men by default), so `/` and `/categories/men` look the same.
    const isRoot = !routeCategory;
    const categoryName = routeCategory || activeKeys[0] || 'men';

    const lower = (categoryName || '').toLowerCase();
    const isAudience = AUDIENCE_KEYS.includes(lower);

    // Guard: a shopper-audience page that the store no longer serves → send to shop.
    // (unisex/lifestyle stays accessible for everyone.)
    useEffect(() => {
        if (isAudience && lower !== 'unisex' && !isActive(lower)) {
            navigate('/shop', { replace: true });
        }
    }, [lower, isAudience, isActive, navigate]);

    const activeCat = isAudience ? null : allCats.find((c) => c.slug === categoryName);
    const audience = isAudience ? lower : (activeCat?.audience || 'unisex');

    // A department landing page = a shopper audience (not a single sub-category).
    const isDept = isAudience && lower !== 'unisex';
    // A lifestyle page carries products for every audience, so it gets audience pills.
    const isLifestyle = audience === 'unisex';

    // Reset the audience pill whenever we navigate to a different category.
    useEffect(() => { setAudFilter('all'); }, [categoryName]);

    // Products: by category slug when a sub-category is active, else the whole department.
    const productParams = useMemo(() => {
        const p = { limit: 50, sort };
        if (activeCat) p.category = activeCat.slug;
        else if (!isAudience && categoryName) p.category = categoryName; // slug not yet loaded
        else p.audience = audience;
        // Narrow a shared lifestyle category down to one audience when a pill is picked.
        if (isLifestyle && audFilter !== 'all') p.audience = audFilter;
        return p;
    }, [activeCat, isAudience, categoryName, audience, sort, isLifestyle, audFilter]);

    const { data, isLoading, isFetching } = useGetProductsQuery(productParams);
    const products = data?.data?.products || [];
    const total = data?.data?.total ?? products.length;

    // Department landing rails — skipped entirely on sub-category pages.
    const { data: trendingData } = useGetProductsQuery(
        { trending: true, audience, limit: 12 },
        { skip: !isDept }
    );
    const { data: featuredData } = useGetProductsQuery(
        { featured: true, audience, limit: 12 },
        { skip: !isDept }
    );
    const trending = trendingData?.data?.products || [];
    const featured = featuredData?.data?.products || [];

    // Sub-category chips = this department's categories + shared lifestyle ones.
    const ownCats = audience === 'unisex' ? [] : allCats.filter((c) => c.audience === audience).sort((a, b) => a.sortOrder - b.sortOrder);
    const lifestyleCats = allCats.filter((c) => c.audience === 'unisex').sort((a, b) => a.sortOrder - b.sortOrder);
    // Siblings of the current sub-category, for lateral navigation.
    const siblingCats = activeCat
        ? allCats.filter((c) => c.audience === activeCat.audience).sort((a, b) => a.sortOrder - b.sortOrder)
        : [];

    const deptLabel = AUDIENCE_LABEL[audience] || 'Shop';
    const allTo = audience === 'unisex' ? '/shop' : `/categories/${audience}`;

    // Hero visuals. Departments use the admin-uploaded banner when one exists,
    // falling back to the bundled studio shot.
    const heroTitle = activeCat ? activeCat.name : deptLabel;
    const theme = AUDIENCE_THEME[audience] || {
        ...DEFAULT_THEME,
        eyebrow: `${deptLabel} · New Season`,
        headline: deptLabel,
    };
    const heroImg = activeCat
        ? (activeCat.image || LIFESTYLE_IMG[activeCat.slug])
        : (settings?.audienceHeroImages?.[audience] || AUDIENCE_IMG[audience]);

    useEffect(() => { window.scrollTo(0, 0); }, [categoryName]);

    return (
        <>
            {/* Departments get a full editorial hero; listing pages get a compact header. */}
            {isDept ? (
                <section className='dept-hero'>
                    {heroImg && <img className='dept-hero__img' src={heroImg} alt={heroTitle} />}
                    <div className='dept-hero__scrim' />
                    <div className='dept-hero__inner'>
                        <span className='eyebrow eyebrow--light'>{theme.eyebrow}</span>
                        <h1 className='dept-hero__title'>{theme.headline}</h1>
                        <p className='dept-hero__sub'>{theme.tagline}</p>
                        <a href='#dept-products' className='btn-ghost-light'>Shop {deptLabel}</a>
                    </div>
                </section>
            ) : (
                <section className='page-head'>
                    <div className='page-head__inner'>
                        <nav className='page-head__crumbs'>
                            <Link to='/'>{AUDIENCE_LABEL[activeKeys[0]] || 'Shop'}</Link>
                            <span>/</span>
                            {activeCat
                                ? <><Link to={allTo}>{deptLabel}</Link><span>/</span><span>{activeCat.name}</span></>
                                : <span>{deptLabel}</span>}
                        </nav>
                        <h1 className='page-head__title'>{heroTitle}</h1>
                    </div>
                </section>
            )}

            {/* Service promises — small, flat, adds retail credibility without noise. */}
            <div className='service-strip'>
                <div className='service-strip__inner'>
                    <span><i className='ri-truck-line'></i> Free shipping over ₹999</span>
                    <span><i className='ri-loop-left-line'></i> 30-day easy returns</span>
                    <span><i className='ri-shield-check-line'></i> 100% authentic</span>
                    <span><i className='ri-lock-line'></i> Secure checkout</span>
                </div>
            </div>

            {/* Department landing: shop-by-subcategory tiles */}
            {isDept && ownCats.length > 0 && (
                <section className='section__container'>
                    <div className='section-head'>
                        <div>
                            <span className='eyebrow'>Categories</span>
                            <h2>Shop {deptLabel}</h2>
                        </div>
                    </div>
                    <div className='subcat-row'>
                        {ownCats.map((c) => (
                            <Link key={c._id} to={`/categories/${c.slug}`} className='subcat'>
                                <div className='subcat__media'>
                                    {c.image && <img src={c.image} alt={c.name} loading='lazy' />}
                                </div>
                                <div className='subcat__name'>{c.name}</div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Department landing: curated rails (each renders nothing when empty) */}
            {isDept && (
                <>
                    <ProductRail
                        eyebrow='Popular right now'
                        title={`Trending in ${deptLabel}`}
                        viewAllTo={allTo}
                        products={trending}
                    />
                    {featured.length > 0 && (
                        <section className='edit-band'>
                            <div className='edit-band__inner'>
                                <span className='eyebrow eyebrow--light'>Curated</span>
                                <h2>The {deptLabel} Edit</h2>
                                <p>A tighter selection — the pieces our stylists keep coming back to.</p>
                            </div>
                        </section>
                    )}
                    <ProductRail
                        eyebrow='Stylist picks'
                        title={`Featured in ${deptLabel}`}
                        viewAllTo={allTo}
                        products={featured}
                    />
                </>
            )}

            {/* Sticky control surface: navigation chips + result count + sort */}
            <div className='filter-bar'>
                <div className='filter-bar__inner'>
                    <div className='filter-bar__group'>
                        {isLifestyle ? (
                            <>
                                <span className='filter-bar__label'>Shop for</span>
                                <button
                                    type='button'
                                    onClick={() => setAudFilter('all')}
                                    className={`aud-pill ${audFilter === 'all' ? 'aud-pill--active' : ''}`}
                                >
                                    Everyone
                                </button>
                                {activeKeys.map((k) => (
                                    <button
                                        key={k}
                                        type='button'
                                        onClick={() => setAudFilter(k)}
                                        className={`aud-pill ${audFilter === k ? 'aud-pill--active' : ''}`}
                                    >
                                        {AUDIENCE_LABEL[k] || k}
                                    </button>
                                ))}
                            </>
                        ) : activeCat ? (
                            <>
                                <Link to={allTo} className='aud-pill'>All {deptLabel}</Link>
                                {siblingCats.map((c) => (
                                    <Link key={c._id} to={`/categories/${c.slug}`}
                                        className={`aud-pill ${activeCat.slug === c.slug ? 'aud-pill--active' : ''}`}>
                                        {c.name}
                                    </Link>
                                ))}
                            </>
                        ) : (
                            <>
                                <span className='filter-bar__label'>Also shop</span>
                                {lifestyleCats.map((c) => (
                                    <Link key={c._id} to={`/categories/${c.slug}`} className='aud-pill'>{c.name}</Link>
                                ))}
                            </>
                        )}
                    </div>

                    <div className='flex items-center gap-3'>
                        <span className='filter-bar__meta'>
                            {total} product{total === 1 ? '' : 's'}{isFetching ? ' …' : ''}
                        </span>
                        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label='Sort products'>
                            <option value='newest'>Newest</option>
                            <option value='price_asc'>Price: Low to High</option>
                            <option value='price_desc'>Price: High to Low</option>
                            <option value='rating'>Top Rated</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Products */}
            <section id='dept-products' className='section__container !pt-10'>
                {isLoading ? (
                    <p>Loading…</p>
                ) : products.length === 0 ? (
                    <div className='text-center py-16 text-text-light'>
                        <i className='ri-shopping-bag-line text-4xl mb-3 block'></i>
                        No products found here yet. <Link to='/shop' className='text-primary font-medium'>Browse all products</Link>.
                    </div>
                ) : (
                    <ProductCard products={products} />
                )}
            </section>
        </>
    );
};

export default CategoryPage;
