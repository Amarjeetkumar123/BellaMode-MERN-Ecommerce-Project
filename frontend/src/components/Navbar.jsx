import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import CartModel from '../pages/shop/CartModel';
import WishlistDrawer from '../pages/wishlist/WishlistDrawer';
import avatarImg from "../assets/avatar.png"
import { useLogoutUserMutation } from '../redux/features/auth/authApi';
import { logout } from '../redux/features/auth/authSlice';
import { useGetCategoriesQuery } from '../redux/features/categories/categoriesApi';
import { AUDIENCES, LIFESTYLE, STORE_HOME, PRICE_BANDS, listingLink } from '../data/catalog';
import { useActiveAudiences } from '../hooks/useActiveAudiences';
import { useWishlist } from '../hooks/useWishlist';
import { slideTo } from '../utils/slideTo';

const ADMIN_ROLES = ['ADMIN', 'SUPERADMIN'];
const ALL_LABEL = { men: 'menswear', women: 'womenswear', kids: 'kidswear' };

// Text that rolls up to reveal a second copy on hover.
const Roll = ({ children }) => <span className='wf-roll'><b>{children}</b></span>;

const Navbar = () => {
    const products = useSelector((state) => state.cart.products);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    // Only one drawer at a time — opening either closes the other.
    const handleCartToggle = () => { setIsCartOpen((v) => !v); setIsWishlistOpen(false); };
    const handleWishlistToggle = () => { setIsWishlistOpen((v) => !v); setIsCartOpen(false); };
    const closeDrawers = useCallback(() => { setIsCartOpen(false); setIsWishlistOpen(false); }, []);

    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [logoutUser] = useLogoutUserMutation();
    const navigate = useNavigate();
    const { pathname, search } = useLocation();

    const { data: catData } = useGetCategoriesQuery();
    const { isActive, keys: activeKeys, settings } = useActiveAudiences();
    const { count: wishlistCount } = useWishlist();
    const stores = AUDIENCES.filter((a) => isActive(a.key));
    const allCats = catData?.data?.categories || [];
    const catsFor = (key) => allCats.filter((c) => c.audience === key).sort((a, b) => a.sortOrder - b.sortOrder);
    const lifestyle = catsFor('unisex').length
        ? catsFor('unisex')
        : LIFESTYLE.map((l) => ({ slug: l.slug, name: l.label, audience: 'unisex' }));

    const brandName = settings?.brandName || 'Wearly Fashion';
    const [brandFirst, ...brandRest] = brandName.split(' ');

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [scrolled, setScrolled] = useState(false);

    const submitSearch = (e) => {
        e.preventDefault();
        const q = searchTerm.trim();
        navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
    };

    // Which nav item is "current": a store (its home or a listing inside it) or Sale.
    const seg = pathname.split('/')[2];
    const current = pathname === '/' ? activeKeys[0]
        : pathname.startsWith('/categories/') ? (isActive(seg) ? seg : allCats.find((c) => c.slug === seg)?.audience)
        : pathname === '/shop' ? new URLSearchParams(search).get('store')
        : pathname === '/sale' ? 'sale'
        : null;

    // Sliding underline: sits under the current item, follows the pointer across the nav.
    const headerRef = useRef(null);
    const storesRef = useRef(null);
    const ind = () => storesRef.current?.querySelector('.wf-ind');
    const itemEl = (key) => storesRef.current?.querySelector(`[data-key="${key}"]`);
    const slideHome = () => {
        const el = itemEl(current);
        if (el) slideTo(ind(), el);
        else if (ind()) ind().style.width = '0px';
    };
    useLayoutEffect(() => {
        slideHome();
        document.fonts?.ready.then(slideHome);
        window.addEventListener('resize', slideHome);
        return () => window.removeEventListener('resize', slideHome);
    });
    // The mega menu is fixed under the header, wherever the header currently sits.
    const placeMega = () => headerRef.current?.style.setProperty('--wf-mega-top', `${headerRef.current.getBoundingClientRect().bottom}px`);
    // A click on a store or inside its menu shuts the menu until the pointer leaves that item.
    const [shut, setShut] = useState(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    useEffect(() => { setIsDropdownOpen(false); }, [pathname]);
    // "Add to bag" anywhere opens the bag: window.dispatchEvent(new Event('wf:open-bag'))
    useEffect(() => {
        const open = () => { setIsCartOpen(true); setIsWishlistOpen(false); };
        window.addEventListener('wf:open-bag', open);
        return () => window.removeEventListener('wf:open-bag', open);
    }, []);

    // Bag count pops when something is added.
    const bagRef = useRef(null);
    const lastCount = useRef(products.length);
    useEffect(() => {
        if (products.length > lastCount.current) bagRef.current?.animate([{ transform: 'scale(1.6)' }, { transform: 'none' }], { duration: 450, easing: 'ease-out' });
        lastCount.current = products.length;
    }, [products.length]);

    const isAdmin = user && ADMIN_ROLES.includes(user.role);
    const isSuperadmin = user && user.role === 'SUPERADMIN';
    const adminMenus = [
        { label: "Dashboard", path: "/dashboard/admin" },
        { label: "Manage Products", path: "/dashboard/manage-products" },
        { label: "Manage Categories", path: "/dashboard/manage-categories" },
        { label: "All Orders", path: "/dashboard/manage-orders" },
        { label: "Add New Post", path: "/dashboard/add-new-post" },
        { label: "Settings", path: "/dashboard/settings" },
    ];
    if (isSuperadmin) adminMenus.push({ label: "Manage Users", path: "/dashboard/manage-users" });
    const userMenus = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Profile", path: "/dashboard/profile" },
        { label: "Orders", path: "/dashboard/orders" },
    ];
    const dropdownMenus = isAdmin ? adminMenus : userMenus;

    const handleLogout = async () => {
        try {
            await logoutUser().unwrap();
        } catch {
            // logout is client-side regardless
        }
        dispatch(logout());
        setIsDropdownOpen(false);
        navigate('/');
    };

    return (
        <>
        <header ref={headerRef} className={`wf-header ${scrolled ? 'is-scrolled' : ''}`}>
            <div className='wf-wrap wf-header__bar'>
                <Link to='/' className='wf-logo' aria-label={`${brandName} home`}>
                    {settings?.logoUrl
                        ? <img src={settings.logoUrl} alt={brandName} />
                        : <><span>{brandFirst}</span>{brandRest.length ? ` ${brandRest.join(' ')}` : ''}</>}
                </Link>

                <ul
                    className='wf-stores'
                    ref={storesRef}
                    aria-label='Stores'
                    onPointerEnter={placeMega}
                    onFocus={placeMega}
                    onPointerLeave={slideHome}
                >
                    {stores.map((s) => (
                        <li key={s.key} className={shut === s.key ? 'is-shut' : undefined} onClick={() => setShut(s.key)} onPointerLeave={() => setShut(null)}>
                            <Link
                                to={s.to}
                                data-key={s.key}
                                aria-current={current === s.key ? 'page' : undefined}
                                onPointerEnter={(e) => slideTo(ind(), e.currentTarget)}
                            >
                                <Roll>{s.label}</Roll>
                            </Link>
                            <div className='wf-mega'>
                                <div className='wf-wrap'>
                                    <div>
                                        <h3>Shop by category</h3>
                                        <ul>
                                            <li><Link to={s.to} className='is-red'>All {ALL_LABEL[s.key]}</Link></li>
                                            {catsFor(s.key).map((c) => <li key={c._id}><Link to={listingLink(s.key, c)}>{c.name}</Link></li>)}
                                        </ul>
                                    </div>
                                    {STORE_HOME[s.key]?.lifestyle && (
                                        <div>
                                            <h3>Footwear and accessories</h3>
                                            <ul>{lifestyle.map((c) => <li key={c.slug}><Link to={listingLink(s.key, c)}>{c.name}</Link></li>)}</ul>
                                        </div>
                                    )}
                                    <div>
                                        <h3>Shop by price</h3>
                                        <ul>{PRICE_BANDS.map((b) => <li key={b.value}><Link to={`${listingLink(s.key)}&priceRange=${b.value}`}>{b.label}</Link></li>)}</ul>
                                        <h3>Collections</h3>
                                        <ul>
                                            <li><Link to={listingLink(s.key)}>All {ALL_LABEL[s.key]}</Link></li>
                                            <li><Link to={`${listingLink(s.key)}&sort=newest`}>New in</Link></li>
                                            <li><Link to={`${listingLink(s.key)}&sort=rating`}>Top rated</Link></li>
                                            <li><Link to={`/sale?store=${s.key}`} className='is-red'>Sale</Link></li>
                                        </ul>
                                    </div>
                                    <Link to={s.to} className='wf-mega__promo wf-glint'>
                                        <img src={settings?.audienceHeroImages?.[s.key] || s.image} alt='' loading='lazy' />
                                        <span>{STORE_HOME[s.key]?.kicker || s.label}</span>
                                    </Link>
                                </div>
                            </div>
                        </li>
                    ))}
                    <li>
                        <Link to='/sale' data-key='sale' className='is-sale' aria-current={current === 'sale' ? 'page' : undefined} onPointerEnter={(e) => slideTo(ind(), e.currentTarget)}>
                            <Roll>Sale</Roll>
                        </Link>
                    </li>
                    <li className='wf-ind' aria-hidden='true'></li>
                </ul>

                <form className='wf-search' role='search' onSubmit={submitSearch}>
                    <label className='wf-sr' htmlFor='wf-q'>Search</label>
                    <i className='ri-search-line' aria-hidden='true'></i>
                    <input
                        id='wf-q'
                        type='search'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={current && ALL_LABEL[current] ? `Search ${ALL_LABEL[current]}` : 'Search products and brands'}
                    />
                </form>

                <div className='wf-icons'>
                    <Link to='/search' className='wf-icon wf-icon--find' aria-label='Search'><i className='ri-search-line'></i></Link>
                    {user ? (
                        <>
                            <button type='button' className='wf-icon wf-icon--acct' aria-label='Account menu' aria-expanded={isDropdownOpen} onClick={() => setIsDropdownOpen((v) => !v)}>
                                <img src={user?.profileImage || avatarImg} alt='' />
                            </button>
                            {isDropdownOpen && (
                                <ul className='wf-menu'>
                                    {dropdownMenus.map((m) => <li key={m.path}><Link to={m.path}>{m.label}</Link></li>)}
                                    <li><button type='button' onClick={handleLogout}>Logout</button></li>
                                </ul>
                            )}
                        </>
                    ) : (
                        <Link to='/login' className='wf-icon wf-icon--acct' aria-label='Sign in'><i className='ri-user-line'></i></Link>
                    )}
                    <button type='button' className='wf-icon wf-icon--wish' onClick={handleWishlistToggle} aria-label={`Wishlist, ${wishlistCount} items`}>
                        <i className='ri-heart-line'></i>
                        {wishlistCount > 0 && <span className='wf-count'>{wishlistCount}</span>}
                    </button>
                    <button type='button' className='wf-icon wf-icon--bag' onClick={handleCartToggle} aria-label={`Bag, ${products.length} items`}>
                        <i className='ri-shopping-bag-line'></i>
                        {products.length > 0 && <span className='wf-count' ref={bagRef}>{products.length}</span>}
                    </button>
                </div>
            </div>
        </header>
        <CartModel products={products} isOpen={isCartOpen} onClose={closeDrawers} />
        <WishlistDrawer isOpen={isWishlistOpen} onClose={closeDrawers} />
        </>
    );
};

export default Navbar;
