import React from 'react'
import { Link } from 'react-router-dom'
import { useGetSettingsQuery } from '../../redux/features/settings/settingsApi'
import { AUDIENCES } from '../../data/catalog'

// Five shopper audiences (Footwear lives in the "Shop by Department" strip below).
// Admin-uploaded tile images (settings.audienceImages) take priority over the
// bundled AI studio shots.
const ShopByCategory = () => {
    const { data: settingsData } = useGetSettingsQuery();
    const tileImages = settingsData?.data?.settings?.audienceImages || {};
    const imageFor = (tile) => tileImages[tile.key] || tile.image;

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
                {AUDIENCES.map((tile) => (
                    <Link
                        key={tile.key}
                        to={tile.to}
                        className={`cat-tile ${tile.feature ? 'cat-tile--feature' : ''}`}
                    >
                        <img src={imageFor(tile)} alt={tile.label} loading='lazy' />
                        <div className='cat-tile__overlay'>
                            <span className='cat-tile__brand'>WEARLY</span>
                            <h3>{tile.label}</h3>
                            <p className='cat-tile__blurb'>{tile.blurb}</p>
                            <span className='cat-tile__cta'>Shop now <i className='ri-arrow-right-line'></i></span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default ShopByCategory;
