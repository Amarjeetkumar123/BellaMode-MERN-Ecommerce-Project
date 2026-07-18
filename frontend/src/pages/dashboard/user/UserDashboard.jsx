import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

const UserDashboard = () => {
    const { user } = useSelector((s) => s.auth);
    return (
        <div>
            <h2 className='text-2xl font-semibold mb-2'>Welcome back, {user?.username} 👋</h2>
            <p className='text-gray-500 mb-6'>Manage your profile and track your orders.</p>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <Link to='/dashboard/orders' className='p-6 bg-primary-light rounded hover:shadow'>
                    <h3 className='font-semibold'>My Orders</h3>
                    <p className='text-sm text-gray-500'>View your order history & status.</p>
                </Link>
                <Link to='/dashboard/profile' className='p-6 bg-primary-light rounded hover:shadow'>
                    <h3 className='font-semibold'>Profile</h3>
                    <p className='text-sm text-gray-500'>Update your personal details.</p>
                </Link>
            </div>
        </div>
    );
};

export default UserDashboard;
