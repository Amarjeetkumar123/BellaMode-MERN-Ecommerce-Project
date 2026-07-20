import React from 'react'
import { Link } from 'react-router-dom'
import { useGetSettingsQuery } from '../../redux/features/settings/settingsApi'
import { AUDIENCES } from '../../data/catalog'
import { useActiveAudiences } from '../../hooks/useActiveAudiences'
import { useReveal } from '../../hooks/useReveal'

// Audience tiles, gated to the store's active audiences. The featured (tall)
// tile is dynamic so the grid stays balanced when audiences are reduced.
const ShopByCategory = () => {
    const { data: settingsData } = useGetSettingsQuery();
    const { isActive } = useActiveAudiences();
    const gridRef = useReveal();
    const tileImages = settingsData?.data?.settings?.audienceImages || {};
    const imageFor = (tile) => tileImages[tile.key] || tile.image;

    const tiles = AUDIENCES.filter((a) => isActive(a.key));
    if (!tiles.length) return null;
    // Feature the women tile if present, else the first active tile — but only
    // when there are enough tiles for a tall feature to look intentional.
    const featureKey = tiles.length > 2 ? (tiles.find((t) => t.feature)?.key || tiles[0].key) : null;

    return (
        <section className='section__container !pb-0'>
            <div className='section-head'>
                <div>
                    <h2>Shop by Category</h2>
                    <p>Fashion for everyone — find your fit.</p>
                </div>
                <Link to='/shop'>View all</Link>
            </div>
            <div className='cat-tiles stagger' ref={gridRef}>
                {tiles.map((tile) => (
                    <Link
                        key={tile.key}
                        to={tile.to}
                        className={`cat-tile ${tile.key === featureKey ? 'cat-tile--feature' : ''}`}
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
