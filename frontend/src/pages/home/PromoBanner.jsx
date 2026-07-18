import React from 'react'

const PERKS = [
    { icon: 'ri-truck-line', title: 'Free Delivery', text: 'On all orders over ₹999' },
    { icon: 'ri-arrow-go-back-line', title: 'Easy 30-Day Returns', text: 'Hassle-free & quick' },
    { icon: 'ri-secure-payment-line', title: 'Secure Payments', text: 'UPI, cards & wallets' },
    { icon: 'ri-customer-service-2-line', title: 'Dedicated Support', text: 'We’re here 7 days a week' },
];

const PromoBanner = () => {
    return (
        <section className='trust-strip'>
            <div className='trust-strip__inner'>
                {PERKS.map((perk) => (
                    <div key={perk.title} className='trust-item'>
                        <span className='trust-item__icon'><i className={perk.icon}></i></span>
                        <div>
                            <h4>{perk.title}</h4>
                            <p>{perk.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default PromoBanner;
