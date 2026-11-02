import { useState } from 'react'
import {
    useGetCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} from '../../../redux/features/categories/categoriesApi'
import ImageInput from '../../../components/ImageInput'
import { card, input, primaryBtn, ghostBtn, titleFont, linkBtn } from './adminUI'
import { AdminHead, L } from './AdminParts'

const AUDIENCES = ['men', 'women', 'kids', 'unisex'];
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
            <AdminHead title='Categories' sub='Each store shows its own categories; Unisex ones (footwear, watches…) appear in every store.' />
            <form onSubmit={handleSubmit} className={`${card} space-y-4 mb-8`}>
                <h3 style={titleFont}>{editingId ? 'Edit category' : 'New category'}</h3>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                    <L t='Name'><input required value={form.name} onChange={(e) => setField('name', e.target.value)} className={input} /></L>
                    <L t='Store'><select value={form.audience} onChange={(e) => setField('audience', e.target.value)} className={`${input} capitalize`}>
                        {AUDIENCES.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select></L>
                    <L t='Sort order (lower shows first)'><input type='number' value={form.sortOrder} onChange={(e) => setField('sortOrder', e.target.value)} className={input} /></L>
                </div>
                <ImageInput label='Image' value={form.image} onChange={(url) => setField('image', url)} />
                {msg && <p className='wf-alert' role='status'>{msg}</p>}
                <div className='flex gap-2'>
                    <button className={primaryBtn}>{editingId ? 'Save category' : 'Add category'}</button>
                    {editingId && <button type='button' onClick={reset} className={ghostBtn}>Cancel</button>}
                </div>
            </form>

            {isLoading ? <p className='wf-muted'>Loading…</p> : (
                <div className='wf-atiles'>
                    {categories.map((c) => (
                        <div key={c._id} className='wf-atile'>
                            {c.image ? <img src={c.image} alt='' loading='lazy' /> : <div className='aspect-[4/3] bg-gray-100' />}
                            <div>
                                <b>{c.name}</b>
                                <small>{c.audience === 'unisex' ? 'Every store' : c.audience} · order {c.sortOrder || 0}</small>
                                <div className='wf-acts'>
                                    <button type='button' onClick={() => { startEdit(c); window.scrollTo(0, 0); }} className={linkBtn}>Edit</button>
                                    <button type='button' onClick={() => handleDelete(c._id)} className={`${linkBtn} wf-danger`}>Delete</button>
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
