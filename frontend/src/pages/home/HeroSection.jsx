import React from 'react'
import { Link } from 'react-router-dom'
import card1 from "../../assets/card-1.png"
import card2 from "../../assets/card-2.png"
import card3 from "../../assets/card-3.png"

const HeroSection = () => {
    const cards = [
        { id: 1, image: card1, title: "Men's Edit", trend: "Shop Men", to: "/categories/men" },
        { id: 2, image: card2, title: "Women's Edit", trend: "Shop Women", to: "/categories/women" },
        { id: 3, image: card3, title: "Kids' Edit", trend: "Shop Kids", to: "/categories/kids" },
    ];
    return (
        <section className='section__container'>
            <div className='section-head'>
                <div>
                    <h2>Style Edits</h2>
                    <p>Handpicked looks across every wardrobe.</p>
                </div>
            </div>
            <div className='hero__container'>
                {cards.map((card) => (
                    <div key={card.id} className='hero__card'>
                        <img src={card.image} alt={card.title} />
                        <div className='hero__content'>
                            <p>{card.trend}</p>
                            <h4>{card.title}</h4>
                            <Link to={card.to}>Discover More</Link>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default HeroSection;
