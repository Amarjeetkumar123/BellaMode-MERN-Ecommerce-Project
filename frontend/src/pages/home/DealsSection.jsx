import React from 'react'
import { Link } from 'react-router-dom'
import { saleFlatlay } from '../../assets/images'
import { useActiveAudiences } from '../../hooks/useActiveAudiences'
import { useReveal } from '../../hooks/useReveal'

const COUNTDOWN = [
    { value: '14', label: 'Days' },
    { value: '20', label: 'Hours' },
    { value: '15', label: 'Mins' },
    { value: '05', label: 'Secs' },
];

const DealsSection = () => {
    const { copy } = useActiveAudiences();
    const ref = useReveal();
    return (
        <section className='section__container'>
            <div ref={ref} className='reveal deal-band'>
                <div className='deal-band__media'>
                    <img src={saleFlatlay} alt='Season sale' />
                </div>
                <div className='deal-band__content'>
                    <span className='deal-band__badge'>Limited Time · Up to 50% Off</span>
                    <h4>Deals of the Month</h4>
                    <p>Curated clothing, footwear, watches, perfumes &amp; accessories for {copy} — handpicked to elevate your wardrobe for less.</p>
                    <div className='deal-band__timer'>
                        {COUNTDOWN.map((c) => (
                            <div key={c.label} className='deal-band__cell'>
                                <strong>{c.value}</strong>
                                <span>{c.label}</span>
                            </div>
                        ))}
                    </div>
                    <Link to='/shop' className='deal-band__cta'>Shop the Sale <i className='ri-arrow-right-line'></i></Link>
                </div>
            </div>
        </section>
    );
};

export default DealsSection;
