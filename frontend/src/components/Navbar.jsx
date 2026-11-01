import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import CartModel from '../pages/shop/CartModel';
import WishlistDrawer from '../pages/wishlist/WishlistDrawer';
import { useLogoutUserMutation } from '../redux/features/auth/authApi';
import { logout } from '../redux/features/auth/authSlice';
import { AUDIENCES } from '../data/catalog';
import { useActiveAudiences } from '../hooks/useActiveAudiences';
import { useWishlist } from '../hooks/useWishlist';
import { initialOf } from '../utils/user';
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

    const { isActive, keys: activeKeys, settings } = useActiveAudiences();
    const { count: wishlistCount } = useWishlist();
    const stores = AUDIENCES.filter((a) => isActive(a.key));

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
        : pathname.startsWith('/categories/') ? (isActive(seg) ? seg : null)
        : pathname === '/shop' ? new URLSearchParams(search).get('store')
        : pathname === '/sale' ? 'sale'
        : null;

    // Sliding underline: sits under the current item, follows the pointer across the nav.
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

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    useEffect(() => { setIsDropdownOpen(false); }, [pathname]);
    // account menu closes on outside click or Escape
    useEffect(() => {
        if (!isDropdownOpen) return;
        const away = (e) => { if (!e.target.closest('.wf-acct')) setIsDropdownOpen(false); };
        const esc = (e) => { if (e.key === 'Escape') setIsDropdownOpen(false); };
        document.addEventListener('pointerdown', away);
        document.addEventListener('keydown', esc);
        return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', esc); };
    }, [isDropdownOpen]);
    // Anywhere can open a drawer: window.dispatchEvent(new Event('wf:open-bag')) or 'wf:open-wishlist'
    useEffect(() => {
        const open = () => { setIsCartOpen(true); setIsWishlistOpen(false); };
        const wish = () => { setIsWishlistOpen(true); setIsCartOpen(false); };
        window.addEventListener('wf:open-bag', open);
        window.addEventListener('wf:open-wishlist', wish);
        return () => { window.removeEventListener('wf:open-bag', open); window.removeEventListener('wf:open-wishlist', wish); };
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
        { label: "Dashboard", path: "/dashboard/admin", icon: "ri-dashboard-line" },
        { label: "Manage Products", path: "/dashboard/manage-products", icon: "ri-t-shirt-line" },
        { label: "Manage Categories", path: "/dashboard/manage-categories", icon: "ri-folder-2-line" },
        { label: "All Orders", path: "/dashboard/manage-orders", icon: "ri-file-list-3-line" },
        { label: "Add New Post", path: "/dashboard/add-new-post", icon: "ri-quill-pen-line" },
        { label: "Settings", path: "/dashboard/settings", icon: "ri-settings-3-line" },
    ];
    if (isSuperadmin) adminMenus.push({ label: "Manage Users", path: "/dashboard/manage-users", icon: "ri-team-line" });
    adminMenus.push({ label: "My profile", path: "/dashboard/profile", icon: "ri-user-line" });
    const userMenus = [
        { label: "My account", path: "/dashboard", icon: "ri-dashboard-line" },
        { label: "Orders", path: "/dashboard/orders", icon: "ri-box-3-line" },
        { label: "Profile and addresses", path: "/dashboard/profile", icon: "ri-user-line" },
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
        <header className={`wf-header ${scrolled ? 'is-scrolled' : ''}`}>
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
                    onPointerLeave={slideHome}
                >
                    {stores.map((s) => (
                        <li key={s.key}>
                            <Link
                                to={s.to}
                                data-key={s.key}
                                aria-current={current === s.key ? 'page' : undefined}
                                onPointerEnter={(e) => slideTo(ind(), e.currentTarget)}
                            >
                                <Roll>{s.label}</Roll>
                            </Link>
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
                        <div className='wf-acct'>
                            <button type='button' className='wf-icon wf-icon--acct' aria-label='Account menu' aria-expanded={isDropdownOpen} onClick={() => setIsDropdownOpen((v) => !v)}>
                                {user.profileImage
                                    ? <img src={user.profileImage} alt='' />
                                    : <span className='wf-mono' aria-hidden='true'>{initialOf(user)}</span>}
                            </button>
                            {isDropdownOpen && (
                                <div className='wf-menu'>
                                    <div className='wf-menu__who'>
                                        <b>{user.username || user.name || 'Your account'}</b>
                                        {user.email && <small>{user.email}</small>}
                                        {isAdmin && <span className='wf-menu__role'>{user.role.toLowerCase()}</span>}
                                    </div>
                                    <ul>
                                        {dropdownMenus.map((m) => <li key={m.path}><Link to={m.path}><i className={m.icon} aria-hidden='true'></i>{m.label}</Link></li>)}
                                    </ul>
                                    <button type='button' className='wf-menu__out' onClick={handleLogout}><i className='ri-logout-box-r-line' aria-hidden='true'></i>Sign out</button>
                                </div>
                            )}
                        </div>
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
