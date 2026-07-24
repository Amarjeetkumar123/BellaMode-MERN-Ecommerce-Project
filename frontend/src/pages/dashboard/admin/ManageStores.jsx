import React, { useState } from 'react'
import { useListStoresQuery, useUpdateStoreStatusMutation } from '../../../redux/features/stores/storeApi'
import { card, input, titleFont } from './adminUI'
import AdminPager from './AdminPager'

const TABS = [
    { key: '', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'suspended', label: 'Suspended' },
];

const STATUS_PILL = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    suspended: 'bg-red-100 text-red-700',
};

// One store row — keeps its own commission draft so editing one store never
// re-renders the others' inputs.
const StoreRow = ({ store, onStatus, busy }) => {
    const [commission, setCommission] = useState(store.commissionRate ?? 0);
    const dirty = Number(commission) !== Number(store.commissionRate ?? 0);
    return (
        <tr className='border-t border-gray-100 hover:bg-gray-50/50'>
            <td className='p-3'>
                <div className='font-medium'>{store.name}</div>
                <div className='text-xs text-text-light'>/{store.slug}</div>
            </td>
            <td className='p-3 text-xs text-text-light'>
                {store.owner?.username || store.owner?.email || String(store.owner).slice(-6)}
            </td>
            <td className='p-3 text-center'>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_PILL[store.status] || 'bg-gray-100'}`}>{store.status}</span>
            </td>
            <td className='p-3 text-center'>
                <div className='flex items-center justify-center gap-1.5'>
                    <input type='number' min='0' max='100' value={commission}
                        onChange={(e) => setCommission(e.target.value)}
                        className={`${input} !py-1.5 !w-20 text-center`} />
                    <span className='text-xs text-text-light'>%</span>
                    <button disabled={!dirty || busy}
                        onClick={() => onStatus(store, store.status, Number(commission))}
                        className='text-xs text-primary hover:underline disabled:opacity-30 disabled:no-underline'>Save</button>
                </div>
            </td>
            <td className='p-3'>
                <div className='flex items-center justify-center gap-2'>
                    {store.status !== 'approved' && (
                        <button disabled={busy} onClick={() => onStatus(store, 'approved')}
                            className='px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition disabled:opacity-50'>Approve</button>
                    )}
                    {store.status !== 'suspended' && (
                        <button disabled={busy} onClick={() => onStatus(store, 'suspended')}
                            className='px-3 py-1.5 rounded-lg bg-gray-100 text-red-600 text-xs font-medium hover:bg-red-50 transition disabled:opacity-50'>Suspend</button>
                    )}
                </div>
            </td>
        </tr>
    );
};

const ManageStores = () => {
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const { data, isLoading, isFetching } = useListStoresQuery({ status: status || undefined, page, limit: 20 });
    const [updateStatus, { isLoading: saving }] = useUpdateStoreStatusMutation();

    const stores = data?.data?.stores || [];
    const totalPages = data?.data?.totalPages || 1;
    const total = data?.data?.total ?? stores.length;

    const onStatus = async (store, nextStatus, commissionRate) => {
        const body = { storeId: store._id, status: nextStatus };
        if (commissionRate !== undefined) body.commissionRate = commissionRate;
        try { await updateStatus(body).unwrap(); } catch (e) { /* toast handled globally */ }
    };

    return (
        <div>
            <h2 className='text-2xl font-bold mb-6' style={titleFont}>Manage Stores</h2>

            <div className='flex flex-wrap gap-2 mb-4'>
                {TABS.map((t) => (
                    <button key={t.key} onClick={() => { setStatus(t.key); setPage(1); }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${status === t.key ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-text-dark hover:bg-gray-50'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            <div className={`${card} !p-0 overflow-hidden`}>
                {isLoading ? (
                    <p className='p-6 text-text-light'>Loading…</p>
                ) : stores.length === 0 ? (
                    <p className='p-6 text-text-light'>No stores{status ? ` with status “${status}”` : ''} yet.</p>
                ) : (
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                            <thead className='bg-gray-50 text-text-light'><tr>
                                <th className='p-3 text-left font-medium'>Store</th>
                                <th className='p-3 font-medium'>Owner</th>
                                <th className='p-3 font-medium'>Status</th>
                                <th className='p-3 font-medium'>Commission</th>
                                <th className='p-3 font-medium'>Actions</th>
                            </tr></thead>
                            <tbody>
                                {stores.map((s) => (
                                    <StoreRow key={s._id} store={s} onStatus={onStatus} busy={saving || isFetching} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <AdminPager page={page} totalPages={totalPages} total={total} onChange={setPage} label='stores' />
            </div>
        </div>
    );
};

export default ManageStores;
