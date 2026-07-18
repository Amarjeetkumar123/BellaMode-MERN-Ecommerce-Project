import React, { useMemo, useState } from 'react'
import ProductCard from './ProductCard';
import ShopFiltering from './ShopFiltering';
import { useGetProductsQuery, useGetProductFiltersQuery } from '../../redux/features/products/productsApi';
import { useGetCategoriesQuery } from '../../redux/features/categories/categoriesApi';

const PAGE_SIZE = 12;

const ShopPage = () => {
    const [filtersState, setFiltersState] = useState({ audience: '', category: '', color: '', priceRange: '' });
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);

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

    return (
        <>
            <section className='section__container bg-primary-light'>
                <h2 className='section__header capitalize'>Shop</h2>
                <p className='section__subheader'>Shop the latest styles for men, women & kids — curated for every occasion.</p>
            </section>
            <section className='section__container'>
                <div className='flex flex-col md:flex-row md:gap-12 gap-8'>
                    <ShopFiltering
                        categories={categories}
                        facets={facets}
                        filtersState={filtersState}
                        setFiltersState={onFilterChange}
                        clearFilters={clearFilters}
                    />
                    <div className='flex-1'>
                        <div className='flex items-center justify-between flex-wrap gap-3 mb-6 border-b pb-3'>
                            <h3 className='text-sm text-text-light'>
                                <span className='font-semibold text-text-dark'>{total}</span> product{total === 1 ? '' : 's'} found{isFetching ? ' …' : ''}
                            </h3>
                            <div className='flex items-center gap-2 text-sm'>
                                <span className='text-text-light'>Sort by</span>
                                <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
                                    className='border rounded px-2 py-1.5 focus:outline-none'>
                                    <option value='newest'>Newest</option>
                                    <option value='price_asc'>Price: Low to High</option>
                                    <option value='price_desc'>Price: High to Low</option>
                                    <option value='rating'>Top Rated</option>
                                </select>
                            </div>
                        </div>
                        {isLoading ? (
                            <p>Loading products…</p>
                        ) : products.length === 0 ? (
                            <p className='text-gray-500'>No products match your filters.</p>
                        ) : (
                            <>
                                <ProductCard products={products} />
                                {totalPages > 1 && (
                                    <div className='flex justify-center gap-2 mt-8'>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                            <button key={p} onClick={() => setPage(p)}
                                                className={`px-3 py-1 rounded ${p === page ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                                                {p}
                                            </button>
                                        ))}
                                    </div>
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
