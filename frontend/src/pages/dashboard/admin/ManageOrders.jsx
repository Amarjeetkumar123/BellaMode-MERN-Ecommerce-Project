import React from 'react'
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from '../../../redux/features/orders/ordersApi'
import { formatINR } from '../../../utils/formatCurrency'

const STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const ManageOrders = () => {
    const { data, isLoading } = useGetAllOrdersQuery({ limit: 100 });
    const [updateStatus] = useUpdateOrderStatusMutation();
    const orders = data?.data?.orders || [];

    const handleStatus = async (id, status) => { await updateStatus({ id, status }); };

    if (isLoading) return <p>Loading…</p>;

    return (
        <div>
            <h2 className='text-2xl font-semibold mb-6'>All Orders</h2>
            {orders.length === 0 ? <p className='text-gray-500'>No orders yet.</p> : (
                <div className='overflow-x-auto'>
                    <table className='w-full text-sm border'>
                        <thead className='bg-gray-100'><tr>
                            <th className='p-2 text-left'>Order</th><th className='p-2'>Customer</th><th className='p-2'>Total</th><th className='p-2'>Payment</th><th className='p-2'>Status</th>
                        </tr></thead>
                        <tbody>
                            {orders.map((o) => (
                                <tr key={o._id} className='border-t'>
                                    <td className='p-2'>
                                        <div className='font-mono'>#{o._id.slice(-8)}</div>
                                        <div className='text-xs text-gray-500'>{o.items.length} item(s)</div>
                                    </td>
                                    <td className='p-2 text-center'>{o.user?.username || '—'}</td>
                                    <td className='p-2 text-center'>{formatINR(o.totalPrice)}</td>
                                    <td className='p-2 text-center'>{o.paymentMethod}<br /><span className='text-xs text-gray-500'>{o.paymentStatus}</span></td>
                                    <td className='p-2 text-center'>
                                        <select value={o.status} onChange={(e) => handleStatus(o._id, e.target.value)} className='border p-1 rounded'>
                                            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ManageOrders;
