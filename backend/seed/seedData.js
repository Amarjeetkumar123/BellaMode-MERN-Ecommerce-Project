// Static seed dataset for Wearly — full-department catalog
// (men / women / girls / boys / kids + unisex lifestyle).
// Prices are in INR. Image URLs reuse known-good Unsplash assets so they load reliably.

const IMG = {
    handbag: 'https://images.unsplash.com/photo-1512201078372-9c6b2a0d528a?q=80&w=1200&auto=format&fit=crop',
    gown: 'https://images.unsplash.com/photo-1568251188392-ae32f898cb3b?q=80&w=1200&auto=format&fit=crop',
    scarf: 'https://images.unsplash.com/photo-1485527691629-8e370684924c?q=80&w=1200&auto=format&fit=crop',
    cocktail: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop',
    sunglasses: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1200&auto=format&fit=crop',
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
    // additions for the expanded taxonomy
    perfume: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1200&auto=format&fit=crop',
    perfume2: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop',
    kurta: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=1200&auto=format&fit=crop',
    saree: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
    skirt: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=1200&auto=format&fit=crop',
    shorts: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=1200&auto=format&fit=crop',
    leggings: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1200&auto=format&fit=crop',
    romper: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=1200&auto=format&fit=crop',
    trousers: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1200&auto=format&fit=crop',
    watch2: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1200&auto=format&fit=crop',
    heels: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1200&auto=format&fit=crop',
    tote: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop',
    backpack: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1200&auto=format&fit=crop',
    belt: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=1200&auto=format&fit=crop',
};

// slug is derived at seed time from name+audience.
const CATEGORIES = [
    // Men
    { name: 'T-Shirts', audience: 'men', image: IMG.tshirt, sortOrder: 1 },
    { name: 'Shirts', audience: 'men', image: IMG.shirt, sortOrder: 2 },
    { name: 'Jeans', audience: 'men', image: IMG.jeans, sortOrder: 3 },
    { name: 'Trousers', audience: 'men', image: IMG.trousers, sortOrder: 4 },
    { name: 'Jackets', audience: 'men', image: IMG.jacket, sortOrder: 5 },
    { name: 'Hoodies', audience: 'men', image: IMG.hoodie, sortOrder: 6 },
    // Women
    { name: 'Dresses', audience: 'women', image: IMG.dress, sortOrder: 1 },
    { name: 'Tops', audience: 'women', image: IMG.cocktail, sortOrder: 2 },
    { name: 'Kurtas & Suits', audience: 'women', image: IMG.kurta, sortOrder: 3 },
    { name: 'Sarees', audience: 'women', image: IMG.saree, sortOrder: 4 },
    { name: 'Jeans', audience: 'women', image: IMG.jeans, sortOrder: 5 },
    { name: 'Skirts', audience: 'women', image: IMG.skirt, sortOrder: 6 },
    { name: 'Handbags', audience: 'women', image: IMG.handbag, sortOrder: 7 },
    // Boys
    { name: 'T-Shirts', audience: 'boys', image: IMG.tshirt, sortOrder: 1 },
    { name: 'Shirts', audience: 'boys', image: IMG.shirt, sortOrder: 2 },
    { name: 'Jeans', audience: 'boys', image: IMG.jeans, sortOrder: 3 },
    { name: 'Shorts', audience: 'boys', image: IMG.shorts, sortOrder: 4 },
    // Girls
    { name: 'Frocks', audience: 'girls', image: IMG.gown, sortOrder: 1 },
    { name: 'Tops', audience: 'girls', image: IMG.cocktail, sortOrder: 2 },
    { name: 'Dresses', audience: 'girls', image: IMG.dress, sortOrder: 3 },
    { name: 'Leggings', audience: 'girls', image: IMG.leggings, sortOrder: 4 },
    // Kids
    { name: 'Kidswear', audience: 'kids', image: IMG.kids, sortOrder: 1 },
    { name: 'Nightwear', audience: 'kids', image: IMG.hoodie, sortOrder: 2 },
    { name: 'Rompers', audience: 'kids', image: IMG.romper, sortOrder: 3 },
    // Unisex lifestyle (shown on every department page)
    { name: 'Footwear', audience: 'unisex', image: IMG.sneakers, sortOrder: 1 },
    { name: 'Watches', audience: 'unisex', image: IMG.watch, sortOrder: 2 },
    { name: 'Perfumes', audience: 'unisex', image: IMG.perfume, sortOrder: 3 },
    { name: 'Accessories', audience: 'unisex', image: IMG.sunglasses, sortOrder: 4 },
    { name: 'Bags', audience: 'unisex', image: IMG.tote, sortOrder: 5 },
    { name: 'Sunglasses', audience: 'unisex', image: IMG.sunglasses, sortOrder: 6 },
    { name: 'Caps & Hats', audience: 'unisex', image: IMG.cap, sortOrder: 7 },
];

