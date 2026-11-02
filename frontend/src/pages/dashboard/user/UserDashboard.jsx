import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useGetMyOrdersQuery } from '../../../redux/features/orders/ordersApi'
import { useWishlist } from '../../../hooks/useWishlist'
import { formatINR } from '../../../utils/formatCurrency'
import { isOpenOrder } from '../../../data/orders'
import OrderCard from '../../account/OrderCard'
import { SkeletonOrders } from '../../../components/Loaders'

const openWishlist = () => window.dispatchEvent(new Event('wf:open-wishlist'));

const UserDashboard = () => {
    const { user } = useSelector((s) => s.auth);
    const { data, isLoading } = useGetMyOrdersQuery();
    const orders = data?.data?.orders || [];
    const { items: saved } = useWishlist();
    const first = (user?.username || '').split(' ')[0];

    return (
        <>
            <p className='wf-kick'>My account</p>
            <h1>Hi{first ? `, ${first}` : ''}</h1>
            <div className='wf-stats'>
                <Link to='/dashboard/orders' className='wf-stat'><b>{orders.length}</b><span>Orders<i className='ri-arrow-right-line'></i></span></Link>
                <Link to='/dashboard/orders?show=way' className='wf-stat'><b>{orders.filter(isOpenOrder).length}</b><span>On the way<i className='ri-arrow-right-line'></i></span></Link>
                <button type='button' className='wf-stat' onClick={openWishlist}><b>{saved.length}</b><span>Saved<i className='ri-arrow-right-line'></i></span></button>
            </div>

            <div className='wf-rowhead'><p className='wf-sub'>Latest order</p>{orders.length > 1 && <Link to='/dashboard/orders' className='wf-u'>All orders</Link>}</div>
            {isLoading ? <SkeletonOrders count={1} /> : orders[0] ? <OrderCard order={orders[0]} compact /> : (
                <div className='wf-blank'><b>No orders yet</b>When you place one, you can follow it here.<br /><Link to='/' className='wf-btn wf-btn--sm'>Start shopping</Link></div>
            )}

            <div className='wf-rowhead' style={{ marginTop: 40 }}><p className='wf-sub'>Saved for later</p>{saved.length > 0 && <button type='button' className='wf-linkbtn wf-u' onClick={openWishlist}>Open wishlist</button>}</div>
            {saved.length ? (
                <div className='wf-saved'>
                    {saved.slice(0, 4).map((p) => (
                        <Link key={p._id} to={`/shop/${p.slug || p._id}`}>
                            <div className='ph'><img src={(p.images && p.images[0]) || p.image} alt='' loading='lazy' /></div>
                            <b>{p.name}</b><span>{formatINR(p.price)}</span>
                        </Link>
                    ))}
                </div>
            ) : <div className='wf-blank'><b>Nothing saved</b>Tap the heart on any product to keep it for later.</div>}
        </>
    );
};

export default UserDashboard;
