import React from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../shop/ProductCard'
import { useGetProductsQuery } from '../../redux/features/products/productsApi'
import { useActiveAudiences } from '../../hooks/useActiveAudiences'

// Editor's Picks — featured products, scoped to the store's active audiences
// (lifestyle/unisex always eligible). Replaces the old placeholder "edit" cards.
const HeroSection = () => {
    const { keys } = useActiveAudiences();
    const { data, isLoading } = useGetProductsQuery({ featured: true, limit: 20 });
    const products = (data?.data?.products || [])
        .filter((p) => keys.includes(p.audience) || p.audience === 'unisex')
        .slice(0, 8);

    if (!isLoading && products.length === 0) return null;

    return (
        <section className='section__container'>
            <div className='section-head'>
                <div>
                    <h2>Editor's Picks</h2>
                    <p>Handpicked favourites from the new collection.</p>
                </div>
                <Link to='/shop'>View all</Link>
            </div>
            {isLoading ? <p className='px-4'>Loading…</p> : <ProductCard products={products} />}
        </section>
    );
};

export default HeroSection;
