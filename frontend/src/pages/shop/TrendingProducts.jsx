import React, { useState } from 'react'
import ProductCard from './ProductCard'
import { useGetProductsQuery } from '../../redux/features/products/productsApi';

const TrendingProducts = () => {
    const [visible, setVisible] = useState(8);
    const { data, isLoading } = useGetProductsQuery({ trending: true, limit: 20 });
    const products = data?.data?.products || [];

    return (
        <section className='section__container'>
            <h2 className='section__header'>Trending Products</h2>
            <p className='section__subheader !mb-12'>Discover the hottest picks — trending styles for everyone.</p>

            {isLoading ? (
                <p>Loading…</p>
            ) : (
                <ProductCard products={products.slice(0, visible)} />
            )}

            <div className='product__btn'>
                {visible < products.length && (
                    <button className='btn' onClick={() => setVisible((c) => c + 4)}>Load More</button>
                )}
            </div>
        </section>
    );
};

export default TrendingProducts;
