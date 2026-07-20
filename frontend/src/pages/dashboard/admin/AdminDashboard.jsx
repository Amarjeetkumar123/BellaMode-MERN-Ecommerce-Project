import React from 'react'
import { Link } from 'react-router-dom'
import { useGetProductsQuery } from '../../../redux/features/products/productsApi'
import { useGetAllOrdersQuery } from '../../../redux/features/orders/ordersApi'
import { useGetCategoriesQuery } from '../../../redux/features/categories/categoriesApi'
import { formatINR } from '../../../utils/formatCurrency'

const Stat = ({ label, value, icon, tint }) => (
    <div className='bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4'>
        <span className={`w-12 h-12 grid place-content-center rounded-xl text-xl ${tint}`}><i className={icon}></i></span>
        <div>
            <p className='text-sm text-text-light'>{label}</p>
            <p className='text-2xl font-bold'>{value}</p>
        </div>
    </div>
);

const AdminDashboard = () => {
    const { data: prod } = useGetProductsQuery({ limit: 1 });
    const { data: orders } = useGetAllOrdersQuery({ limit: 100 });
    const { data: cats } = useGetCategoriesQuery();

    const orderList = orders?.data?.orders || [];
    const revenue = orderList.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const recent = [...orderList].slice(0, 5);

    return (
        <div>
            <h2 className='text-2xl font-bold mb-6' style={{ fontFamily: 'var(--header-font)' }}>Admin Overview</h2>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
                <Stat label='Products' value={prod?.data?.total ?? '—'} icon='ri-t-shirt-line' tint='bg-blue-100 text-blue-600' />
                <Stat label='Categories' value={cats?.data?.categories?.length ?? '—'} icon='ri-price-tag-3-line' tint='bg-amber-100 text-amber-600' />
                <Stat label='Orders' value={orders?.data?.total ?? orderList.length} icon='ri-shopping-bag-line' tint='bg-indigo-100 text-indigo-600' />
                <Stat label='Revenue' value={formatINR(revenue)} icon='ri-money-rupee-circle-line' tint='bg-green-100 text-green-600' />
            </div>

            <div className='bg-white border border-gray-100 rounded-2xl p-6 shadow-sm'>
                <div className='flex items-center justify-between mb-4'>
                    <h3 className='font-semibold' style={{ fontFamily: 'var(--header-font)' }}>Recent Orders</h3>
                    <Link to='/dashboard/manage-orders' className='text-sm text-primary font-medium'>View all</Link>
                </div>
                {recent.length === 0 ? (
                    <p className='text-text-light text-sm'>No orders yet.</p>
                ) : (
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                            <thead>
                                <tr className='text-left text-text-light border-b'>
                                    <th className='py-2 font-medium'>Order</th>
                                    <th className='py-2 font-medium'>Date</th>
                                    <th className='py-2 font-medium'>Status</th>
                                    <th className='py-2 font-medium text-right'>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.map((o) => (
                                    <tr key={o._id} className='border-b last:border-0'>
                                        <td className='py-2.5 font-mono'>#{o._id.slice(-8).toUpperCase()}</td>
                                        <td className='py-2.5 text-text-light'>{new Date(o.create_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                                        <td className='py-2.5'><span className='px-2 py-0.5 rounded-full bg-gray-100 text-xs capitalize'>{o.status}</span></td>
                                        <td className='py-2.5 text-right font-medium'>{formatINR(o.totalPrice)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
