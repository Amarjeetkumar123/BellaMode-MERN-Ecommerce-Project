import React from 'react'
import { Link } from 'react-router-dom'
import { LIFESTYLE } from '../../data/catalog'
import { useReveal } from '../../hooks/useReveal'

// Cross-department lifestyle categories — footwear, watches, perfumes, bags…
// Each links straight to that category's product listing.
const ShopByDepartment = () => {
    const ref = useReveal();
    return (
        <section className='section__container !pb-0'>
            <div className='section-head'>
                <div>
                    <h2>Complete Your Look</h2>
                    <p>Footwear, watches, perfumes & accessories for everyone.</p>
                </div>
                <Link to='/shop'>View all</Link>
            </div>
            <div className='dept-strip stagger' ref={ref}>
                {LIFESTYLE.map((d) => (
                    <Link key={d.key} to={`/categories/${d.slug}`} className='dept-card'>
                        <div className='dept-card__img'>
                            <img src={d.image} alt={d.label} loading='lazy' />
                        </div>
                        <span className='dept-card__label'>{d.label}</span>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default ShopByDepartment;
