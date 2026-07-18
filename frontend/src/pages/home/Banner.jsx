import React from 'react'
import { Link } from 'react-router-dom'
import bannerImg from "../../assets/header.png"
import { useGetBannersQuery } from '../../redux/features/banners/bannersApi'

const Banner = () => {
    const { data } = useGetBannersQuery({ position: 'hero' });
    const hero = data?.data?.banners?.[0];

    return (
        <div className='section__container header__container'>
            <div className='header__content z-30'>
                <h4 className='uppercase'>{hero?.subtitle || 'New season, new you'}</h4>
                <h1>{hero?.title || 'Style for Everyone'}</h1>
                <p>Discover the latest trends for men, women & kids. Explore a curated collection of
                    clothing, footwear and accessories for every taste and occasion.</p>
                <button className='btn'><Link to={hero?.link || "/shop"}>{hero?.ctaText || 'EXPLORE NOW'}</Link></button>
            </div>
            <div className='header__image'>
                <img src={hero?.image || bannerImg} alt='banner' />
            </div>
        </div>
    );
};

export default Banner;
