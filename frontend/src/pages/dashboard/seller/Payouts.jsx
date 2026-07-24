import React, { useEffect, useState } from 'react'
import { useMyStoreId } from '../../../hooks/useMyStoreId'
import {
    useGetStoreQuery,
    useUpdateStoreMutation,
    useGetStorePayoutsQuery,
} from '../../../redux/features/stores/storeApi'
import { formatINR } from '../../../utils/formatCurrency'
import { card, input, label, titleFont } from '../admin/adminUI'
import AdminPager from '../admin/AdminPager'

const STATUS_PILL = {
    routed: 'bg-green-100 text-green-700',
    held: 'bg-amber-100 text-amber-700',
    failed: 'bg-red-100 text-red-700',
};

const Stat = ({ label: l, value, hint, accent }) => (
    <div className={card}>
        <p className='text-xs text-text-light'>{l}</p>
        <p className={`text-2xl font-bold mt-1 ${accent || ''}`}>{value}</p>
        {hint && <p className='text-xs text-text-light mt-1'>{hint}</p>}
    </div>
);

// Lets the seller save the Razorpay Route linked-account id obtained from onboarding.
const LinkedAccountCard = ({ storeId, account }) => {
    const [value, setValue] = useState(account || '');
    const [updateStore, { isLoading }] = useUpdateStoreMutation();
    const [msg, setMsg] = useState('');
    useEffect(() => { setValue(account || ''); }, [account]);

    const save = async () => {
        setMsg('');
        try {
            await updateStore({ storeId, razorpayAccountId: value.trim() }).unwrap();
            setMsg('Saved.');
        } catch (e) {
            setMsg(e?.data?.message || 'Could not save.');
        }
    };

    return (
        <div className={card}>
            <h3 className='font-semibold mb-1' style={titleFont}>Payout account</h3>
            <p className='text-sm text-text-light mb-3'>
                Paste your Razorpay Route linked-account id (starts with <code>acc_</code>). Until it's set,
                your share of each sale is held by the platform.
            </p>
            <label className={label}>Razorpay linked account</label>
            <div className='flex gap-2'>
                <input value={value} onChange={(e) => setValue(e.target.value)} placeholder='acc_XXXXXXXXXXXX'
                    className={input} />
                <button onClick={save} disabled={isLoading} className='btn !rounded-lg whitespace-nowrap'>
                    {isLoading ? 'Saving…' : 'Save'}
                </button>
            </div>
            {msg && <p className='text-xs text-text-light mt-2'>{msg}</p>}
            {account
                ? <p className='text-xs text-green-600 mt-2'><i className='ri-checkbox-circle-line mr-1'></i>Linked — new sales route automatically.</p>
                : <p className='text-xs text-amber-600 mt-2'><i className='ri-error-warning-line mr-1'></i>Not linked yet.</p>}
        </div>
    );
};

const Payouts = () => {
    const storeId = useMyStoreId();
    const [page, setPage] = useState(1);
    const { data: storeData } = useGetStoreQuery(storeId, { skip: !storeId });
    const { data, isLoading } = useGetStorePayoutsQuery({ storeId, page, limit: 20 }, { skip: !storeId });

    const store = storeData?.data?.store;
    const summary = data?.data?.summary || {};
    const payouts = data?.data?.payouts || [];
    const totalPages = data?.data?.totalPages || 1;
    const total = data?.data?.total ?? payouts.length;

    return (
        <div>
            <h2 className='text-2xl font-bold mb-6' style={titleFont}>Earnings &amp; Payouts</h2>

            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                <Stat label='Net earnings' value={formatINR(summary.totalNet || 0)} hint={`${summary.count || 0} sales`} />
                <Stat label='Routed to you' value={formatINR(summary.routed || 0)} accent='text-green-600' />
                <Stat label='Held by platform' value={formatINR(summary.held || 0)} accent='text-amber-600' hint='Link your account to release' />
                <Stat label='Platform commission' value={formatINR(summary.totalCommission || 0)} hint='Deducted from item revenue' />
            </div>

            <div className='mb-6'>
                <LinkedAccountCard storeId={storeId} account={store?.razorpayAccountId} />
            </div>

            <div className={`${card} !p-0 overflow-hidden`}>
                {isLoading ? (
                    <p className='p-6 text-text-light'>Loading…</p>
                ) : payouts.length === 0 ? (
                    <p className='p-6 text-text-light'>No payouts yet. They appear here after a customer pays online.</p>
                ) : (
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                            <thead className='bg-gray-50 text-text-light'><tr>
                                <th className='p-3 text-left font-medium'>Order</th>
                                <th className='p-3 font-medium'>Your net</th>
                                <th className='p-3 font-medium'>Commission</th>
                                <th className='p-3 font-medium'>Status</th>
                            </tr></thead>
                            <tbody>
                                {payouts.map((p) => (
                                    <tr key={p._id} className='border-t border-gray-100 hover:bg-gray-50/50'>
                                        <td className='p-3'>
                                            <div className='font-medium'>#{String(p.order?._id || p.order).slice(-6)}</div>
                                            <div className='text-xs text-text-light'>{p.order?.items?.length || 0} item(s)</div>
                                        </td>
                                        <td className='p-3 text-center font-medium'>{formatINR(p.amount)}</td>
                                        <td className='p-3 text-center text-text-light'>{formatINR(p.commission)}</td>
                                        <td className='p-3 text-center'>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_PILL[p.status] || 'bg-gray-100'}`}>{p.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <AdminPager page={page} totalPages={totalPages} total={total} onChange={setPage} label='payouts' />
            </div>
        </div>
    );
};

export default Payouts;