// Each product references its category by { audience, categoryName }.
const PRODUCTS = [
    // ---- Men ----
    { name: 'Classic Cotton Tee', audience: 'men', categoryName: 'T-Shirts', price: 799, oldPrice: 1199, image: IMG.tshirt, brand: 'Wearly Basics', colors: ['black', 'white', 'navy'], sizes: ['S', 'M', 'L', 'XL'], stock: 120, rating: 4.4, isTrending: true, isFeatured: true, description: 'Soft breathable cotton t-shirt for everyday wear.' },
    { name: 'Henley Neck Tee', audience: 'men', categoryName: 'T-Shirts', price: 999, oldPrice: 1399, image: IMG.tshirt, brand: 'Urban Fit', colors: ['grey', 'olive'], sizes: ['M', 'L', 'XL'], stock: 90, rating: 4.2, description: 'Textured henley tee with a button placket.' },
    { name: 'Oxford Formal Shirt', audience: 'men', categoryName: 'Shirts', price: 1499, oldPrice: 1999, image: IMG.shirt, brand: 'Urban Fit', colors: ['white', 'blue'], sizes: ['M', 'L', 'XL'], stock: 80, rating: 4.2, isFeatured: true, description: 'Crisp Oxford cotton shirt for office and occasions.' },
    { name: 'Checked Casual Shirt', audience: 'men', categoryName: 'Shirts', price: 1299, oldPrice: 1699, image: IMG.shirt, brand: 'Wearly', colors: ['red', 'navy'], sizes: ['S', 'M', 'L', 'XL'], stock: 70, rating: 4.3, description: 'Relaxed-fit flannel check shirt for weekends.' },
    { name: 'Slim Fit Jeans', audience: 'men', categoryName: 'Jeans', price: 1899, oldPrice: 2499, image: IMG.jeans, brand: 'Denim Co', colors: ['blue', 'black'], sizes: ['30', '32', '34', '36'], stock: 60, rating: 4.5, isTrending: true, description: 'Stretchable slim-fit denim with a modern cut.' },
    { name: 'Tailored Chino Trousers', audience: 'men', categoryName: 'Trousers', price: 1699, oldPrice: 2199, image: IMG.trousers, brand: 'Urban Fit', colors: ['beige', 'navy'], sizes: ['30', '32', '34', '36'], stock: 55, rating: 4.4, isFeatured: true, description: 'Smart cotton chinos that dress up or down.' },
    { name: 'Bomber Jacket', audience: 'men', categoryName: 'Jackets', price: 2999, oldPrice: 3999, image: IMG.jacket, brand: 'Wearly', colors: ['black', 'green'], sizes: ['M', 'L', 'XL'], stock: 40, rating: 4.6, isFeatured: true, description: 'Water-resistant bomber jacket with ribbed cuffs.' },
    { name: 'Fleece Pullover Hoodie', audience: 'men', categoryName: 'Hoodies', price: 1599, oldPrice: 2099, image: IMG.hoodie, brand: 'Streetwear Co', colors: ['grey', 'black'], sizes: ['M', 'L', 'XL'], stock: 75, rating: 4.5, isTrending: true, description: 'Heavyweight fleece hoodie for cool days.' },
    // ---- Women ----
    { name: 'Floral Summer Dress', audience: 'women', categoryName: 'Dresses', price: 1799, oldPrice: 2299, image: IMG.dress, brand: 'Bloom', colors: ['red', 'blue'], sizes: ['XS', 'S', 'M', 'L'], stock: 70, rating: 4.7, isTrending: true, isFeatured: true, description: 'Flowy floral dress perfect for sunny days.' },
    { name: 'Evening Cocktail Dress', audience: 'women', categoryName: 'Dresses', price: 2599, oldPrice: 3299, image: IMG.cocktail, brand: 'Bloom', colors: ['black'], sizes: ['S', 'M', 'L'], stock: 35, rating: 4.5, description: 'Chic cocktail dress for parties and events.' },
    { name: 'Ruffle Top', audience: 'women', categoryName: 'Tops', price: 999, oldPrice: 1399, image: IMG.gown, brand: 'Wearly', colors: ['white', 'red'], sizes: ['XS', 'S', 'M'], stock: 90, rating: 4.1, description: 'Elegant ruffle top that pairs with anything.' },
    { name: 'Embroidered Kurta Set', audience: 'women', categoryName: 'Kurtas & Suits', price: 2199, oldPrice: 2999, image: IMG.kurta, brand: 'Ethnika', colors: ['teal', 'maroon'], sizes: ['S', 'M', 'L', 'XL'], stock: 50, rating: 4.6, isTrending: true, isFeatured: true, description: 'Hand-embroidered cotton kurta with matching pants.' },
    { name: 'Silk Banarasi Saree', audience: 'women', categoryName: 'Sarees', price: 3499, oldPrice: 4999, image: IMG.saree, brand: 'Ethnika', colors: ['red', 'gold'], sizes: [], stock: 30, rating: 4.8, isFeatured: true, description: 'Traditional Banarasi silk saree with zari border.' },
    { name: 'High-Rise Skinny Jeans', audience: 'women', categoryName: 'Jeans', price: 1699, oldPrice: 2199, image: IMG.jeans, brand: 'Denim Co', colors: ['blue', 'black'], sizes: ['26', '28', '30', '32'], stock: 65, rating: 4.4, description: 'Figure-flattering high-rise stretch denim.' },
    { name: 'Pleated Midi Skirt', audience: 'women', categoryName: 'Skirts', price: 1299, oldPrice: 1799, image: IMG.skirt, brand: 'Bloom', colors: ['beige', 'black'], sizes: ['S', 'M', 'L'], stock: 45, rating: 4.3, description: 'Flowy pleated midi skirt with elastic waist.' },
    { name: 'Leather Handbag', audience: 'women', categoryName: 'Handbags', price: 2499, oldPrice: 3199, image: IMG.handbag, brand: 'Carry', colors: ['black', 'beige'], sizes: [], stock: 50, rating: 4.5, isTrending: true, description: 'Stylish leather handbag with ample storage.' },
    // ---- Boys ----
    { name: 'Graphic Kids Tee', audience: 'boys', categoryName: 'T-Shirts', price: 599, oldPrice: 899, image: IMG.tshirt, brand: 'Tiny Tots', colors: ['green', 'navy'], sizes: ['2-3Y', '4-5Y', '6-7Y'], stock: 85, rating: 4.3, isTrending: true, description: 'Fun printed t-shirt for active boys.' },
    { name: 'Checked Boys Shirt', audience: 'boys', categoryName: 'Shirts', price: 799, oldPrice: 1099, image: IMG.shirt, brand: 'Tiny Tots', colors: ['blue', 'red'], sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'], stock: 60, rating: 4.2, description: 'Smart-casual checked shirt for little gentlemen.' },
    { name: 'Boys Denim Jeans', audience: 'boys', categoryName: 'Jeans', price: 999, oldPrice: 1399, image: IMG.jeans, brand: 'Tiny Tots', colors: ['blue'], sizes: ['2-3Y', '4-5Y', '6-7Y'], stock: 70, rating: 4.4, description: 'Durable stretch denim built for playtime.' },
    { name: 'Cotton Play Shorts', audience: 'boys', categoryName: 'Shorts', price: 549, oldPrice: 799, image: IMG.shorts, brand: 'Tiny Tots', colors: ['grey', 'navy'], sizes: ['2-3Y', '4-5Y', '6-7Y'], stock: 95, rating: 4.3, isTrending: true, description: 'Breathable cotton shorts for warm days.' },
    // ---- Girls ----
    { name: 'Party Frock', audience: 'girls', categoryName: 'Frocks', price: 1299, oldPrice: 1699, image: IMG.gown, brand: 'Tiny Tots', colors: ['red', 'blue'], sizes: ['2-3Y', '4-5Y', '6-7Y'], stock: 55, rating: 4.4, isFeatured: true, description: 'Adorable party frock for little girls.' },
    { name: 'Floral Girls Top', audience: 'girls', categoryName: 'Tops', price: 649, oldPrice: 899, image: IMG.cocktail, brand: 'Tiny Tots', colors: ['pink', 'white'], sizes: ['2-3Y', '4-5Y', '6-7Y'], stock: 80, rating: 4.2, description: 'Soft cotton top with a cheerful floral print.' },
    { name: 'Polka Dot Dress', audience: 'girls', categoryName: 'Dresses', price: 1099, oldPrice: 1499, image: IMG.dress, brand: 'Tiny Tots', colors: ['red', 'yellow'], sizes: ['2-3Y', '4-5Y', '6-7Y'], stock: 60, rating: 4.5, isTrending: true, description: 'Twirl-worthy polka dot dress for special days.' },
    { name: 'Stretch Leggings', audience: 'girls', categoryName: 'Leggings', price: 449, oldPrice: 699, image: IMG.leggings, brand: 'Tiny Tots', colors: ['black', 'pink'], sizes: ['2-3Y', '4-5Y', '6-7Y'], stock: 110, rating: 4.3, description: 'Comfy everyday leggings with a soft waistband.' },
    // ---- Kids ----
    { name: 'Kids Cozy Hoodie', audience: 'kids', categoryName: 'Kidswear', price: 1099, oldPrice: 1499, image: IMG.hoodie, brand: 'Tiny Tots', colors: ['grey', 'blue'], sizes: ['2-3Y', '4-5Y', '6-7Y'], stock: 65, rating: 4.6, isFeatured: true, description: 'Warm fleece hoodie to keep kids cozy.' },
    { name: 'Star Print Nightsuit', audience: 'kids', categoryName: 'Nightwear', price: 899, oldPrice: 1199, image: IMG.kids, brand: 'Tiny Tots', colors: ['navy', 'grey'], sizes: ['2-3Y', '4-5Y', '6-7Y'], stock: 70, rating: 4.4, description: 'Soft cotton nightsuit for a snug bedtime.' },
    { name: 'Cotton Baby Romper', audience: 'kids', categoryName: 'Rompers', price: 749, oldPrice: 999, image: IMG.romper, brand: 'Tiny Tots', colors: ['white', 'yellow'], sizes: ['0-3M', '3-6M', '6-12M'], stock: 90, rating: 4.7, isTrending: true, description: 'Snap-button romper in gentle organic cotton.' },
    // ---- Unisex lifestyle ----
    { name: 'Everyday Sneakers', audience: 'unisex', categoryName: 'Footwear', price: 2199, oldPrice: 2899, image: IMG.sneakers, brand: 'StepUp', colors: ['white', 'black'], sizes: ['6', '7', '8', '9', '10'], stock: 100, rating: 4.7, isTrending: true, isFeatured: true, description: 'Lightweight everyday sneakers with cushioned soles.' },
    { name: 'Block Heel Sandals', audience: 'unisex', categoryName: 'Footwear', price: 1799, oldPrice: 2399, image: IMG.heels, brand: 'StepUp', colors: ['nude', 'black'], sizes: ['4', '5', '6', '7', '8'], stock: 60, rating: 4.4, description: 'Comfortable block-heel sandals for all-day wear.' },
    { name: 'Minimalist Watch', audience: 'unisex', categoryName: 'Watches', price: 3499, oldPrice: 4499, image: IMG.watch, brand: 'Tick', colors: ['silver', 'black'], sizes: [], stock: 45, rating: 4.8, isFeatured: true, description: 'Elegant minimalist watch with a leather strap.' },
    { name: 'Chronograph Steel Watch', audience: 'unisex', categoryName: 'Watches', price: 4999, oldPrice: 6499, image: IMG.watch2, brand: 'Tick', colors: ['silver', 'gold'], sizes: [], stock: 30, rating: 4.6, isTrending: true, description: 'Stainless-steel chronograph with a sunray dial.' },
    { name: 'Aqua Breeze Eau de Parfum', audience: 'unisex', categoryName: 'Perfumes', price: 1999, oldPrice: 2799, image: IMG.perfume, brand: 'Aura', colors: [], sizes: ['50ml', '100ml'], stock: 80, rating: 4.6, isTrending: true, isFeatured: true, description: 'Fresh aquatic fragrance with citrus & musk notes.' },
    { name: 'Amber Oud Perfume', audience: 'unisex', categoryName: 'Perfumes', price: 2499, oldPrice: 3299, image: IMG.perfume2, brand: 'Aura', colors: [], sizes: ['50ml', '100ml'], stock: 55, rating: 4.7, isFeatured: true, description: 'Warm, woody oud fragrance for evening wear.' },
    { name: 'UV Sunglasses', audience: 'unisex', categoryName: 'Sunglasses', price: 899, oldPrice: 1299, image: IMG.sunglasses, brand: 'Shade', colors: ['black'], sizes: [], stock: 110, rating: 4.5, isTrending: true, description: 'Trendy sunglasses with full UV protection.' },
    { name: 'Silk Scarf', audience: 'unisex', categoryName: 'Accessories', price: 699, oldPrice: 999, image: IMG.scarf, brand: 'Wearly', colors: ['blue', 'red'], sizes: [], stock: 75, rating: 4.3, description: 'Luxurious silk scarf with vibrant colors.' },
    { name: 'Leather Belt', audience: 'unisex', categoryName: 'Accessories', price: 799, oldPrice: 1199, image: IMG.belt, brand: 'Carry', colors: ['brown', 'black'], sizes: [], stock: 95, rating: 4.4, description: 'Genuine leather belt with a brushed buckle.' },
    { name: 'Canvas Tote Bag', audience: 'unisex', categoryName: 'Bags', price: 999, oldPrice: 1399, image: IMG.tote, brand: 'Carry', colors: ['beige', 'black'], sizes: [], stock: 85, rating: 4.3, description: 'Roomy everyday canvas tote for work & errands.' },
    { name: 'Urban Backpack', audience: 'unisex', categoryName: 'Bags', price: 1899, oldPrice: 2499, image: IMG.backpack, brand: 'Carry', colors: ['grey', 'navy'], sizes: [], stock: 60, rating: 4.6, isTrending: true, description: 'Water-resistant backpack with a padded laptop sleeve.' },
    { name: 'Baseball Cap', audience: 'unisex', categoryName: 'Caps & Hats', price: 599, oldPrice: 899, image: IMG.cap, brand: 'StepUp', colors: ['black', 'navy'], sizes: [], stock: 130, rating: 4.2, isTrending: true, description: 'Adjustable cotton baseball cap.' },
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
