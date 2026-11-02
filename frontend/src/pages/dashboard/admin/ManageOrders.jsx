import { useState } from 'react'
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from '../../../redux/features/orders/ordersApi'
import { formatINR } from '../../../utils/formatCurrency'
import AdminPager from './AdminPager'
import { card, input, statusPill } from './adminUI'
import { AdminHead } from './AdminParts'

const STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const ManageOrders = () => {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useGetAllOrdersQuery({ limit: 20, page });
    const [updateStatus] = useUpdateOrderStatusMutation();
    const orders = data?.data?.orders || [];
    const totalPages = data?.data?.totalPages || 1;
    const total = data?.data?.total || orders.length;

    const handleStatus = async (id, status) => { await updateStatus({ id, status }); };

    if (isLoading) return <p className='wf-muted'>Loading…</p>;

    return (
        <div>
            <AdminHead title='All orders' sub='Change a status and the customer sees it in their account.' />
            {orders.length === 0 ? (
                <div className='wf-blank'><b>No orders yet</b>New orders appear here as soon as they’re placed.</div>
            ) : (
                <div className={`${card} !p-0 overflow-hidden`}>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                            <thead><tr>
                                <th className='text-left'>Order</th><th className='text-left'>Customer</th><th className='text-left'>Total</th><th className='text-left'>Payment</th><th className='text-left'>Status</th>
                            </tr></thead>
                            <tbody>
                                {orders.map((o) => (
                                    <tr key={o._id}>
                                        <td>
                                            <div className='font-bold'>#{o._id.slice(-8).toUpperCase()}</div>
                                            <div className='text-xs wf-muted'>{o.items.length} item{o.items.length === 1 ? '' : 's'} · {new Date(Number(o.create_date)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                                        </td>
                                        <td>{o.user?.username || '—'}<div className='text-xs wf-muted'>{o.shippingAddress?.city}</div></td>
                                        <td className='font-bold tabular-nums'>{formatINR(o.totalPrice)}</td>
                                        <td>{o.paymentMethod === 'COD' ? 'Cash on delivery' : 'Online'}<div className='text-xs wf-muted'>{{ PAID: 'Paid', PENDING: 'Not paid', REFUNDED: 'Refunded', FAILED: 'Failed' }[o.paymentStatus] || o.paymentStatus}</div></td>
                                        <td>
                                            <div className='flex flex-col items-start gap-1.5'>
                                                <span className={statusPill(o.status)}>{(o.status || '').toLowerCase()}</span>
                                                {o.cancelReason && <span className='text-xs wf-muted'>Customer: “{o.cancelReason}”</span>}
                                                <select value={o.status} onChange={(e) => handleStatus(o._id, e.target.value)} className={`${input} !min-h-0 !py-1.5 !w-auto text-sm`} aria-label={`Status of order ${o._id.slice(-8).toUpperCase()}`}>
                                                    {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <AdminPager page={page} totalPages={totalPages} total={total} onChange={setPage} label='orders' />
                </div>
            )}
        </div>
    );
};

export default ManageOrders;
