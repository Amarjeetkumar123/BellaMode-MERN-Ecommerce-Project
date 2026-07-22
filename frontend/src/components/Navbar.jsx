import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import CartModel from '../pages/shop/CartModel';
import WishlistDrawer from '../pages/wishlist/WishlistDrawer';
import avatarImg from "../assets/avatar.png"
import { useLogoutUserMutation } from '../redux/features/auth/authApi';
import { logout } from '../redux/features/auth/authSlice';
import { useGetSettingsQuery } from '../redux/features/settings/settingsApi';
import { useGetCategoriesQuery } from '../redux/features/categories/categoriesApi';
import { AUDIENCES, LIFESTYLE, FOOTWEAR_DEPT } from '../data/catalog';
import { useActiveAudiences } from '../hooks/useActiveAudiences';
import { useWishlist } from '../hooks/useWishlist';
import { useDrawer } from '../hooks/useDrawer';

const ADMIN_ROLES = ['ADMIN', 'SUPERADMIN'];
const AUDIENCE_IMG = AUDIENCES.reduce((acc, a) => ({ ...acc, [a.key]: a.image }), {});

const Navbar = () => {
    const products = useSelector((state) => state.cart.products);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    // Only one drawer at a time — opening either closes the other.
    const handleCartToggle = () => { setIsCartOpen((v) => !v); setIsWishlistOpen(false); };
    const handleWishlistToggle = () => { setIsWishlistOpen((v) => !v); setIsCartOpen(false); };

    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [logoutUser] = useLogoutUserMutation();
    const navigate = useNavigate();

    const { data: settingsData } = useGetSettingsQuery();
    const { data: catData } = useGetCategoriesQuery();
    const { isActive } = useActiveAudiences();
    const { count: wishlistCount } = useWishlist();
    const menu = AUDIENCES.filter((a) => isActive(a.key));
    const allCats = catData?.data?.categories || [];
    const lifestyleCats = allCats.filter((c) => c.audience === 'unisex').sort((a, b) => a.sortOrder - b.sortOrder);

    const settings = settingsData?.data?.settings;
    const brandName = settings?.brandName || 'Wearly Fashion';
    const [brandFirst, ...brandRest] = brandName.split(' ');

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const handleDropDownToggle = () => setIsDropdownOpen(!isDropdownOpen);
    const [openMenu, setOpenMenu] = useState(null); // audience key of the open mega-menu
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [mobileOpen, setMobileOpen] = useState(false);
    const closeMobile = () => setMobileOpen(false);
    useDrawer(mobileOpen, closeMobile);

    const submitSearch = (e) => {
        e.preventDefault();
        const q = searchTerm.trim();
        navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
        setSearchOpen(false);
    };

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
        } catch (error) {
            // logout is client-side regardless
        }
        dispatch(logout());
        setIsDropdownOpen(false);
        navigate('/');
    };

    const catsFor = (key) => allCats.filter((c) => c.audience === key).sort((a, b) => a.sortOrder - b.sortOrder);

    return (
        <>
        <header className='fixed-nav-bar w-nav' onMouseLeave={() => setOpenMenu(null)}>
            <nav className='max-w-screen-2xl mx-auto px-4 py-3 flex justify-between items-center'>
                {/* Mobile menu trigger — .nav__links is hidden under 900px, so without
                    this there is no way to reach the departments on a phone. */}
                <button
                    className='nav__burger'
                    aria-label='Open menu'
                    aria-expanded={mobileOpen}
                    onClick={() => setMobileOpen(true)}
                >
                    <i className='ri-menu-line'></i>
                </button>

                <ul className='nav__links'>
                    {/* Departments: the shopper audiences, then Footwear, then everything else. */}
                    {menu.map((m) => (
                        <li key={m.key} className='link nav__has-mega' onMouseEnter={() => setOpenMenu(m.key)}>
                            <Link to={`/categories/${m.key}`}>{m.label}</Link>
                        </li>
                    ))}
                    {/* These have no mega-menu, so hovering them must dismiss an open one. */}
                    <li className='link' onMouseEnter={() => setOpenMenu(null)}>
                        <Link to={FOOTWEAR_DEPT.to}>{FOOTWEAR_DEPT.label}</Link>
                    </li>
                    <li className='link' onMouseEnter={() => setOpenMenu(null)}>
                        <Link to="/shop">Shop All</Link>
                    </li>
                </ul>
                {/* logo (text wordmark, or uploaded logo image) */}
                <div className='nav__logo' onMouseEnter={() => setOpenMenu(null)}>
                    <Link to="/">
                        {settings?.logoUrl
                            ? <img src={settings.logoUrl} alt={brandName} className='h-8' />
                            : <><span>{brandFirst}</span>{brandRest.length ? ` ${brandRest.join(' ')}` : ''}</>}
                    </Link>
                </div>
                <div className='nav__icons relative' onMouseEnter={() => setOpenMenu(null)}>
                    <span>
                        <button onClick={() => setSearchOpen((v) => !v)} aria-label='Search' className='hover:text-primary'>
                            <i className={searchOpen ? 'ri-close-line' : 'ri-search-line'}></i>
                        </button>
                    </span>
                    <span>
                        <button onClick={handleWishlistToggle} aria-label='Wishlist' className='hover:text-primary'>
                            <i className='ri-heart-line'></i>
                            {wishlistCount > 0 && (
                                <sup className='text-sm inline-block px-1.5 text-white rounded-full bg-primary text-center'>{wishlistCount}</sup>
                            )}
                        </button>
                    </span>
                    <span>
                        <button onClick={handleCartToggle} className='hover:text-primary'>
                            <i className="ri-shopping-bag-line"></i>
                            <sup className='text-sm inline-block px-1.5 text-white rounded-full bg-primary text-center'>{products.length}</sup>
                        </button>
                    </span>
                    <span>
                        {user ? (
                            <>
                                <img onClick={handleDropDownToggle}
                                    src={user?.profileImage || avatarImg} alt='' className='size-6 rounded-full cursor-pointer' />
                                {isDropdownOpen && (
                                    <div className='absolute right-0 mt-3 p-4 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-50'>
                                        <ul className='font-medium space-y-3 p-2'>
                                            {dropdownMenus.map((menu, index) => (
                                                <li key={index}>
                                                    <Link className='!text-base' onClick={() => setIsDropdownOpen(false)} to={menu.path}>{menu.label}</Link>
                                                </li>
                                            ))}
                                            <li><button className='!text-base text-left w-full' onClick={handleLogout}>Logout</button></li>
                                        </ul>
                                    </div>
                                )}
                            </>
                        ) : (
                            <Link to="/login"><i className='ri-user-line'></i></Link>
                        )}
                    </span>
                </div>
            </nav>

            {/* Search bar (expands under the nav) */}
            {searchOpen && (
                <div className='nav-search'>
                    <form onSubmit={submitSearch} className='nav-search__form'>
                        <i className='ri-search-line'></i>
                        <input
                            autoFocus
                            type='text'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder='Search for products, brands & more…'
                        />
                        <button type='submit' className='btn !rounded-lg !py-2'>Search</button>
                    </form>
                </div>
            )}

            {/* Mega-menu panel */}
            {openMenu && (
                <div className='mega' onMouseLeave={() => setOpenMenu(null)}>
                    <div className='mega__inner'>
                        <div className='mega__col'>
                            <h5 className='mega__title capitalize'>{openMenu} Clothing</h5>
                            <ul>
                                <li><Link to={`/categories/${openMenu}`} onClick={() => setOpenMenu(null)}>All {openMenu}</Link></li>
                                {catsFor(openMenu).map((c) => (
                                    <li key={c._id}><Link to={`/categories/${c.slug}`} onClick={() => setOpenMenu(null)}>{c.name}</Link></li>
                                ))}
                            </ul>
                        </div>
                        <div className='mega__col'>
                            <h5 className='mega__title'>Footwear &amp; Lifestyle</h5>
                            <ul>
                                {(lifestyleCats.length ? lifestyleCats.map((c) => ({ slug: c.slug, name: c.name, id: c._id }))
                                    : LIFESTYLE.map((l) => ({ slug: l.slug, name: l.label, id: l.key })))
                                    .map((c) => (
                                        <li key={c.id}><Link to={`/categories/${c.slug}`} onClick={() => setOpenMenu(null)}>{c.name}</Link></li>
                                    ))}
                            </ul>
                        </div>
                        <Link to={`/categories/${openMenu}`} className='mega__promo' onClick={() => setOpenMenu(null)}>
                            <img src={AUDIENCE_IMG[openMenu]} alt={openMenu} />
                            <div className='mega__promo-overlay'>
                                <span>Shop the</span>
                                <strong className='capitalize'>{openMenu} Edit</strong>
                            </div>
                        </Link>
                    </div>
                </div>
            )}
        </header>
        {isCartOpen && <CartModel products={products} isOpen={isCartOpen} onClose={handleCartToggle} />}
        {isWishlistOpen && <WishlistDrawer isOpen={isWishlistOpen} onClose={handleWishlistToggle} />}

        {/* ---- Mobile menu ---- */}
        {mobileOpen && (
            <>
                <div className='fixed z-[1000] inset-0 bg-black/50' onClick={closeMobile} />
                <div className='mobile-nav' role='dialog' aria-modal='true' aria-label='Menu' style={{ height: '100vh' }}>
                    <div className='mobile-nav__head'>
                        <span className='mobile-nav__brand'>{brandName}</span>
                        <button onClick={closeMobile} aria-label='Close menu'><i className='ri-close-line'></i></button>
                    </div>

                    <div className='mobile-nav__body'>
                        {/* Each department, with its categories inline so nothing is buried */}
                        {menu.map((m) => (
                            <div key={m.key} className='mobile-nav__group'>
                                <Link to={`/categories/${m.key}`} onClick={closeMobile} className='mobile-nav__dept'>
                                    {m.label}
                                </Link>
                                <div className='mobile-nav__subs'>
                                    {catsFor(m.key).slice(0, 8).map((c) => (
                                        <Link key={c._id} to={`/categories/${c.slug}`} onClick={closeMobile}>{c.name}</Link>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className='mobile-nav__group'>
                            <span className='mobile-nav__label'>Footwear &amp; Lifestyle</span>
                            <div className='mobile-nav__subs'>
                                {(lifestyleCats.length ? lifestyleCats.map((c) => ({ slug: c.slug, name: c.name, id: c._id }))
                                    : LIFESTYLE.map((l) => ({ slug: l.slug, name: l.label, id: l.key })))
                                    .map((c) => (
                                        <Link key={c.id} to={`/categories/${c.slug}`} onClick={closeMobile}>{c.name}</Link>
                                    ))}
                            </div>
                        </div>

                        <div className='mobile-nav__group'>
                            <Link to='/shop' onClick={closeMobile} className='mobile-nav__dept'>Shop All</Link>
                        </div>
                    </div>

                    <div className='mobile-nav__foot'>
                        {user ? (
                            <>
                                <Link to='/dashboard' onClick={closeMobile}><i className='ri-user-line'></i> My Account</Link>
                                <button onClick={() => { closeMobile(); handleLogout(); }}><i className='ri-logout-box-r-line'></i> Logout</button>
                            </>
                        ) : (
                            <Link to='/login' onClick={closeMobile}><i className='ri-user-line'></i> Sign In</Link>
                        )}
                    </div>
                </div>
            </>
        )}
        </>
    );
};

export default Navbar;
