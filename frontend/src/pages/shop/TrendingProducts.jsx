import React, { useState } from 'react'
import ProductCard from './productCard'
import products from '../../data/products.json'

const TrendingProducts = () => {
    const [visibleProducts, setVisibleProducts] = useState(8);
    const loadMoreProucts = () => {
        setVisibleProducts(prevCount => prevCount + 4);
    }
    return (
        <section className='section__container '>
            <h2 className='section__header'>Trending Products</h2>
            <p className='section__subheader !mb-12'>Discover the Hottest Picks: Elevate Your Style
                with Our Curated of Treding Women's Fashion Products.</p>

            {/* Products Card  */}
            <ProductCard products={products.slice(0, visibleProducts)} />

            {/* load more products button  */}
            <div className='product__btn'>
                {visibleProducts < products.length && (
                    <button className='btn' onClick={loadMoreProucts}>Load More</button>
                )}
            </div>
        </section>
    )
}

export default TrendingProducts