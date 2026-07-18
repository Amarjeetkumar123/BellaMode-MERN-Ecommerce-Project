// Static seed dataset for Wearly — unisex catalog (men/women/girls/boys/kids/unisex).
// Prices are in INR. Image URLs reuse known-good Unsplash assets so they load reliably.

const IMG = {
    handbag: 'https://images.unsplash.com/photo-1512201078372-9c6b2a0d528a?q=80&w=1200&auto=format&fit=crop',
    gown: 'https://images.unsplash.com/photo-1568251188392-ae32f898cb3b?q=80&w=1200&auto=format&fit=crop',
    necklace: 'https://images.unsplash.com/photo-1631097969294-c38afba59496?q=80&w=1200&auto=format&fit=crop',
    scarf: 'https://images.unsplash.com/photo-1485527691629-8e370684924c?q=80&w=1200&auto=format&fit=crop',
    cocktail: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop',
    earrings: 'https://images.unsplash.com/photo-1587467442586-7bcc51828a10?q=80&w=1200&auto=format&fit=crop',
    sunglasses: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop',
    pants: 'https://plus.unsplash.com/premium_photo-1664298355914-bc65d2c9af64?q=80&w=1200&auto=format&fit=crop',
    tshirt: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop',
    shirt: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1200&auto=format&fit=crop',
    jeans: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1200&auto=format&fit=crop',
    sneakers: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop',
    jacket: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1200&auto=format&fit=crop',
    hoodie: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1200&auto=format&fit=crop',
    kids: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=1200&auto=format&fit=crop',
    cap: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1200&auto=format&fit=crop',
    watch: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop',
    dress: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200&auto=format&fit=crop',
};

// slug is derived at seed time from name+audience.
const CATEGORIES = [
    { name: 'T-Shirts', audience: 'men', image: IMG.tshirt, sortOrder: 1 },
    { name: 'Shirts', audience: 'men', image: IMG.shirt, sortOrder: 2 },
    { name: 'Jeans', audience: 'men', image: IMG.jeans, sortOrder: 3 },
    { name: 'Jackets', audience: 'men', image: IMG.jacket, sortOrder: 4 },
    { name: 'Dresses', audience: 'women', image: IMG.dress, sortOrder: 1 },
    { name: 'Tops', audience: 'women', image: IMG.cocktail, sortOrder: 2 },
    { name: 'Handbags', audience: 'women', image: IMG.handbag, sortOrder: 3 },
    { name: 'Frocks', audience: 'girls', image: IMG.gown, sortOrder: 1 },
    { name: 'T-Shirts', audience: 'boys', image: IMG.tshirt, sortOrder: 1 },
    { name: 'Kidswear', audience: 'kids', image: IMG.kids, sortOrder: 1 },
    { name: 'Footwear', audience: 'unisex', image: IMG.sneakers, sortOrder: 1 },
    { name: 'Accessories', audience: 'unisex', image: IMG.sunglasses, sortOrder: 2 },
    { name: 'Caps & Hats', audience: 'unisex', image: IMG.cap, sortOrder: 3 },
    { name: 'Watches', audience: 'unisex', image: IMG.watch, sortOrder: 4 },
];

