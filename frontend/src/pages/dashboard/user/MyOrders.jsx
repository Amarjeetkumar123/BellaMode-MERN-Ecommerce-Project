import { Link } from 'react-router-dom'
import { useGetMyOrdersQuery } from '../../../redux/features/orders/ordersApi'
import { formatINR } from '../../../utils/formatCurrency'

const STATUS_STYLE = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};
const badge = (s) => STATUS_STYLE[(s || '').toLowerCase()] || 'bg-gray-100 text-gray-700';

const MyOrders = () => {
    const { data, isLoading } = useGetMyOrdersQuery();
    const orders = data?.data?.orders || [];

    if (isLoading) return <p>Loading…</p>;

    return (
        <div>
            <h2 className='text-2xl font-bold mb-6' style={{ fontFamily: 'var(--header-font)' }}>My Orders</h2>
            {orders.length === 0 ? (
                <div className='text-center py-16 text-text-light bg-white border border-gray-100 rounded-2xl'>
                    <i className='ri-shopping-bag-line text-4xl mb-3 block'></i>
                    You have no orders yet. <Link to='/shop' className='text-primary font-medium'>Start shopping</Link>.
                </div>
            ) : (
                <div className='space-y-4'>
                    {orders.map((o) => (
                        <div key={o._id} className='bg-white border border-gray-100 rounded-2xl p-5 shadow-sm'>
                            <div className='flex justify-between items-center flex-wrap gap-2 pb-3 border-b'>
                                <div>
                                    <span className='font-mono text-sm font-medium'>#{o._id.slice(-8).toUpperCase()}</span>
                                    <span className='text-xs text-text-light ml-2'>{new Date(o.create_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                                <div className='flex gap-2'>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${badge(o.status)}`}>{o.status}</span>
                                    <span className='px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600'>{o.paymentMethod} · {o.paymentStatus}</span>
                                </div>
                            </div>
                            <div className='mt-3 space-y-1.5 text-sm'>
                                {o.items.map((it, i) => (
                                    <div key={i} className='flex justify-between text-text-light'>
                                        <span>{it.name} × {it.quantity}{it.size ? ` (${it.size})` : ''}</span>
                                        <span className='text-text-dark'>{formatINR(it.price * it.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className='flex justify-end mt-3 pt-3 border-t font-semibold'>
                                Total: <span className='ml-1'>{formatINR(o.totalPrice)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;
