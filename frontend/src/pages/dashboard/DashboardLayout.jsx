import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import avatarImg from '../../assets/avatar.png'
import { useLogoutUserMutation } from '../../redux/features/auth/authApi'
import { logout } from '../../redux/features/auth/authSlice'
import AccountLayout from '../account/AccountLayout'

const ADMIN_ROLES = ['ADMIN', 'SUPERADMIN'];
// the customer's own pages use the storefront account layout, for every role
const ACCOUNT_PAGES = ['/dashboard', '/dashboard/orders', '/dashboard/profile'];

const DashboardLayout = () => {
    const { user } = useSelector((s) => s.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [logoutUser] = useLogoutUserMutation();
    const { pathname } = useLocation();

    const isAdmin = user && ADMIN_ROLES.includes(user.role);
    const isSuperadmin = user && user.role === 'SUPERADMIN';

    const userLinks = [
        { to: '/dashboard', label: 'Overview', icon: 'ri-dashboard-line', end: true },
        { to: '/dashboard/profile', label: 'Profile', icon: 'ri-user-line' },
        { to: '/dashboard/orders', label: 'My Orders', icon: 'ri-shopping-bag-line' },
    ];
    const adminLinks = [
        { to: '/dashboard/admin', label: 'Admin Overview', icon: 'ri-dashboard-line' },
        { to: '/dashboard/manage-products', label: 'Products', icon: 'ri-t-shirt-line' },
        { to: '/dashboard/manage-categories', label: 'Categories', icon: 'ri-price-tag-3-line' },
        { to: '/dashboard/manage-orders', label: 'Orders', icon: 'ri-shopping-bag-line' },
        { to: '/dashboard/add-new-post', label: 'Blog Posts', icon: 'ri-article-line' },
        { to: '/dashboard/settings', label: 'Settings', icon: 'ri-settings-3-line' },
    ];
    if (isSuperadmin) adminLinks.push({ to: '/dashboard/manage-users', label: 'Users', icon: 'ri-group-line' });

    const links = isAdmin ? adminLinks : userLinks;
    if (ACCOUNT_PAGES.includes(pathname.replace(/\/$/, ''))) return <AccountLayout />;

    const handleLogout = async () => {
        try { await logoutUser().unwrap(); } catch { /* client-side anyway */ }
        dispatch(logout());
        navigate('/');
    };

    return (
        <section className='section__container !py-10'>
            <div className='flex flex-col md:flex-row gap-6'>
                <aside className='md:w-64 flex-shrink-0'>
                    <div className='bg-white border border-gray-100 rounded-2xl p-4 shadow-sm md:sticky md:top-24'>
                        <div className='flex items-center gap-3 pb-4 mb-3 border-b'>
                            <img src={user?.profileImage || avatarImg} alt='' className='w-11 h-11 rounded-full object-cover' />
                            <div className='min-w-0'>
                                <p className='font-semibold text-sm truncate'>{user?.username || 'User'}</p>
                                <p className='text-xs text-text-light truncate'>{isAdmin ? user?.role : 'Member'}</p>
                            </div>
                        </div>
                        <nav className='flex flex-wrap md:flex-col md:flex-nowrap gap-1'>
                            {links.map((l) => (
                                <NavLink key={l.to} to={l.to} end={l.end}
                                    className={({ isActive }) => `flex items-center justify-start gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition md:w-full ${isActive ? 'bg-primary text-white' : 'text-text-dark hover:bg-gray-100'}`}>
                                    <i className={`${l.icon} text-lg`}></i> {l.label}
                                </NavLink>
                            ))}
                            <button onClick={handleLogout}
                                className='flex items-center justify-start gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-text-light hover:bg-gray-100 hover:text-primary transition mt-1 md:w-full'>
                                <i className='ri-logout-box-r-line text-lg'></i> Logout
                            </button>
                        </nav>
                    </div>
                </aside>
                <div className='flex-1 min-w-0'>
                    <Outlet />
                </div>
            </div>
        </section>
    );
};

export default DashboardLayout;
