import React from 'react'
import Banner from './Banner'
import ShopByCategory from './ShopByCategory'
import ShopByDepartment from './ShopByDepartment'
import HeroSection from './HeroSection'
import TrendingProducts from '../shop/TrendingProducts'
import DealsSection from './DealsSection'
import PromoBanner from './PromoBanner'
import Blogs from '../blogs/Blogs'

const Home = () => {
    return (
        <>
            <Banner />
            <PromoBanner />
            <ShopByCategory />
            <ShopByDepartment />
            <TrendingProducts />
            <DealsSection />
            <HeroSection />
            <Blogs />
        </>
    );
};

export default Home;
