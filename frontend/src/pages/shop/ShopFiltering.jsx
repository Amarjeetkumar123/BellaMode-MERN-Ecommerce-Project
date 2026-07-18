import React from 'react'
import { formatINR } from '../../utils/formatCurrency';

const AUDIENCES = ['men', 'women', 'girls', 'boys', 'kids', 'unisex'];

// Fully dynamic filters — options come from the API (categories + product facets).
const ShopFiltering = ({ categories = [], facets = {}, filtersState, setFiltersState, clearFilters }) => {
    const set = (patch) => setFiltersState({ ...filtersState, ...patch });
    const priceRanges = [
        { label: 'Under ₹1000', value: '0-1000' },
        { label: '₹1000 - ₹2000', value: '1000-2000' },
        { label: '₹2000 - ₹3000', value: '2000-3000' },
        { label: '₹3000 & above', value: '3000-' },
    ];

    return (
        <div className='space-y-5 flex-shrink-0 w-full md:w-56'>
            <h3 className='text-lg font-semibold'>Filters</h3>

            {/* Audience */}
            <div className='flex flex-col space-y-2'>
                <h3 className='font-medium'>Shop For</h3>
                <hr />
                <label className='capitalize cursor-pointer'>
                    <input type='radio' name='audience' checked={!filtersState.audience}
                        onChange={() => set({ audience: '', category: '' })} />
                    <span className='ml-1'>Everyone</span>
                </label>
                {AUDIENCES.map((a) => (
                    <label key={a} className='capitalize cursor-pointer'>
                        <input type='radio' name='audience' value={a}
                            checked={filtersState.audience === a}
                            onChange={(e) => set({ audience: e.target.value, category: '' })} />
                        <span className='ml-1'>{a}</span>
                    </label>
                ))}
            </div>

            {/* Categories (dynamic) */}
            <div className='flex flex-col space-y-2'>
                <h3 className='font-medium'>Categories</h3>
                <hr />
                <label className='capitalize cursor-pointer'>
                    <input type='radio' name='category' checked={!filtersState.category}
                        onChange={() => set({ category: '' })} />
                    <span className='ml-1'>All</span>
                </label>
                {categories.map((c) => (
                    <label key={c._id} className='capitalize cursor-pointer'>
                        <input type='radio' name='category' value={c.slug}
                            checked={filtersState.category === c.slug}
                            onChange={(e) => set({ category: e.target.value })} />
                        <span className='ml-1'>{c.name} <em className='text-xs text-gray-400'>({c.audience})</em></span>
                    </label>
                ))}
            </div>

            {/* Colors (dynamic facet) */}
            {facets.colors && facets.colors.length > 0 && (
                <div className='flex flex-col space-y-2'>
                    <h3 className='font-medium'>Colors</h3>
                    <hr />
                    <label className='capitalize cursor-pointer'>
                        <input type='radio' name='color' checked={!filtersState.color}
                            onChange={() => set({ color: '' })} />
                        <span className='ml-1'>All</span>
                    </label>
                    {facets.colors.map((color) => (
                        <label key={color} className='capitalize cursor-pointer'>
                            <input type='radio' name='color' value={color}
                                checked={filtersState.color === color}
                                onChange={(e) => set({ color: e.target.value })} />
                            <span className='ml-1'>{color}</span>
                        </label>
                    ))}
                </div>
            )}

            {/* Price */}
            <div className='flex flex-col space-y-2'>
                <h3 className='font-medium'>Price Range</h3>
                <hr />
                <label className='cursor-pointer'>
                    <input type='radio' name='price' checked={!filtersState.priceRange}
                        onChange={() => set({ priceRange: '' })} />
                    <span className='ml-1'>All</span>
                </label>
                {priceRanges.map((range) => (
                    <label key={range.value} className='cursor-pointer'>
                        <input type='radio' name='price' value={range.value}
                            checked={filtersState.priceRange === range.value}
                            onChange={(e) => set({ priceRange: e.target.value })} />
                        <span className='ml-1'>{range.label}</span>
                    </label>
                ))}
            </div>

            <button onClick={clearFilters} className='bg-primary py-1 px-4 text-white rounded'>Clear All Filters</button>
        </div>
    );
};

export default ShopFiltering;
