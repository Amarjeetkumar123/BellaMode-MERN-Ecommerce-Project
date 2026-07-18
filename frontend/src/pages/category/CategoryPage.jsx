import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductCard from '../shop/ProductCard';
import { useGetProductsQuery } from '../../redux/features/products/productsApi';
import { useGetCategoriesQuery } from '../../redux/features/categories/categoriesApi';
import { AUDIENCES, LIFESTYLE } from '../../data/catalog';

const AUDIENCE_KEYS = ['men', 'women', 'girls', 'boys', 'kids', 'unisex'];
const AUDIENCE_LABEL = { men: 'Men', women: 'Women', girls: 'Girls', boys: 'Boys', kids: 'Kids', unisex: 'Lifestyle' };

// Hero image per audience, drawn from the bundled AI studio shots.
const AUDIENCE_IMG = AUDIENCES.reduce((acc, a) => ({ ...acc, [a.key]: a.image }), {});
const LIFESTYLE_IMG = LIFESTYLE.reduce((acc, l) => ({ ...acc, [l.slug]: l.image }), {});

const CategoryPage = () => {
    const { categoryName } = useParams();
    const [sort, setSort] = useState('newest');

    const { data: catData } = useGetCategoriesQuery();
    const allCats = catData?.data?.categories || [];

    const lower = (categoryName || '').toLowerCase();
    const isAudience = AUDIENCE_KEYS.includes(lower);
    const activeCat = isAudience ? null : allCats.find((c) => c.slug === categoryName);
    const audience = isAudience ? lower : (activeCat?.audience || 'unisex');

    // Products: by category slug when a sub-category is active, else the whole department.
    const productParams = useMemo(() => {
        const p = { limit: 50, sort };
        if (activeCat) p.category = activeCat.slug;
        else if (!isAudience && categoryName) p.category = categoryName; // slug not yet loaded
        else p.audience = audience;
        return p;
    }, [activeCat, isAudience, categoryName, audience, sort]);

    const { data, isLoading, isFetching } = useGetProductsQuery(productParams);
    const products = data?.data?.products || [];
    const total = data?.data?.total ?? products.length;

    // Sub-category chips = this department's categories + shared lifestyle ones.
    const ownCats = audience === 'unisex' ? [] : allCats.filter((c) => c.audience === audience).sort((a, b) => a.sortOrder - b.sortOrder);
    const lifestyleCats = allCats.filter((c) => c.audience === 'unisex').sort((a, b) => a.sortOrder - b.sortOrder);

    const deptLabel = AUDIENCE_LABEL[audience] || 'Shop';
    const allTo = audience === 'unisex' ? '/shop' : `/categories/${audience}`;

    // Hero visuals
    const heroTitle = activeCat ? activeCat.name : deptLabel;
    const heroImg = activeCat
        ? (activeCat.image || LIFESTYLE_IMG[activeCat.slug])
        : AUDIENCE_IMG[audience];

    useEffect(() => { window.scrollTo(0, 0); }, [categoryName]);

    return (
        <>
            {/* Department hero */}
            <section className='cat-hero'>
                {heroImg && <img className='cat-hero__img' src={heroImg} alt={heroTitle} />}
                <div className='cat-hero__overlay' />
                <div className='cat-hero__content'>
                    <nav className='cat-hero__crumbs'>
                        <Link to='/'>Home</Link>
                        <span>/</span>
                        {activeCat
                            ? <><Link to={allTo} className='capitalize'>{deptLabel}</Link><span>/</span><span>{activeCat.name}</span></>
                            : <span>{deptLabel}</span>}
                    </nav>
                    <h1 className='cat-hero__title'>{heroTitle}</h1>
                    <p className='cat-hero__sub'>Curated {activeCat ? activeCat.name.toLowerCase() : deptLabel.toLowerCase()} — elevate your style today.</p>
                </div>
            </section>

            {/* Sub-category chip nav */}
            <div className='chip-nav'>
                <div className='chip-nav__inner'>
                    <Link to={allTo} className={`chip ${!activeCat ? 'chip--active' : ''}`}>All {deptLabel}</Link>
                    {ownCats.map((c) => (
                        <Link key={c._id} to={`/categories/${c.slug}`}
                            className={`chip ${activeCat?.slug === c.slug ? 'chip--active' : ''}`}>
                            {c.name}
                        </Link>
                    ))}
                    {ownCats.length > 0 && lifestyleCats.length > 0 && <span className='chip-divider' aria-hidden />}
                    {lifestyleCats.map((c) => (
                        <Link key={c._id} to={`/categories/${c.slug}`}
                            className={`chip chip--soft ${activeCat?.slug === c.slug ? 'chip--active' : ''}`}>
                            {c.name}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Products */}
            <section className='section__container !pt-8'>
                <div className='flex items-center justify-between flex-wrap gap-3 mb-6 border-b pb-3'>
                    <h3 className='text-sm text-text-light'>
                        <span className='font-semibold text-text-dark'>{total}</span> product{total === 1 ? '' : 's'}{isFetching ? ' …' : ''}
                    </h3>
                    <div className='flex items-center gap-2 text-sm'>
                        <span className='text-text-light'>Sort by</span>
                        <select value={sort} onChange={(e) => setSort(e.target.value)}
                            className='border rounded px-2 py-1.5 focus:outline-none'>
                            <option value='newest'>Newest</option>
                            <option value='price_asc'>Price: Low to High</option>
                            <option value='price_desc'>Price: High to Low</option>
                            <option value='rating'>Top Rated</option>
                        </select>
                    </div>
                </div>
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
