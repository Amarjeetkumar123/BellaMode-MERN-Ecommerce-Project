import React from 'react'
import { Link } from 'react-router-dom'
import { useMyStoreId } from '../../../hooks/useMyStoreId'
import { useGetStoreQuery } from '../../../redux/features/stores/storeApi'

// A small banner telling the seller how visible their store currently is. Sellers
// can always manage their catalogue; approval only controls buyer-facing visibility.
const StatusBanner = ({ status }) => {
    if (status === 'approved') return null;
    const style = status === 'suspended'
        ? { box: 'bg-red-50 border-red-200 text-red-700', icon: 'ri-error-warning-line', text: 'Your store is suspended. Your products are hidden from the marketplace. Contact the platform team for help.' }
        : { box: 'bg-amber-50 border-amber-200 text-amber-700', icon: 'ri-time-line', text: 'Your store is pending review. You can set up your catalogue now — products go live on the marketplace once an admin approves your store.' };
    return (
        <div className={`flex items-start gap-2.5 border rounded-xl px-4 py-3 mb-5 text-sm ${style.box}`}>
            <i className={`${style.icon} text-lg mt-0.5`}></i>
            <p>{style.text}</p>
        </div>
    );
};

// Wraps seller-dashboard pages: if the user has no store yet, prompt them to create
// one instead of firing store-scoped requests with a null storeId. Otherwise render
// the page with a visibility banner reflecting the store's approval status.
const RequireStore = ({ children }) => {
    const storeId = useMyStoreId();
    const { data } = useGetStoreQuery(storeId, { skip: !storeId });

    if (!storeId) {
        return (
            <div className='text-center py-16'>
                <i className='ri-store-2-line text-4xl text-text-light mb-3 block'></i>
                <p className='font-medium text-text-dark'>You don't have a store yet</p>
                <p className='text-sm text-text-light mt-1 mb-5'>Open your store to start managing products and orders.</p>
                <Link to='/dashboard/create-store' className='btn !rounded-lg'>Open your store</Link>
            </div>
        );
    }

    return (
        <>
            <StatusBanner status={data?.data?.store?.status} />
            {children}
        </>
    );
};

export default RequireStore;
