import React from 'react'
import { Link } from 'react-router-dom'
import { saleFlatlay } from '../../assets/images'

const COUNTDOWN = [
    { value: '14', label: 'Days' },
    { value: '20', label: 'Hours' },
    { value: '15', label: 'Mins' },
    { value: '05', label: 'Secs' },
];

const DealsSection = () => {
    return (
        <section className='section__container'>
            <div className='grid md:grid-cols-2 gap-8 items-center bg-primary-light rounded-2xl overflow-hidden'>
                <div className='relative h-64 md:h-full min-h-[320px]'>
                    <img src={saleFlatlay} alt='Season sale' className='absolute inset-0 h-full w-full object-cover' />
                    <span className='absolute top-4 left-4 bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-full tracking-wide'>
                        UP TO 50% OFF
                    </span>
                </div>
                <div className='p-8 md:p-12 max-w-xl'>
                    <h5 className='text-primary font-semibold mb-2 tracking-wide uppercase text-sm'>Get Up To 50% Discount</h5>
                    <h4 className='text-3xl md:text-4xl font-extrabold text-text-dark mb-3' style={{ fontFamily: 'var(--header-font)' }}>
                        Deals of the Month
                    </h4>
                    <p className='text-text-light mb-6'>
                        Curated clothing, footwear, watches, perfumes & accessories for men, women & kids —
                        all handpicked to elevate your wardrobe without breaking the bank.
                    </p>
                    <div className='flex flex-wrap items-center gap-3 mb-8'>
                        {COUNTDOWN.map((c) => (
                            <div key={c.label} className='h-20 w-20 grid place-content-center text-center bg-white rounded-full shadow-md'>
                                <span className='text-xl font-bold text-text-dark leading-none'>{c.value}</span>
                                <span className='text-xs font-medium text-text-light mt-1'>{c.label}</span>
                            </div>
                        ))}
                    </div>
                    <Link to='/shop' className='btn inline-block'>Shop the Sale</Link>
                </div>
            </div>
        </section>
    );
};

export default DealsSection;
