import React, { useState } from 'react'
import { useGetStoreOrdersQuery, useUpdateStoreOrderStatusMutation } from '../../../redux/features/stores/storeApi'
import { useMyStoreId } from '../../../hooks/useMyStoreId'
import { formatINR } from '../../../utils/formatCurrency'
import AdminPager from './AdminPager'
import { card, input, titleFont, statusPill } from './adminUI'

const STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const ManageOrders = () => {
    const storeId = useMyStoreId();
    const [page, setPage] = useState(1);
    const { data, isLoading } = useGetStoreOrdersQuery({ storeId, limit: 20, page });
    const [updateStatus] = useUpdateStoreOrderStatusMutation();
    const orders = data?.data?.orders || [];
    const totalPages = data?.data?.totalPages || 1;
    const total = data?.data?.total || orders.length;

    const handleStatus = async (id, status) => { await updateStatus({ storeId, id, status }); };

    if (isLoading) return <p>Loading…</p>;

    return (
        <div>
            <h2 className='text-2xl font-bold mb-6' style={titleFont}>All Orders</h2>
            {orders.length === 0 ? (
                <div className={`${card} text-center py-14 text-text-light`}>
                    <i className='ri-inbox-line text-4xl mb-3 block'></i>No orders yet.
                </div>
            ) : (
                <div className={`${card} !p-0 overflow-hidden`}>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                            <thead className='bg-gray-50 text-text-light'><tr>
                                <th className='p-3 text-left font-medium'>Order</th><th className='p-3 font-medium'>Customer</th><th className='p-3 font-medium'>Total</th><th className='p-3 font-medium'>Payment</th><th className='p-3 font-medium'>Status</th>
                            </tr></thead>
                            <tbody>
                                {orders.map((o) => (
                                    <tr key={o._id} className='border-t border-gray-100 hover:bg-gray-50/50'>
                                        <td className='p-3'>
                                            <div className='font-mono font-medium'>#{o._id.slice(-8).toUpperCase()}</div>
                                            <div className='text-xs text-text-light'>{o.items.length} item(s)</div>
                                        </td>
                                        <td className='p-3 text-center'>{o.user?.username || '—'}</td>
                                        <td className='p-3 text-center font-medium'>{formatINR(o.totalPrice)}</td>
                                        <td className='p-3 text-center'>{o.paymentMethod}<br /><span className='text-xs text-text-light capitalize'>{o.paymentStatus}</span></td>
                                        <td className='p-3 text-center'>
                                            <div className='flex flex-col items-center gap-1.5'>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusPill(o.status)}`}>{o.status}</span>
                                                <select value={o.status} onChange={(e) => handleStatus(o._id, e.target.value)} className={`${input} !py-1 !w-auto text-xs`}>
                                                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
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
