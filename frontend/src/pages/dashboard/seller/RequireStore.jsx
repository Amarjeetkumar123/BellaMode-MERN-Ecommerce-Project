import React from 'react'
import { Link } from 'react-router-dom'
import { useMyStoreId } from '../../../hooks/useMyStoreId'

// Wraps seller-dashboard pages: if the user has no store yet, prompt them to create
// one instead of firing store-scoped requests with a null storeId.
const RequireStore = ({ children }) => {
    const storeId = useMyStoreId();
    if (storeId) return children;
    return (
        <div className='text-center py-16'>
            <i className='ri-store-2-line text-4xl text-text-light mb-3 block'></i>
            <p className='font-medium text-text-dark'>You don't have a store yet</p>
            <p className='text-sm text-text-light mt-1 mb-5'>Open your store to start managing products and orders.</p>
            <Link to='/dashboard/create-store' className='btn !rounded-lg'>Open your store</Link>
        </div>
    );
};

export default RequireStore;
