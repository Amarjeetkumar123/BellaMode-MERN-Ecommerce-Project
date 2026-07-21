import React from 'react'
import ProductRail from '../../components/ProductRail'
import { useGetProductsQuery } from '../../redux/features/products/productsApi';

const TrendingProducts = () => {
    const { data, isLoading } = useGetProductsQuery({ trending: true, limit: 20 });
    const products = data?.data?.products || [];

    if (isLoading) {
        return <section className='section__container'><p>Loading…</p></section>;
    }

    return (
        <ProductRail
            title='Trending Now'
            subtitle="The pieces everyone's adding to their bag."
            viewAllTo='/shop'
            products={products}
        />
    );
};

export default TrendingProducts;