// Each product references its category by { audience, categoryName }.
const PRODUCTS = [
    { name: 'Classic Cotton Tee', audience: 'men', categoryName: 'T-Shirts', price: 799, oldPrice: 1199, image: IMG.tshirt, brand: 'Wearly Basics', colors: ['black', 'white', 'navy'], sizes: ['S', 'M', 'L', 'XL'], stock: 120, rating: 4.4, isTrending: true, isFeatured: true, description: 'Soft breathable cotton t-shirt for everyday wear.' },
    { name: 'Oxford Formal Shirt', audience: 'men', categoryName: 'Shirts', price: 1499, oldPrice: 1999, image: IMG.shirt, brand: 'Urban Fit', colors: ['white', 'blue'], sizes: ['M', 'L', 'XL'], stock: 80, rating: 4.2, isFeatured: true, description: 'Crisp Oxford cotton shirt for office and occasions.' },
    { name: 'Slim Fit Jeans', audience: 'men', categoryName: 'Jeans', price: 1899, oldPrice: 2499, image: IMG.jeans, brand: 'Denim Co', colors: ['blue', 'black'], sizes: ['30', '32', '34', '36'], stock: 60, rating: 4.5, isTrending: true, description: 'Stretchable slim-fit denim with a modern cut.' },
    { name: 'Bomber Jacket', audience: 'men', categoryName: 'Jackets', price: 2999, oldPrice: 3999, image: IMG.jacket, brand: 'Wearly', colors: ['black', 'green'], sizes: ['M', 'L', 'XL'], stock: 40, rating: 4.6, isFeatured: true, description: 'Water-resistant bomber jacket with ribbed cuffs.' },
    { name: 'Floral Summer Dress', audience: 'women', categoryName: 'Dresses', price: 1799, oldPrice: 2299, image: IMG.dress, brand: 'Bloom', colors: ['red', 'blue'], sizes: ['XS', 'S', 'M', 'L'], stock: 70, rating: 4.7, isTrending: true, isFeatured: true, description: 'Flowy floral dress perfect for sunny days.' },
    { name: 'Evening Cocktail Dress', audience: 'women', categoryName: 'Dresses', price: 2599, oldPrice: 3299, image: IMG.cocktail, brand: 'Bloom', colors: ['black'], sizes: ['S', 'M', 'L'], stock: 35, rating: 4.5, description: 'Chic cocktail dress for parties and events.' },
    { name: 'Ruffle Top', audience: 'women', categoryName: 'Tops', price: 999, oldPrice: 1399, image: IMG.gown, brand: 'Wearly', colors: ['white', 'red'], sizes: ['XS', 'S', 'M'], stock: 90, rating: 4.1, description: 'Elegant ruffle top that pairs with anything.' },
    { name: 'Leather Handbag', audience: 'women', categoryName: 'Handbags', price: 2499, oldPrice: 3199, image: IMG.handbag, brand: 'Carry', colors: ['black', 'beige'], sizes: [], stock: 50, rating: 4.5, isTrending: true, description: 'Stylish leather handbag with ample storage.' },
    { name: 'Party Frock', audience: 'girls', categoryName: 'Frocks', price: 1299, oldPrice: 1699, image: IMG.gown, brand: 'Tiny Tots', colors: ['red', 'blue'], sizes: ['2-3Y', '4-5Y', '6-7Y'], stock: 55, rating: 4.4, isFeatured: true, description: 'Adorable party frock for little girls.' },
    { name: 'Graphic Kids Tee', audience: 'boys', categoryName: 'T-Shirts', price: 599, oldPrice: 899, image: IMG.tshirt, brand: 'Tiny Tots', colors: ['green', 'navy'], sizes: ['2-3Y', '4-5Y', '6-7Y'], stock: 85, rating: 4.3, isTrending: true, description: 'Fun printed t-shirt for active boys.' },
    { name: 'Kids Cozy Hoodie', audience: 'kids', categoryName: 'Kidswear', price: 1099, oldPrice: 1499, image: IMG.hoodie, brand: 'Tiny Tots', colors: ['grey', 'blue'], sizes: ['2-3Y', '4-5Y', '6-7Y'], stock: 65, rating: 4.6, isFeatured: true, description: 'Warm fleece hoodie to keep kids cozy.' },
    { name: 'Everyday Sneakers', audience: 'unisex', categoryName: 'Footwear', price: 2199, oldPrice: 2899, image: IMG.sneakers, brand: 'StepUp', colors: ['white', 'black'], sizes: ['6', '7', '8', '9', '10'], stock: 100, rating: 4.7, isTrending: true, isFeatured: true, description: 'Lightweight everyday sneakers with cushioned soles.' },
    { name: 'UV Sunglasses', audience: 'unisex', categoryName: 'Accessories', price: 899, oldPrice: 1299, image: IMG.sunglasses, brand: 'Shade', colors: ['black'], sizes: [], stock: 110, rating: 4.5, description: 'Trendy sunglasses with full UV protection.' },
    { name: 'Silk Scarf', audience: 'unisex', categoryName: 'Accessories', price: 699, oldPrice: 999, image: IMG.scarf, brand: 'Wearly', colors: ['blue', 'red'], sizes: [], stock: 75, rating: 4.3, description: 'Luxurious silk scarf with vibrant colors.' },
    { name: 'Baseball Cap', audience: 'unisex', categoryName: 'Caps & Hats', price: 599, oldPrice: 899, image: IMG.cap, brand: 'StepUp', colors: ['black', 'navy'], sizes: [], stock: 130, rating: 4.2, isTrending: true, description: 'Adjustable cotton baseball cap.' },
    { name: 'Minimalist Watch', audience: 'unisex', categoryName: 'Watches', price: 3499, oldPrice: 4499, image: IMG.watch, brand: 'Tick', colors: ['silver', 'black'], sizes: [], stock: 45, rating: 4.8, isFeatured: true, description: 'Elegant minimalist watch with a leather strap.' },
];

