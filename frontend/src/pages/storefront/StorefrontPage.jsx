import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductCard from '../shop/ProductCard'
import { useGetProductsQuery } from '../../redux/features/products/productsApi'
import { useGetStorefrontQuery } from '../../redux/features/storefronts/storefrontApi'
import NotFound from '../NotFound'

const PAGE_SIZE = 12;

// Windowed page list with gaps, e.g. [1, '…', 4, 5, 6, '…', 12].
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

const StorefrontPage = ({ slug: slugOverride }) => {
    const { slug: slugParam } = useParams();
    const slug = slugOverride || slugParam;
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);

    const { data: sfData, isLoading: sfLoading, isError: sfError } = useGetStorefrontQuery(slug);
    const store = sfData?.data?.store;
    const settings = sfData?.data?.settings;

    const queryParams = useMemo(
        () => ({ store: slug, page, limit: PAGE_SIZE, sort }),
        [slug, page, sort]
    );
    const { data, isLoading, isFetching } = useGetProductsQuery(queryParams, { skip: !store });

    const products = data?.data?.products || [];
    const totalPages = data?.data?.totalPages || 1;
    const total = data?.data?.total || 0;

    useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page]);

    if (sfError) return <NotFound />;
    if (sfLoading) return <div className='section__container !py-20 text-text-light'>Loading store…</div>;

    const logo = settings?.logoUrl;

    return (
        <>
            {/* Store header */}
            <section className='page-head'>
                <div className='page-head__inner'>
                    <nav className='page-head__crumbs'>
                        <Link to='/'>Home</Link>
                        <span>/</span>
                        <span>Stores</span>
                        <span>/</span>
                        <span>{store?.name}</span>
                    </nav>
                    <div className='flex items-center gap-4 mt-1'>
                        {logo && (
                            <img src={logo} alt='' className='w-14 h-14 rounded-2xl object-cover border border-gray-100 bg-white' />
                        )}
                        <div>
                            <h1 className='page-head__title !mb-0'>{store?.name}</h1>
                            <p className='text-text-light text-sm mt-1'>
                                <i className='ri-verified-badge-fill text-green-600 mr-1'></i>
                                Official store on Wearly
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sort bar */}
            <div className='filter-bar'>
                <div className='filter-bar__inner'>
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
                {isLoading ? (
                    <p className='text-text-light'>Loading products…</p>
                ) : products.length === 0 ? (
                    <div className='shop-empty'>
                        <i className='ri-store-2-line'></i>
                        <p className='font-medium text-text-dark'>This store has no products yet</p>
                        <p className='text-sm mt-1 mb-5'>Check back soon.</p>
                        <Link to='/shop' className='btn !rounded-lg'>Browse the marketplace</Link>
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
            </section>
        </>
    );
};

export default StorefrontPage;
