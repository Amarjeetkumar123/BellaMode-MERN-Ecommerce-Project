import React from 'react'
import { Link } from 'react-router-dom'
import { heroCouple } from '../../assets/images'

// Full-bleed editorial hero — always the AI studio shot.
const Banner = () => {
    return (
        <section className='hero-full'>
            <img className='hero-full__img' src={heroCouple} alt='Wearly new season collection' />
            <div className='hero-full__overlay' />
            <div className='hero-full__content'>
                <p className='hero-full__eyebrow'>New Season · Autumn 2025</p>
                <h1 className='hero-full__title'>Wear the Confidence</h1>
                <p className='hero-full__sub'>
                    Elevated everyday fashion for men, women &amp; kids — clothing, footwear,
                    watches, perfumes and accessories, all in one place.
                </p>
                <div className='hero-full__ctas'>
                    <Link to='/shop' className='btn-dark'>Shop the Collection</Link>
                    <Link to='/categories/women' className='btn-ghost'>New Arrivals <i className='ri-arrow-right-line'></i></Link>
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
