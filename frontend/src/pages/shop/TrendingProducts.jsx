import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'
import { useGetProductsQuery } from '../../redux/features/products/productsApi';

const TrendingProducts = () => {
    const [visible, setVisible] = useState(8);
    const { data, isLoading } = useGetProductsQuery({ trending: true, limit: 20 });
    const products = data?.data?.products || [];

    return (
        <section className='section__container'>
            <div className='section-head'>
                <div>
                    <h2>Trending Now</h2>
                    <p>The hottest picks everyone's adding to cart.</p>
                </div>
                <Link to='/shop'>View all</Link>
            </div>

            {isLoading ? (
                <p className='px-4'>Loading…</p>
            ) : (
                <ProductCard products={products.slice(0, visible)} />
            )}

            <div className='product__btn mt-10'>
                {visible < products.length && (
                    <button className='btn' onClick={() => setVisible((c) => c + 4)}>Load More</button>
                )}
            </div>
        </section>
    );
};

export default TrendingProducts;
