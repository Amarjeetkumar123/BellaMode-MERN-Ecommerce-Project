import { Link, useSearchParams } from 'react-router-dom'
import { useGetMyOrdersQuery } from '../../../redux/features/orders/ordersApi'
import { orderTone } from '../../../data/orders'
import Seg from '../../../components/Seg'
import OrderCard from '../../account/OrderCard'

const SHOW = [['all', 'All'], ['way', 'On the way'], ['done', 'Delivered'], ['cancel', 'Cancelled']];

const MyOrders = () => {
    const { data, isLoading } = useGetMyOrdersQuery();
    const orders = data?.data?.orders || [];
    const [sp, setSp] = useSearchParams();
    const show = SHOW.some(([v]) => v === sp.get('show')) ? sp.get('show') : 'all';
    const list = orders.filter((o) => show === 'all' || orderTone(o.status) === show);
    // the newest open order starts unfolded, so tracking is one glance away
    const firstOpen = list.find((o) => orderTone(o.status) === 'way');

    return (
        <>
            <div className='wf-abar'>
                <div><p className='wf-kick'>Orders</p><h1>Your orders</h1></div>
                {orders.length > 0 && <Seg label='Show orders' options={SHOW} value={show} onChange={(v) => setSp(v === 'all' ? {} : { show: v }, { replace: true })} />}
            </div>
            {isLoading ? <p className='wf-muted'>Loading…</p> : orders.length === 0 ? (
                <div className='wf-blank'><b>No orders yet</b>Everything you order shows up here, with tracking.<br /><Link to='/' className='wf-btn wf-btn--sm'>Start shopping</Link></div>
            ) : list.length === 0 ? (
                <div className='wf-blank'><b>Nothing here</b>No orders with this status.</div>
            ) : list.map((o) => <OrderCard key={o._id} order={o} open={o === firstOpen} />)}
        </>
    );
};

export default MyOrders;
