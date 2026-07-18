import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ProductCard from '../shop/ProductCard';
import { useGetProductsQuery } from '../../redux/features/products/productsApi';

const AUDIENCES = ['men', 'women', 'girls', 'boys', 'kids', 'unisex'];

const CategoryPage = () => {
    const { categoryName } = useParams();
    // The route param can be an audience (e.g. "men") or a category slug (e.g. "t-shirts-men").
    const isAudience = AUDIENCES.includes((categoryName || '').toLowerCase());
    const params = isAudience
        ? { audience: categoryName.toLowerCase(), limit: 50 }
        : { category: categoryName, limit: 50 };
    const { data, isLoading } = useGetProductsQuery(params);
    const products = data?.data?.products || [];

    useEffect(() => { window.scrollTo(0, 0); }, [categoryName]);

    return (
        <>
            <section className='section__container bg-primary-light'>
                <h2 className='section__header capitalize'>{categoryName?.replace(/-/g, ' ')}</h2>
                <p className='section__subheader'>Browse our curated collection. Elevate your style today!</p>
            </section>
            <div className='section__container'>
                {isLoading ? (
                    <p>Loading…</p>
                ) : products.length === 0 ? (
                    <p className='text-gray-500'>No products found in this category.</p>
                ) : (
                    <ProductCard products={products} />
                )}
            </div>
        </>
    );
};

export default CategoryPage;
