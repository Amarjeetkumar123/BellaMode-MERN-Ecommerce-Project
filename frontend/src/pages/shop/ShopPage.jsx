import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import ShopFiltering from './ShopFiltering';
import { useGetProductsQuery, useGetProductFiltersQuery } from '../../redux/features/products/productsApi';
import { useGetCategoriesQuery } from '../../redux/features/categories/categoriesApi';
import { useActiveAudiences } from '../../hooks/useActiveAudiences';

const PAGE_SIZE = 12;

// Builds a windowed page list with gaps, e.g. [1, '…', 4, 5, 6, '…', 12].
const pageList = (current, totalPages) => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set([1, totalPages, current, current - 1, current + 1]);
    const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
    const out = [];
    sorted.forEach((p, i) => {
        if (i && p - sorted[i - 1] > 1) out.push('gap');
        out.push(p);
    });
    return out;
};

const ShopPage = () => {
    const { copy } = useActiveAudiences();
    const [filtersState, setFiltersState] = useState({ audience: '', category: '', color: '', priceRange: '' });
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    // Translate UI filter state into API query params.
    const queryParams = useMemo(() => {
        const params = { page, limit: PAGE_SIZE, sort };
        if (filtersState.audience) params.audience = filtersState.audience;
        if (filtersState.category) params.category = filtersState.category;
        if (filtersState.color) params.color = filtersState.color;
        if (filtersState.priceRange) {
            const [min, max] = filtersState.priceRange.split('-');
            if (min) params.minPrice = min;
            if (max) params.maxPrice = max;
        }
        return params;
    }, [filtersState, sort, page]);

    const { data, isLoading, isFetching } = useGetProductsQuery(queryParams);
    const { data: catData } = useGetCategoriesQuery(filtersState.audience ? { audience: filtersState.audience } : undefined);
    const { data: facetData } = useGetProductFiltersQuery(filtersState.audience ? { audience: filtersState.audience } : undefined);

    const products = data?.data?.products || [];
    const totalPages = data?.data?.totalPages || 1;
    const total = data?.data?.total || 0;
    const categories = catData?.data?.categories || [];
    const facets = facetData?.data || {};

    const clearFilters = () => {
        setFiltersState({ audience: '', category: '', color: '', priceRange: '' });
        setPage(1);
    };
    const onFilterChange = (next) => { setFiltersState(next); setPage(1); };

    // Jump back to the grid when paging, so the user isn't left mid-scroll.
    useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page]);

    return (
        <>
            <section className='page-head'>
                <div className='page-head__inner'>
                    <nav className='page-head__crumbs'>
                        <Link to='/'>Home</Link>
                        <span>/</span>
                        <span>Shop All</span>
                    </nav>
                    <h1 className='page-head__title'>Shop All</h1>
                    <p className='text-text-light text-sm mt-2 max-w-xl'>
                        The full collection for {copy} — clothing, footwear, watches &amp; accessories.
                    </p>
                </div>
            </section>

            {/* Sticky control surface — matches the department pages */}
            <div className='filter-bar'>
                <div className='filter-bar__inner'>
                    <button type='button' className='filters__toggle' onClick={() => setShowFilters((v) => !v)}>
                        <i className='ri-equalizer-line'></i> {showFilters ? 'Hide filters' : 'Filters'}
                    </button>
                    <span className='filter-bar__meta'>
                        {total} product{total === 1 ? '' : 's'}{isFetching ? ' …' : ''}
                    </span>
                    <div className='flex items-center gap-2'>
                        <span className='filter-bar__label'>Sort</span>
                        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} aria-label='Sort products'>
                            <option value='newest'>Newest</option>
                            <option value='price_asc'>Price: Low to High</option>
                            <option value='price_desc'>Price: High to Low</option>
                            <option value='rating'>Top Rated</option>
                        </select>
                    </div>
                </div>
            </div>

            <section className='section__container'>
                <div className='shop-layout'>
                    <ShopFiltering
                        categories={categories}
                        facets={facets}
                        filtersState={filtersState}
                        setFiltersState={onFilterChange}
                        clearFilters={clearFilters}
                        open={showFilters}
                    />

                    <div className='flex-1 min-w-0'>
                        {isLoading ? (
                            <p className='text-text-light'>Loading products…</p>
                        ) : products.length === 0 ? (
                            <div className='shop-empty'>
                                <i className='ri-search-line'></i>
                                <p className='font-medium text-text-dark'>No products match your filters</p>
                                <p className='text-sm mt-1 mb-5'>Try removing a filter to see more.</p>
                                <button onClick={clearFilters} className='btn !rounded-lg'>Clear all filters</button>
                            </div>
                        ) : (
                            <>
                                <ProductCard products={products} />

                                {totalPages > 1 && (
                                    <nav className='pager' aria-label='Pagination'>
                                        <button onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page === 1} aria-label='Previous page'>
                                            <i className='ri-arrow-left-s-line'></i>
                                        </button>
                                        {pageList(page, totalPages).map((p, i) => (
                                            p === 'gap'
                                                ? <span key={`gap-${i}`} className='pager__gap'>…</span>
                                                : (
                                                    <button key={p} onClick={() => setPage(p)}
                                                        aria-current={p === page ? 'page' : undefined}
                                                        className={p === page ? 'pager__page--on' : ''}>
                                                        {p}
                                                    </button>
                                                )
                                        ))}
                                        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages} aria-label='Next page'>
                                            <i className='ri-arrow-right-s-line'></i>
                                        </button>
                                    </nav>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
};

export default ShopPage;
