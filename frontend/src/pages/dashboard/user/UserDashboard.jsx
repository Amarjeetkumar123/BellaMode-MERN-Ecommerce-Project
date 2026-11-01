import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useGetMyOrdersQuery } from '../../../redux/features/orders/ordersApi'
import { formatINR } from '../../../utils/formatCurrency'

const UserDashboard = () => {
    const { user } = useSelector((s) => s.auth);
    const { data } = useGetMyOrdersQuery();
    const orders = data?.data?.orders || [];
    const spent = orders.reduce((s, o) => s + (o.totalPrice || 0), 0);

    const cards = [
        { to: '/dashboard/orders', icon: 'ri-shopping-bag-line', title: 'My Orders', desc: 'View your order history & status.' },
        { to: '/dashboard/profile', icon: 'ri-user-settings-line', title: 'Profile', desc: 'Update your personal details.' },
        { to: '/shop', icon: 'ri-store-2-line', title: 'Continue Shopping', desc: 'Discover the latest arrivals.' },
    ];

    return (
        <div>
            <h2 className='text-2xl font-bold mb-1' style={{ fontFamily: 'var(--header-font)' }}>Welcome back, {user?.username} 👋</h2>
            <p className='text-text-light mb-6'>Here&apos;s what&apos;s happening with your account.</p>

            <div className='grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8'>
                <div className='bg-white border border-gray-100 rounded-2xl p-5 shadow-sm'>
                    <p className='text-sm text-text-light'>Total Orders</p>
                    <p className='text-2xl font-bold'>{orders.length}</p>
                </div>
                <div className='bg-white border border-gray-100 rounded-2xl p-5 shadow-sm'>
                    <p className='text-sm text-text-light'>Total Spent</p>
                    <p className='text-2xl font-bold'>{formatINR(spent)}</p>
                </div>
                <div className='bg-white border border-gray-100 rounded-2xl p-5 shadow-sm'>
                    <p className='text-sm text-text-light'>Member</p>
                    <p className='text-2xl font-bold capitalize'>{(user?.role || 'user').toLowerCase()}</p>
                </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                {cards.map((c) => (
                    <Link key={c.to} to={c.to} className='group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition'>
                        <span className='w-11 h-11 grid place-content-center rounded-xl bg-primary-light text-primary text-xl mb-3'>
                            <i className={c.icon}></i>
                        </span>
                        <h3 className='font-semibold group-hover:text-primary transition'>{c.title}</h3>
                        <p className='text-sm text-text-light'>{c.desc}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default UserDashboard;
