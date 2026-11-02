// Shared storefront catalog config — drives the navbar mega-menu, the home
// "Shop by Category" tiles and the "Shop by Department" lifestyle strip.
// Category slugs mirror the backend seed (slugify(`${name}-${audience}`)).
import {
    womenFashion, menFashion, saleFlatlay, boyFashion, girlFashion, heroCouple,
} from '../assets/images';

// Three shopper audiences — boys & girls both live under Kids.
// `image` is the AI studio shot used on the category hero.
export const AUDIENCES = [
    { key: 'men', label: 'Men', to: '/categories/men', image: menFashion, blurb: 'Shirts, tees, denim & jackets' },
    {
        key: 'women', label: 'Women', to: '/categories/women', image: womenFashion, feature: true,
        blurb: 'Dresses, tops, ethnic & more',
    },
    { key: 'kids', label: 'Kids', to: '/categories/kids', image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=900&auto=format&fit=crop', blurb: 'Boys & girls — everyday comfort' },
];

// Sub-categories shown per audience in the navbar mega-menu (labels only —
// the live category list on each page comes from the API).
export const AUDIENCE_SUBS = {
    men: ['T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Jackets', 'Hoodies'],
    women: ['Dresses', 'Tops', 'Kurtas & Suits', 'Sarees', 'Jeans', 'Skirts', 'Handbags'],
    kids: ['Kidswear', 'T-Shirts', 'Frocks', 'Dresses', 'Shorts', 'Nightwear', 'Rompers'],
};

// Cross-department "lifestyle" categories (unisex) — surfaced on every audience
// page and in the mega-menu so footwear, watches, perfumes & accessories are
// always one click away.
export const LIFESTYLE = [
    { key: 'footwear', label: 'Footwear', slug: 'footwear-unisex', icon: 'ri-footprint-fill', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop' },
    { key: 'watches', label: 'Watches', slug: 'watches-unisex', icon: 'ri-time-line', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop' },
    { key: 'perfumes', label: 'Perfumes', slug: 'perfumes-unisex', icon: 'ri-drop-line', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop' },
    { key: 'accessories', label: 'Accessories', slug: 'accessories-unisex', icon: 'ri-sparkling-line', image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?q=80&w=800&auto=format&fit=crop' },
    { key: 'bags', label: 'Bags', slug: 'bags-unisex', icon: 'ri-handbag-line', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop' },
    { key: 'sunglasses', label: 'Sunglasses', slug: 'sunglasses-unisex', icon: 'ri-sun-line', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop' },
    { key: 'caps', label: 'Caps & Hats', slug: 'caps-hats-unisex', icon: 'ri-t-shirt-2-line', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop' },
];

export const SALE_IMAGE = saleFlatlay;

// Canonical shopper-audience keys (order = display order).
export const ALL_AUDIENCE_KEYS = ['men', 'women', 'kids'];

// Footwear is promoted to a top-level department alongside the audiences.
// It's a shared unisex category whose products carry their own audience.
export const FOOTWEAR_DEPT = { key: 'footwear', label: 'Footwear', slug: 'footwear-unisex', to: '/categories/footwear-unisex' };

// Human-readable copy from a set of active audience keys, e.g.
// ['men'] -> "men"; ['men','women','kids'] -> "men, women & kids".
const COPY_LABEL = { men: 'men', women: 'women', kids: 'kids' };
export const audienceCopy = (keys = []) => {
    const arr = keys.map((k) => COPY_LABEL[k]).filter(Boolean);
    if (!arr.length) return 'everyone';
    if (arr.length === 1) return arr[0];
    return `${arr.slice(0, -1).join(', ')} & ${arr[arr.length - 1]}`;
};

// Per-audience hero branding used to re-skin the storefront to the selected audience.
export const AUDIENCE_THEME = {
    women: { eyebrow: 'Womenswear · New Season', headline: 'Effortless Elegance', tagline: 'Dresses, tops, ethnic wear & the season’s edit — curated for you.', cta: 'Shop Women', to: '/categories/women' },
    men: { eyebrow: 'Menswear · New Season', headline: 'Wear the Confidence', tagline: 'Shirts, tees, denim, jackets & more — modern menswear, refined.', cta: 'Shop Men', to: '/categories/men' },
    kids: { eyebrow: 'Kids · New Season', headline: 'Little Big Moments', tagline: 'Comfy, playful styles for boys & girls — made for every little adventure.', cta: 'Shop Kids', to: '/categories/kids' },
};

// Fallback branding for a multi-audience / full store.
export const DEFAULT_THEME = {
    eyebrow: 'New Season · Autumn 2025',
    headline: 'Wear the Confidence',
    tagline: 'Elevated everyday fashion — clothing, footwear, watches, perfumes & accessories, all in one place.',
    cta: 'Shop the Collection',
    to: '/shop',
};

// Store home pages (Men / Women / Kids). Men includes boys and Women includes girls,
// said in copy only; little kids have their own store.
// `lifestyle` pulls the shared unisex categories (footwear, watches…) into the store.
export const STORE_HOME = {
    men: { title: 'Menswear, refined for every day', lifestyle: true },
    women: { title: 'Effortless pieces for every occasion', lifestyle: true },
    kids: { title: 'Easy, comfy clothes for growing kids', lifestyle: false },
};

// Built-in hero slides, shown until an admin adds a store's own in Settings.
// layout: right = upright photo on the right, wide = full photo with text on the left,
// wide-right = full photo with text on the right. `pos` only matters for these built-ins.
const SALE_SLIDE = { image: saleFlatlay, layout: 'wide', pos: '78% 50%', cta: 'Shop the sale' };
const STREET_SLIDE = { image: heroCouple, layout: 'wide-right', pos: '18% 40%' };
export const HERO_SLIDES = {
    men: [
        { image: menFashion, layout: 'right', pos: '50% 14%', kicker: 'New collection', title: 'Dressed for the', script: 'weekend',
            text: 'Overshirts, cargo trousers and clean white trainers. Easy pieces that all work together.', cta: 'Shop new in', note: 'Less fuss, more style' },
        { ...STREET_SLIDE, kicker: 'The street edit', title: 'Built for the', script: 'city',
            text: 'Hoodies, utility jackets and relaxed denim in shades of concrete and coal.', cta: 'Shop streetwear' },
        { ...SALE_SLIDE, kicker: 'Sale', title: 'Up to 40% off', script: 'everything', text: 'Tees, trainers, caps and denim, while sizes last.', link: '/sale?store=men' },
    ],
    women: [
        { image: womenFashion, layout: 'right', pos: '50% 12%', kicker: 'New collection', title: 'Made to move', script: 'with you',
            text: 'Wide-leg trousers, one-shoulder tops and easy heels for long days and late plans.', cta: 'Shop new in', note: 'Wear what feels good' },
        { ...STREET_SLIDE, kicker: 'Matching sets', title: 'Two of a', script: 'kind',
            text: 'Co-ord hoodies, joggers and cargo pants to share or to steal.', cta: 'Shop co-ords' },
        { ...SALE_SLIDE, kicker: 'End of season', title: 'Up to 40% off', script: 'favourites', text: 'Dresses, denim, bags and trainers, while sizes last.', link: '/sale?store=women' },
    ],
    kids: [
        { image: boyFashion, layout: 'right', pos: '50% 10%', kicker: 'Back to school', title: 'Built for', script: 'play',
            text: 'Soft sweatshirts, tough cargo joggers and trainers that keep up at break time.', cta: 'Shop now', note: 'Made for muddy knees' },
        { image: girlFashion, layout: 'right', pos: '62% 10%', kicker: 'New in', title: 'Little looks,', script: 'big smiles',
            text: 'Slogan sweatshirts, stripes and leggings for every twirl and jump.', cta: 'Shop now' },
        { ...SALE_SLIDE, kicker: 'Sale', title: 'Up to 40% off', script: 'kidswear', text: 'School shoes, bags and everyday basics, in every size.', link: '/sale?store=kids' },
    ],
};

// Price bands shared by the store home tiles, the mega-menu and the shop filters.
export const PRICE_BANDS = [
    { label: 'Under ₹1,000', value: '0-1000' },
    { label: '₹1,000 to ₹2,000', value: '1000-2000' },
    { label: '₹2,000 to ₹3,000', value: '2000-3000' },
    { label: '₹3,000 and up', value: '3000-' },
];
export const inBand = (price, value) => {
    const [min, max] = value.split('-').map((n) => (n === '' ? undefined : Number(n)));
    return (min === undefined || price >= min) && (max === undefined || price <= max);
};

// Store-wide service promises (shown on the store home and in the sale ticker).
export const PERKS = [
    { icon: 'ri-truck-line', text: 'Free delivery above ₹999' },
    { icon: 'ri-hand-coin-line', text: 'Cash on delivery' },
    { icon: 'ri-loop-left-line', text: '30-day easy returns' },
    { icon: 'ri-shield-check-line', text: 'Secure UPI and card payments' },
];

// Listing URL for a store (+ optional category). `store` keeps the Men/Women/Kids context
// (breadcrumb, category strip). Shared unisex categories hold products for everyone, so
// they don't filter by audience; a store's own categories do.
export const listingLink = (store, cat) => {
    const p = new URLSearchParams();
    if (store) p.set('store', store);
    if (store && (!cat || cat.audience !== 'unisex')) p.set('audience', store);
    if (cat) p.set('category', cat.slug);
    return `/shop?${p}`;
};
