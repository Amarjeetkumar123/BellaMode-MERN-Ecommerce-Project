import React from 'react'
import { useGetProductsQuery } from '../../../redux/features/products/productsApi'
import { useGetAllOrdersQuery } from '../../../redux/features/orders/ordersApi'
import { useGetCategoriesQuery } from '../../../redux/features/categories/categoriesApi'
import { formatINR } from '../../../utils/formatCurrency'

const Stat = ({ label, value }) => (
    <div className='p-6 bg-primary-light rounded'>
        <p className='text-sm text-gray-500'>{label}</p>
        <p className='text-2xl font-bold'>{value}</p>
    </div>
);

const AdminDashboard = () => {
    const { data: prod } = useGetProductsQuery({ limit: 1 });
    const { data: orders } = useGetAllOrdersQuery({ limit: 100 });
    const { data: cats } = useGetCategoriesQuery();

    const orderList = orders?.data?.orders || [];
    const revenue = orderList.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    return (
        <div>
            <h2 className='text-2xl font-semibold mb-6'>Admin Overview</h2>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <Stat label='Products' value={prod?.data?.total ?? '—'} />
                <Stat label='Categories' value={cats?.data?.categories?.length ?? '—'} />
                <Stat label='Orders' value={orders?.data?.total ?? orderList.length} />
                <Stat label='Revenue' value={formatINR(revenue)} />
            </div>
        </div>
    );
};

export default AdminDashboard;
