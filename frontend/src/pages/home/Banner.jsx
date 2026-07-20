import React from 'react'
import { Link } from 'react-router-dom'
import { useActiveAudiences } from '../../hooks/useActiveAudiences'

// Full-bleed editorial hero — re-skins to the store's active audience(s).
const Banner = () => {
    const { storeBranding } = useActiveAudiences();

    return (
        <section className='hero-full'>
            <img className='hero-full__img' src={storeBranding.image} alt='Wearly new season collection' />
            <div className='hero-full__overlay' />
            <div className='hero-full__content'>
                <p className='hero-full__eyebrow'>{storeBranding.eyebrow}</p>
                <h1 className='hero-full__title'>{storeBranding.headline}</h1>
                <p className='hero-full__sub'>{storeBranding.tagline}</p>
                <div className='hero-full__ctas'>
                    <Link to='/shop' className='btn-dark'>Shop the Collection</Link>
                    <Link to={storeBranding.ctaTo} className='btn-ghost'>{storeBranding.cta} <i className='ri-arrow-right-line'></i></Link>
                </div>
                <ul className='hero-full__trust'>
                    <li><i className='ri-truck-line'></i> Free shipping over ₹999</li>
                    <li><i className='ri-arrow-go-back-line'></i> 30-day returns</li>
                    <li><i className='ri-shield-check-line'></i> Secure checkout</li>
                </ul>
            </div>
        </section>
    );
};

export default Banner;
