import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import CartModel from '../pages/shop/CartModel';
import avatarImg from "../assets/avatar.png"
import { useLogoutUserMutation } from '../redux/features/auth/authApi';
import { logout } from '../redux/features/auth/authSlice';
import { useGetSettingsQuery } from '../redux/features/settings/settingsApi';

const ADMIN_ROLES = ['ADMIN', 'SUPERADMIN'];

const Navbar = () => {
    const products = useSelector((state) => state.cart.products);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const handleCartToggle = () => setIsCartOpen(!isCartOpen);

    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [logoutUser] = useLogoutUserMutation();
    const navigate = useNavigate();

    const { data: settingsData } = useGetSettingsQuery();
    const settings = settingsData?.data?.settings;
    const brandName = settings?.brandName || 'Wearly Fashion';
    // Two-tone wordmark: first word in brand colour, the rest in dark.
    const [brandFirst, ...brandRest] = brandName.split(' ');

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const handleDropDownToggle = () => setIsDropdownOpen(!isDropdownOpen);

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

    return (
        <>
        <div className='announcement-bar'>
            Free shipping on orders over <span>₹999</span> &nbsp;•&nbsp; Easy 30-day returns &nbsp;•&nbsp; Shop the new season
        </div>
        <header className='fixed-nav-bar w-nav'>
            <nav className='max-w-screen-2xl mx-auto px-4 py-3 flex justify-between items-center'>
                <ul className='nav__links'>
                    <li className='link'><Link to="/">Home</Link></li>
                    <li className='link'><Link to="/shop">Shop</Link></li>
                    <li className='link'><Link to="/categories/men">Men</Link></li>
                    <li className='link'><Link to="/categories/women">Women</Link></li>
                    <li className='link'><Link to="/categories/kids">Kids</Link></li>
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
            {isCartOpen && <CartModel products={products} isOpen={isCartOpen} onClose={handleCartToggle} />}
        </header>
        </>
    );
};

export default Navbar;
