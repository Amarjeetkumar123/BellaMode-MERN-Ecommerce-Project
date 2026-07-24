import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useCreateStoreMutation } from '../../../redux/features/stores/storeApi'
import { setUser } from '../../../redux/features/auth/authSlice'
import { card, input, primaryBtn, titleFont } from '../admin/adminUI'

// "Become a seller" — a logged-in user creates their store. On success we patch the
// cached user with { store, role:SELLER } so the dashboard can immediately address
// /api/stores/:storeId/… without a re-login.
const CreateStore = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((s) => s.auth);
    const [createStore, { isLoading }] = useCreateStoreMutation();
    const [form, setForm] = useState({ name: '', slug: '' });
    const [msg, setMsg] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        setMsg('');
        try {
            const body = { name: form.name };
            if (form.slug.trim()) body.slug = form.slug.trim();
            const res = await createStore(body).unwrap();
            const store = res?.data?.store;
            // Keep the client's user in sync with the server (role + store just changed).
            dispatch(setUser({ user: { ...user, store: store._id, role: user.role === 'SUPERADMIN' ? 'SUPERADMIN' : 'SELLER' } }));
            navigate('/dashboard/manage-products');
        } catch (err) {
            setMsg(err?.data?.message || 'Could not create store.');
        }
    };

    return (
        <div className='max-w-lg'>
            <h2 className='text-2xl font-bold mb-2' style={titleFont}>Open your store</h2>
            <p className='text-sm text-text-light mb-6'>
                Create your storefront to start listing products. Your store starts as
                <span className='font-medium'> pending</span> and goes live once the platform approves it.
            </p>
            <form onSubmit={submit} className={`${card} space-y-4`}>
                <div>
                    <label className='block text-sm font-medium mb-1'>Store name</label>
                    <input required placeholder='e.g. Nova Threads' value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} />
                </div>
                <div>
                    <label className='block text-sm font-medium mb-1'>Store handle <span className='text-text-light font-normal'>(optional)</span></label>
                    <input placeholder='nova-threads' value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })} className={input} />
                    <p className='text-xs text-text-light mt-1'>Lowercase letters, numbers and hyphens. Auto-generated from the name if left blank.</p>
                </div>
                {msg && <p className='text-primary text-sm'>{msg}</p>}
                <button className={primaryBtn} disabled={isLoading}>{isLoading ? 'Creating…' : 'Create store'}</button>
            </form>
        </div>
    );
};

export default CreateStore;
