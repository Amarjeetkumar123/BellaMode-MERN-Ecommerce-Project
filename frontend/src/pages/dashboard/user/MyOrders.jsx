import React from 'react'
import { useGetMyOrdersQuery } from '../../../redux/features/orders/ordersApi'
import { formatINR } from '../../../utils/formatCurrency'

const MyOrders = () => {
    const { data, isLoading } = useGetMyOrdersQuery();
    const orders = data?.data?.orders || [];

    if (isLoading) return <p>Loading…</p>;

    return (
        <div>
            <h2 className='text-2xl font-semibold mb-6'>My Orders</h2>
            {orders.length === 0 ? (
                <p className='text-gray-500'>You have no orders yet.</p>
            ) : (
                <div className='space-y-4'>
                    {orders.map((o) => (
                        <div key={o._id} className='border rounded p-4'>
                            <div className='flex justify-between flex-wrap gap-2'>
                                <span className='font-mono text-sm text-gray-500'>#{o._id.slice(-8)}</span>
                                <span className='text-sm'>{new Date(o.create_date).toLocaleDateString('en-IN')}</span>
                            </div>
                            <div className='mt-2 text-sm'>
                                {o.items.map((it, i) => (
                                    <div key={i} className='flex justify-between'>
                                        <span>{it.name} × {it.quantity}{it.size ? ` (${it.size})` : ''}</span>
                                        <span>{formatINR(it.price * it.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className='flex justify-between mt-2 font-semibold'>
                                <span>Total: {formatINR(o.totalPrice)}</span>
                                <span className='flex gap-2'>
                                    <span className='px-2 py-0.5 bg-gray-100 rounded text-sm'>{o.status}</span>
                                    <span className='px-2 py-0.5 bg-gray-100 rounded text-sm'>{o.paymentMethod} · {o.paymentStatus}</span>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;
