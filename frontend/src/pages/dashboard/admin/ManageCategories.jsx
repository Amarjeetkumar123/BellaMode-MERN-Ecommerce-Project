import React, { useState } from 'react'
import {
    useGetCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} from '../../../redux/features/categories/categoriesApi'
import ImageInput from '../../../components/ImageInput'

const AUDIENCES = ['men', 'women', 'girls', 'boys', 'kids', 'unisex'];
const blank = { name: '', audience: 'men', image: '', sortOrder: 0 };

const ManageCategories = () => {
    const { data, isLoading } = useGetCategoriesQuery();
    const [createCategory] = useCreateCategoryMutation();
    const [updateCategory] = useUpdateCategoryMutation();
    const [deleteCategory] = useDeleteCategoryMutation();
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
            if (editingId) await updateCategory({ id: editingId, ...payload }).unwrap();
            else await createCategory(payload).unwrap();
            reset();
            setMsg('Saved.');
        } catch (err) { setMsg(err?.data?.message || 'Save failed.'); }
    };

    const startEdit = (c) => { setEditingId(c._id); setForm({ name: c.name, audience: c.audience, image: c.image || '', sortOrder: c.sortOrder || 0 }); };
    const handleDelete = async (id) => { if (window.confirm('Delete category?')) await deleteCategory(id); };

    return (
        <div>
            <h2 className='text-2xl font-semibold mb-6'>Manage Categories</h2>
            <form onSubmit={handleSubmit} className='bg-primary-light p-4 rounded space-y-3 mb-8'>
                <h3 className='font-semibold'>{editingId ? 'Edit Category' : 'New Category'}</h3>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                    <input required placeholder='Name' value={form.name} onChange={(e) => setField('name', e.target.value)} className='border p-2 rounded' />
                    <select value={form.audience} onChange={(e) => setField('audience', e.target.value)} className='border p-2 rounded capitalize'>
                        {AUDIENCES.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <input type='number' placeholder='Sort order' value={form.sortOrder} onChange={(e) => setField('sortOrder', e.target.value)} className='border p-2 rounded' />
                </div>
                <ImageInput value={form.image} onChange={(url) => setField('image', url)} />
                {msg && <p className='text-primary text-sm'>{msg}</p>}
                <div className='flex gap-2'>
                    <button className='px-5 py-2 bg-primary text-white rounded'>{editingId ? 'Update' : 'Create'}</button>
                    {editingId && <button type='button' onClick={reset} className='px-5 py-2 bg-gray-300 rounded'>Cancel</button>}
                </div>
            </form>

            {isLoading ? <p>Loading…</p> : (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
                    {categories.map((c) => (
                        <div key={c._id} className='border rounded p-3'>
                            {c.image && <img src={c.image} alt='' className='w-full h-24 object-cover rounded mb-2' />}
                            <p className='font-medium'>{c.name}</p>
                            <p className='text-xs text-gray-500 capitalize'>{c.audience}</p>
                            <div className='mt-2 text-sm'>
                                <button onClick={() => startEdit(c)} className='text-blue-600 mr-3'>Edit</button>
                                <button onClick={() => handleDelete(c._id)} className='text-red-600'>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageCategories;