const SETTINGS = {
    key: 'brand',
    brandName: 'Wearly Fashion',
    logoUrl: '',
    heroTagline: 'Style for everyone — men, women & kids.',
    currency: 'INR',
    contactEmail: 'support@wearly.com',
    contactPhone: '+91 90000 00000',
    socialLinks: {
        facebook: 'https://facebook.com',
        instagram: 'https://instagram.com',
        twitter: 'https://twitter.com',
        youtube: 'https://youtube.com',
    },
};

const BANNERS = [
    { title: 'The New Season Edit', subtitle: 'New In · Autumn 2025', image: IMG.jacket, link: '/shop', ctaText: 'Shop the Collection', position: 'hero', sortOrder: 1 },
    { title: 'Up to 50% Off', subtitle: 'Season Sale · Limited Time', image: IMG.sneakers, link: '/shop', ctaText: 'Grab Deals', position: 'hero', sortOrder: 2 },
    { title: 'Streetwear Staples', subtitle: 'Built for every day', image: IMG.hoodie, link: '/shop', ctaText: 'Explore', position: 'promo', sortOrder: 1 },
    { title: 'Deal of the Day', subtitle: 'Everyday Sneakers at their best price', image: IMG.sneakers, link: '/shop', ctaText: 'Buy Now', position: 'deal', sortOrder: 1 },
];

const BLOGS = [
    { title: 'Mastering the Art of Capsule Wardrobes', subtitle: 'Timeless Elegance', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop', content: 'Build a versatile wardrobe with a few timeless essentials that mix and match effortlessly.' },
    { title: 'Unveiling the Hottest Beachwear Trends', subtitle: 'Summer Breeze', image: 'https://images.unsplash.com/photo-1700159017572-de76bb0c5719?q=80&w=1200&auto=format&fit=crop', content: 'From breezy shirts to bold prints, here is what everyone will be wearing this summer.' },
    { title: 'A Guide to Everyday Tailoring', subtitle: 'Power Dressing', image: 'https://plus.unsplash.com/premium_photo-1682142715511-27bfbfdc044f?q=80&w=1200&auto=format&fit=crop', content: 'The right fit changes everything. Learn how tailoring elevates even the simplest outfit.' },
    { title: "The World's Best Fashion Fair 2025", subtitle: 'Global Runways', image: 'https://plus.unsplash.com/premium_photo-1713720663924-4e3fe8f20f79?q=80&w=1200&auto=format&fit=crop', content: 'A look at the trends, designers and moments that defined the biggest fashion fair of the year.' },
];

module.exports = { CATEGORIES, PRODUCTS, SETTINGS, BANNERS, BLOGS };
