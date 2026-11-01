import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useLogoutUserMutation } from '../../redux/features/auth/authApi'
import { logout } from '../../redux/features/auth/authSlice'
import { useGetMyOrdersQuery } from '../../redux/features/orders/ordersApi'
import { isOpenOrder } from '../../data/orders'
import { initialOf } from '../../utils/user'

// The customer's account: side nav (a scrolling tab row on phones) + the page.
const AccountLayout = () => {
    const { user } = useSelector((s) => s.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [logoutUser] = useLogoutUserMutation();
    const { data } = useGetMyOrdersQuery();
    const open = (data?.data?.orders || []).filter(isOpenOrder).length;

    const signOut = async () => {
        try { await logoutUser().unwrap(); } catch { /* signed out locally anyway */ }
        dispatch(logout());
        navigate('/');
    };

    return (
        <div className='wf-wrap wf-account'>
            <aside className='wf-account__side'>
                <div className='wf-me'>
                    {user?.profileImage ? <img src={user.profileImage} alt='' /> : <span className='wf-mono wf-mono--lg' aria-hidden='true'>{initialOf(user)}</span>}
                    <div><b>{user?.username}</b><small>{user?.email}</small></div>
                </div>
                <nav aria-label='Account'>
                    <ul className='wf-anav'>
                        <li><NavLink to='/dashboard' end><i className='ri-dashboard-line'></i>Overview</NavLink></li>
                        <li><NavLink to='/dashboard/orders'><i className='ri-box-3-line'></i>Orders{open > 0 && <span className='n'>{open}</span>}</NavLink></li>
                        <li><NavLink to='/dashboard/profile'><i className='ri-user-line'></i>Profile and addresses</NavLink></li>
                        <li><button type='button' className='out' onClick={signOut}><i className='ri-logout-box-r-line'></i>Sign out</button></li>
                    </ul>
                </nav>
            </aside>
            <section><Outlet /></section>
        </div>
    );
};

export default AccountLayout;
