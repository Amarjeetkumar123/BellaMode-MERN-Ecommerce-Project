// Shared storefront catalog config — drives the navbar mega-menu, the home
// "Shop by Category" tiles and the "Shop by Department" lifestyle strip.
// Category slugs mirror the backend seed (slugify(`${name}-${audience}`)).
import {
    womenFashion, menFashion, boyFashion, girlFashion, saleFlatlay,
} from '../assets/images';

// Five shopper audiences. `image` is the AI studio shot used on the home tiles
// and the category hero. `feature` makes the tile span two rows on desktop.
export const AUDIENCES = [
    {
        key: 'women', label: 'Women', to: '/categories/women', image: womenFashion, feature: true,
        blurb: 'Dresses, tops, ethnic & more',
    },
    { key: 'men', label: 'Men', to: '/categories/men', image: menFashion, blurb: 'Shirts, tees, denim & jackets' },
    // Kids tile uses a distinct bright kids photo so it doesn't duplicate Girls.
    { key: 'kids', label: 'Kids', to: '/categories/kids', image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=900&auto=format&fit=crop', blurb: 'Everyday comfort for little ones' },
    { key: 'boys', label: 'Boys', to: '/categories/boys', image: boyFashion, blurb: 'Cool, playful & durable' },
    { key: 'girls', label: 'Girls', to: '/categories/girls', image: girlFashion, blurb: 'Frocks, dresses & more' },
];

// Sub-categories shown per audience in the navbar mega-menu (labels only —
// the live category list on each page comes from the API).
export const AUDIENCE_SUBS = {
    women: ['Dresses', 'Tops', 'Kurtas & Suits', 'Sarees', 'Jeans', 'Skirts', 'Handbags'],
    men: ['T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Jackets', 'Hoodies'],
    kids: ['Kidswear', 'Nightwear', 'Rompers'],
    boys: ['T-Shirts', 'Shirts', 'Jeans', 'Shorts'],
    girls: ['Frocks', 'Tops', 'Dresses', 'Leggings'],
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
export const ALL_AUDIENCE_KEYS = ['women', 'men', 'kids', 'boys', 'girls'];

// Human-readable copy from a set of active audience keys, e.g.
// ['men','boys'] -> "men & boys"; ['women','girls','kids'] -> "women, girls & kids".
const COPY_LABEL = { women: 'women', men: 'men', kids: 'kids', boys: 'boys', girls: 'girls' };
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
    kids: { eyebrow: 'Kids · New Season', headline: 'Little Big Moments', tagline: 'Comfy, playful styles made for every little adventure.', cta: 'Shop Kids', to: '/categories/kids' },
    boys: { eyebrow: 'Boys · New Season', headline: 'Ready, Set, Play', tagline: 'Cool, durable everyday styles built for boys.', cta: 'Shop Boys', to: '/categories/boys' },
    girls: { eyebrow: 'Girls · New Season', headline: 'Twirl in Style', tagline: 'Frocks, dresses & everyday favourites for girls.', cta: 'Shop Girls', to: '/categories/girls' },
};

// Fallback branding for a multi-audience / full store.
export const DEFAULT_THEME = {
    eyebrow: 'New Season · Autumn 2025',
    headline: 'Wear the Confidence',
    tagline: 'Elevated everyday fashion — clothing, footwear, watches, perfumes & accessories, all in one place.',
    cta: 'Shop the Collection',
    to: '/shop',
};
