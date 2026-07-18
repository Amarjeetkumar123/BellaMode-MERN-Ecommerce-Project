import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import CartModel from '../pages/shop/CartModel';
import avatarImg from "../assets/avatar.png"
import { useLogoutUserMutation } from '../redux/features/auth/authApi';
import { logout } from '../redux/features/auth/authSlice';
import { useGetSettingsQuery } from '../redux/features/settings/settingsApi';
import { useGetCategoriesQuery } from '../redux/features/categories/categoriesApi';
import { AUDIENCES, LIFESTYLE } from '../data/catalog';

const ADMIN_ROLES = ['ADMIN', 'SUPERADMIN'];
const MENU = [
    { key: 'women', label: 'Women' },
    { key: 'men', label: 'Men' },
    { key: 'kids', label: 'Kids' },
    { key: 'boys', label: 'Boys' },
    { key: 'girls', label: 'Girls' },
];
const AUDIENCE_IMG = AUDIENCES.reduce((acc, a) => ({ ...acc, [a.key]: a.image }), {});

const Navbar = () => {
    const products = useSelector((state) => state.cart.products);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const handleCartToggle = () => setIsCartOpen(!isCartOpen);

    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [logoutUser] = useLogoutUserMutation();
    const navigate = useNavigate();

    const { data: settingsData } = useGetSettingsQuery();
    const { data: catData } = useGetCategoriesQuery();
    const allCats = catData?.data?.categories || [];
    const lifestyleCats = allCats.filter((c) => c.audience === 'unisex').sort((a, b) => a.sortOrder - b.sortOrder);

    const settings = settingsData?.data?.settings;
    const brandName = settings?.brandName || 'Wearly Fashion';
    const [brandFirst, ...brandRest] = brandName.split(' ');

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const handleDropDownToggle = () => setIsDropdownOpen(!isDropdownOpen);
    const [openMenu, setOpenMenu] = useState(null); // audience key of the open mega-menu

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
                <ul className='nav__links'>
                    <li className='link'><Link to="/">Home</Link></li>
                    <li className='link'><Link to="/shop">Shop</Link></li>
                    {MENU.map((m) => (
                        <li key={m.key} className='link nav__has-mega' onMouseEnter={() => setOpenMenu(m.key)}>
                            <Link to={`/categories/${m.key}`}>{m.label}</Link>
                        </li>
                    ))}
                </ul>
                {/* logo (text wordmark, or uploaded logo image) */}
                <div className='nav__logo'>
                    <Link to="/">
                        {settings?.logoUrl
                            ? <img src={settings.logoUrl} alt={brandName} className='h-8' />
                            : <><span>{brandFirst}</span>{brandRest.length ? ` ${brandRest.join(' ')}` : ''}</>}
                    </Link>
                </div>
                <div className='nav__icons relative'>
                    <span>
                        <Link to="/search"><i className="ri-search-line"></i></Link>
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
            {isCartOpen && <CartModel products={products} isOpen={isCartOpen} onClose={handleCartToggle} />}
        </header>
        </>
    );
};

export default Navbar;
