import React from 'react'
import { Link } from 'react-router-dom'
import { useGetCategoriesQuery } from '../../redux/features/categories/categoriesApi'
import { useGetSettingsQuery } from '../../redux/features/settings/settingsApi'

// Tiles: five audiences + Footwear (a unisex category). Women is the wide featured tile.
const TILES = [
    { key: 'women', label: 'Women', to: '/categories/women', audience: 'women' },
    { key: 'men', label: 'Men', to: '/categories/men', audience: 'men' },
    { key: 'kids', label: 'Kids', to: '/categories/kids', audience: 'kids' },
    { key: 'girls', label: 'Girls', to: '/categories/girls', audience: 'girls' },
    { key: 'boys', label: 'Boys', to: '/categories/boys', audience: 'boys' },
    { key: 'footwear', label: 'Footwear', to: '/categories/footwear-unisex', categoryName: 'Footwear' },
];

const FALLBACK = {
    women: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=900&auto=format&fit=crop',
    men: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=900&auto=format&fit=crop',
    kids: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=900&auto=format&fit=crop',
    girls: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=900&auto=format&fit=crop',
    boys: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=900&auto=format&fit=crop',
    footwear: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=900&auto=format&fit=crop',
};

const ShopByCategory = () => {
    const { data } = useGetCategoriesQuery();
    const { data: settingsData } = useGetSettingsQuery();
    const categories = data?.data?.categories || [];
    const tileImages = settingsData?.data?.settings?.audienceImages || {};

    // Preference: admin-set image → a live catalog image → static fallback.
    const imageFor = (tile) => {
        if (tileImages[tile.key]) return tileImages[tile.key];
        const match = tile.categoryName
            ? categories.find((c) => c.name === tile.categoryName && c.image)
            : categories.find((c) => c.audience === tile.audience && c.image);
        return (match && match.image) || FALLBACK[tile.key];
    };

    return (
        <section className='section__container !pb-0'>
            <div className='section-head'>
                <div>
                    <h2>Shop by Category</h2>
                    <p>Fashion for everyone — find your fit.</p>
                </div>
                <Link to='/shop'>View all</Link>
            </div>
            <div className='cat-tiles'>
                {TILES.map((tile) => (
                    <Link key={tile.key} to={tile.to} className='cat-tile'>
                        <img src={imageFor(tile)} alt={tile.label} />
                        <div className='cat-tile__overlay'>
                            <span>WEARLY</span>
                            <h3>{tile.label}</h3>
                            <span>Shop now <i className='ri-arrow-right-line'></i></span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default ShopByCategory;
