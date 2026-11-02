import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useLogoutUserMutation } from '../../redux/features/auth/authApi'
import { logout } from '../../redux/features/auth/authSlice'
import AccountLayout from '../account/AccountLayout'
import { adminLinks, isAdminRole } from '../../data/adminNav'
import { initialOf } from '../../utils/user'

// the customer's own pages use the storefront account layout, for every role
const ACCOUNT_PAGES = ['/dashboard', '/dashboard/orders', '/dashboard/profile'];

// Admin pages: the same side-nav shell as the account pages, with the admin links.
const DashboardLayout = () => {
    const { user } = useSelector((s) => s.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [logoutUser] = useLogoutUserMutation();
    const { pathname } = useLocation();

    if (ACCOUNT_PAGES.includes(pathname.replace(/\/$/, ''))) return <AccountLayout />;
    // admin routes guard themselves too; this keeps a customer out of the admin shell
    if (!isAdminRole(user?.role)) return <Navigate to='/dashboard' replace />;

    const signOut = async () => {
        try { await logoutUser().unwrap(); } catch { /* signed out locally anyway */ }
        dispatch(logout());
        navigate('/');
    };

    return (
        <div className='wf-wrap wf-account wf-admin'>
            <aside className='wf-account__side'>
                <div className='wf-me'>
                    {user?.profileImage ? <img src={user.profileImage} alt='' /> : <span className='wf-mono wf-mono--lg' aria-hidden='true'>{initialOf(user)}</span>}
                    <div><b>{user?.username}</b><small style={{ textTransform: 'capitalize' }}>{(user?.role || '').toLowerCase()}</small></div>
                </div>
                <nav aria-label='Admin'>
                    <ul className='wf-anav'>
                        {adminLinks(user.role).map((l) => <li key={l.to}><NavLink to={l.to}><i className={l.icon}></i>{l.label}</NavLink></li>)}
                        <li><NavLink to='/dashboard/profile'><i className='ri-user-line'></i>My profile</NavLink></li>
                        <li><button type='button' className='out' onClick={signOut}><i className='ri-logout-box-r-line'></i>Sign out</button></li>
                    </ul>
                </nav>
            </aside>
            <section className='min-w-0'><Outlet /></section>
        </div>
    );
};

export default DashboardLayout;
