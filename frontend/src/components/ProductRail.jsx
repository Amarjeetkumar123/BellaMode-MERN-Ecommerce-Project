import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductCardItem } from '../pages/shop/ProductCard'

// Horizontal, scroll-snapped collection rail.
// Mobile relies on native swipe; the square arrow buttons appear from md up and
// disable themselves at either end so they never sit there doing nothing.
const ProductRail = ({ eyebrow, title, subtitle, viewAllTo, viewAllLabel = 'View all', products = [] }) => {
    const trackRef = useRef(null);
    const [atStart, setAtStart] = useState(true);
    const [atEnd, setAtEnd] = useState(false);

    const syncEdges = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        const max = el.scrollWidth - el.clientWidth;
        setAtStart(el.scrollLeft <= 1);
        setAtEnd(el.scrollLeft >= max - 1);
    }, []);

    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;
        syncEdges();
        el.addEventListener('scroll', syncEdges, { passive: true });
        window.addEventListener('resize', syncEdges);
        return () => {
            el.removeEventListener('scroll', syncEdges);
            window.removeEventListener('resize', syncEdges);
        };
    }, [syncEdges, products.length]);

    // Page by roughly one viewport of the track, so cards land on snap points.
    const page = (dir) => {
        const el = trackRef.current;
        if (!el) return;
        el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.9, 240), behavior: 'smooth' });
    };

    if (!products.length) return null;

    return (
        <section className='section__container'>
            <div className='section-head'>
                <div>
                    {eyebrow && <span className='eyebrow'>{eyebrow}</span>}
                    <h2>{title}</h2>
                    {subtitle && <p>{subtitle}</p>}
                </div>
                <div className='rail__actions'>
                    {viewAllTo && <Link to={viewAllTo} className='rail__viewall'>{viewAllLabel}</Link>}
                    <div className='rail__nav'>
                        <button type='button' onClick={() => page(-1)} disabled={atStart} aria-label='Scroll left'>
                            <i className='ri-arrow-left-s-line'></i>
                        </button>
                        <button type='button' onClick={() => page(1)} disabled={atEnd} aria-label='Scroll right'>
                            <i className='ri-arrow-right-s-line'></i>
                        </button>
                    </div>
                </div>
            </div>

            <div className='rail__track' ref={trackRef}>
                {products.map((product) => (
                    <div className='rail__item' key={product._id}>
                        <ProductCardItem product={product} />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ProductRail;
