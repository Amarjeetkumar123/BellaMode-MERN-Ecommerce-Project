import React, { useState } from 'react'
import {
    useGetStoreCategoriesQuery,
    useCreateStoreCategoryMutation,
    useUpdateStoreCategoryMutation,
    useDeleteStoreCategoryMutation,
} from '../../../redux/features/stores/storeApi'
import { useMyStoreId } from '../../../hooks/useMyStoreId'
import ImageInput from '../../../components/ImageInput'
import { card, input, primaryBtn, ghostBtn, titleFont } from './adminUI'

const AUDIENCES = ['men', 'women', 'kids', 'unisex'];
const blank = { name: '', audience: 'men', image: '', sortOrder: 0 };

const ManageCategories = () => {
    const storeId = useMyStoreId();
    const { data, isLoading } = useGetStoreCategoriesQuery({ storeId });
    const [createCategory] = useCreateStoreCategoryMutation();
    const [updateCategory] = useUpdateStoreCategoryMutation();
    const [deleteCategory] = useDeleteStoreCategoryMutation();
    const categories = data?.data?.categories || [];

    const [form, setForm] = useState(blank);
    const [editingId, setEditingId] = useState(null);
    const [msg, setMsg] = useState('');
    const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const reset = () => { setForm(blank); setEditingId(null); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        const payload = { name: form.name, audience: form.audience, image: form.image, sortOrder: Number(form.sortOrder) || 0 };
        try {
            if (editingId) await updateCategory({ storeId, id: editingId, ...payload }).unwrap();
            else await createCategory({ storeId, ...payload }).unwrap();
            reset();
            setMsg('Saved.');
        } catch (err) { setMsg(err?.data?.message || 'Save failed.'); }
    };

    const startEdit = (c) => { setEditingId(c._id); setForm({ name: c.name, audience: c.audience, image: c.image || '', sortOrder: c.sortOrder || 0 }); };
    const handleDelete = async (id) => { if (window.confirm('Delete category?')) await deleteCategory({ storeId, id }); };

    return (
        <div>
            <h2 className='text-2xl font-bold mb-6' style={titleFont}>Manage Categories</h2>
            <form onSubmit={handleSubmit} className={`${card} space-y-4 mb-8`}>
                <h3 className='font-semibold' style={titleFont}>{editingId ? 'Edit Category' : 'New Category'}</h3>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                    <input required placeholder='Name' value={form.name} onChange={(e) => setField('name', e.target.value)} className={input} />
                    <select value={form.audience} onChange={(e) => setField('audience', e.target.value)} className={`${input} capitalize`}>
                        {AUDIENCES.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <input type='number' placeholder='Sort order' value={form.sortOrder} onChange={(e) => setField('sortOrder', e.target.value)} className={input} />
                </div>
                <ImageInput value={form.image} onChange={(url) => setField('image', url)} />
                {msg && <p className='text-primary text-sm'>{msg}</p>}
                <div className='flex gap-2'>
                    <button className={primaryBtn}>{editingId ? 'Update Category' : 'Create Category'}</button>
                    {editingId && <button type='button' onClick={reset} className={ghostBtn}>Cancel</button>}
                </div>
            </form>

            {isLoading ? <p>Loading…</p> : (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
                    {categories.map((c) => (
                        <div key={c._id} className='bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition'>
                            {c.image && <img src={c.image} alt='' className='w-full h-28 object-cover' />}
                            <div className='p-3'>
                                <p className='font-medium'>{c.name}</p>
                                <p className='text-xs text-text-light capitalize'>{c.audience}</p>
                                <div className='mt-2 text-sm flex gap-3'>
                                    <button onClick={() => startEdit(c)} className='text-blue-600 hover:underline'>Edit</button>
                                    <button onClick={() => handleDelete(c._id)} className='text-primary hover:underline'>Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageCategories;
