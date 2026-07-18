import React from 'react'
import { Link } from 'react-router-dom'
import { useGetBannersQuery } from '../../redux/features/banners/bannersApi'

// Editorial full-bleed hero. Uses the DB hero banner when present, else a fashion fallback.
const FALLBACK = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop';

const Banner = () => {
    const { data } = useGetBannersQuery({ position: 'hero' });
    const hero = data?.data?.banners?.[0];

    return (
        <section className='hero-full'>
            <img className='hero-full__img' src={hero?.image || FALLBACK} alt='' />
            <div className='hero-full__overlay' />
            <div className='hero-full__content'>
                <p className='hero-full__eyebrow'>{hero?.subtitle || 'New Season 2025'}</p>
                <h1 className='hero-full__title'>{hero?.title || 'The New Edit'}</h1>
                <p className='hero-full__sub'>Curated fashion for men, women, girls, boys & kids — discover the styles everyone is wearing this season.</p>
                <Link to={hero?.link || '/shop'} className='btn-dark'>{hero?.ctaText || 'Shop the Collection'}</Link>
            </div>
        </section>
    );
};

export default Banner;
