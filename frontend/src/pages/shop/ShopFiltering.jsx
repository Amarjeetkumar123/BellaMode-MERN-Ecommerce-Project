import React from 'react'
import { useActiveAudiences } from '../../hooks/useActiveAudiences';

const PRICE_RANGES = [
    { label: 'Under ₹1,000', value: '0-1000' },
    { label: '₹1,000 – ₹2,000', value: '1000-2000' },
    { label: '₹2,000 – ₹3,000', value: '2000-3000' },
    { label: '₹3,000 & above', value: '3000-' },
];

const AUDIENCE_LABEL = { men: 'Men', women: 'Women', kids: 'Kids', unisex: 'Lifestyle' };

// A single radio row — keeps every filter option visually identical.
const Opt = ({ name, checked, onChange, children }) => (
    <label className={`filter-opt ${checked ? 'filter-opt--on' : ''}`}>
        <input type='radio' name={name} checked={checked} onChange={onChange} />
        {children}
    </label>
);

// Fully dynamic filters — options come from the API (categories + product facets).
const ShopFiltering = ({ categories = [], facets = {}, filtersState, setFiltersState, clearFilters, open }) => {
    const set = (patch) => setFiltersState({ ...filtersState, ...patch });
    const { keys } = useActiveAudiences();
    // Active shopper audiences + unisex (lifestyle is common to all).
    const AUDIENCES = [...keys, 'unisex'];

    const hasFilters = filtersState.audience || filtersState.category || filtersState.color || filtersState.priceRange;

    return (
        <aside className='filters'>
            <div className={`filters__body ${open ? 'block' : 'hidden'}`}>
                <div className='filters__head'>
                    <h3>Filters</h3>
                    {hasFilters && (
                        <button type='button' onClick={clearFilters} className='filters__clear'>Clear all</button>
                    )}
                </div>

                {/* Audience */}
                <div className='filter-group'>
                    <div className='filter-group__title'>Shop for</div>
                    <Opt name='audience' checked={!filtersState.audience}
                        onChange={() => set({ audience: '', category: '' })}>Everyone</Opt>
                    {AUDIENCES.map((a) => (
                        <Opt key={a} name='audience' checked={filtersState.audience === a}
                            onChange={() => set({ audience: a, category: '' })}>
                            {AUDIENCE_LABEL[a] || a}
                        </Opt>
                    ))}
                </div>

                {/* Categories (dynamic) */}
                <div className='filter-group'>
                    <div className='filter-group__title'>Category</div>
                    <div className='filter-scroll'>
                        <Opt name='category' checked={!filtersState.category}
                            onChange={() => set({ category: '' })}>All categories</Opt>
                        {categories.map((c) => (
                            <Opt key={c._id} name='category' checked={filtersState.category === c.slug}
                                onChange={() => set({ category: c.slug })}>
                                <span>
                                    {c.name}
                                    {/* only worth showing the department when browsing across all of them */}
                                    {!filtersState.audience && <span className='filter-opt__tag'> · {AUDIENCE_LABEL[c.audience] || c.audience}</span>}
                                </span>
                            </Opt>
                        ))}
                    </div>
                </div>

                {/* Colors (dynamic facet) */}
                {facets.colors && facets.colors.length > 0 && (
                    <div className='filter-group'>
                        <div className='filter-group__title'>Colour</div>
                        <div className='filter-scroll'>
                            <Opt name='color' checked={!filtersState.color}
                                onChange={() => set({ color: '' })}>All colours</Opt>
                            {facets.colors.map((color) => (
                                <Opt key={color} name='color' checked={filtersState.color === color}
                                    onChange={() => set({ color })}>
                                    <span className='filter-swatch' style={{ background: color }} aria-hidden />
                                    {color}
                                </Opt>
                            ))}
                        </div>
                    </div>
                )}

                {/* Price */}
                <div className='filter-group'>
                    <div className='filter-group__title'>Price</div>
                    <Opt name='price' checked={!filtersState.priceRange}
                        onChange={() => set({ priceRange: '' })}>Any price</Opt>
                    {PRICE_RANGES.map((range) => (
                        <Opt key={range.value} name='price' checked={filtersState.priceRange === range.value}
                            onChange={() => set({ priceRange: range.value })}>
                            {range.label}
                        </Opt>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default ShopFiltering;
