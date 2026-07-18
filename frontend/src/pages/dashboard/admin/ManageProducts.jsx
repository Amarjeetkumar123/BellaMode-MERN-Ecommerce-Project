import React, { useState } from 'react'
import {
    useGetProductsQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
} from '../../../redux/features/products/productsApi'
import { useGetCategoriesQuery } from '../../../redux/features/categories/categoriesApi'
import ImageInput from '../../../components/ImageInput'
import { formatINR } from '../../../utils/formatCurrency'

const AUDIENCES = ['men', 'women', 'girls', 'boys', 'kids', 'unisex'];
const blank = { name: '', description: '', price: '', oldPrice: '', audience: 'men', category: '', brand: '', colors: '', sizes: '', stock: '', image: '', isTrending: false, isFeatured: false };

const ManageProducts = () => {
    const { data, isLoading } = useGetProductsQuery({ limit: 100 });
    const { data: catData } = useGetCategoriesQuery();
    const [createProduct] = useCreateProductMutation();
    const [updateProduct] = useUpdateProductMutation();
    const [deleteProduct] = useDeleteProductMutation();

    const products = data?.data?.products || [];
    const categories = catData?.data?.categories || [];

    const [form, setForm] = useState(blank);
    const [editingId, setEditingId] = useState(null);
    const [msg, setMsg] = useState('');
    const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const startEdit = (p) => {
        setEditingId(p._id);
        setForm({
            name: p.name, description: p.description || '', price: p.price, oldPrice: p.oldPrice || '',
            audience: p.audience, category: p.category?._id || p.category, brand: p.brand || '',
            colors: (p.colors || []).join(', '), sizes: (p.sizes || []).join(', '), stock: p.stock ?? '',
            image: (p.images && p.images[0]) || '', isTrending: p.isTrending, isFeatured: p.isFeatured,
        });
        window.scrollTo(0, 0);
    };

    const reset = () => { setForm(blank); setEditingId(null); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        const payload = {
            name: form.name,
            description: form.description,
            price: Number(form.price),
            audience: form.audience,
            category: form.category,
            brand: form.brand,
            colors: form.colors ? form.colors.split(',').map((s) => s.trim()).filter(Boolean) : [],
            sizes: form.sizes ? form.sizes.split(',').map((s) => s.trim()).filter(Boolean) : [],
            stock: Number(form.stock) || 0,
            images: form.image ? [form.image] : [],
            isTrending: form.isTrending,
            isFeatured: form.isFeatured,
        };
        if (form.oldPrice) payload.oldPrice = Number(form.oldPrice);
        try {
            if (editingId) await updateProduct({ id: editingId, ...payload }).unwrap();
            else await createProduct(payload).unwrap();
            setMsg(editingId ? 'Product updated.' : 'Product created.');
            reset();
        } catch (err) {
            setMsg(err?.data?.message || 'Save failed.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        await deleteProduct(id);
    };

    return (
        <div>
            <h2 className='text-2xl font-semibold mb-6'>Manage Products</h2>

            <form onSubmit={handleSubmit} className='bg-primary-light p-4 rounded space-y-3 mb-8'>
                <h3 className='font-semibold'>{editingId ? 'Edit Product' : 'New Product'}</h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    <input required placeholder='Name' value={form.name} onChange={(e) => setField('name', e.target.value)} className='border p-2 rounded' />
                    <input required type='number' placeholder='Price (₹)' value={form.price} onChange={(e) => setField('price', e.target.value)} className='border p-2 rounded' />
                    <input type='number' placeholder='Old Price (₹)' value={form.oldPrice} onChange={(e) => setField('oldPrice', e.target.value)} className='border p-2 rounded' />
                    <input type='number' placeholder='Stock' value={form.stock} onChange={(e) => setField('stock', e.target.value)} className='border p-2 rounded' />
                    <select value={form.audience} onChange={(e) => setField('audience', e.target.value)} className='border p-2 rounded capitalize'>
                        {AUDIENCES.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <select required value={form.category} onChange={(e) => setField('category', e.target.value)} className='border p-2 rounded'>
                        <option value=''>Select category…</option>
                        {categories.map((c) => <option key={c._id} value={c._id}>{c.name} ({c.audience})</option>)}
                    </select>
                    <input placeholder='Brand' value={form.brand} onChange={(e) => setField('brand', e.target.value)} className='border p-2 rounded' />
                    <input placeholder='Colors (comma separated)' value={form.colors} onChange={(e) => setField('colors', e.target.value)} className='border p-2 rounded' />
                    <input placeholder='Sizes (comma separated)' value={form.sizes} onChange={(e) => setField('sizes', e.target.value)} className='border p-2 rounded' />
                </div>
                <textarea placeholder='Description' value={form.description} onChange={(e) => setField('description', e.target.value)} className='border p-2 rounded w-full' rows={2} />
                <ImageInput value={form.image} onChange={(url) => setField('image', url)} />
                <div className='flex gap-4'>
                    <label className='flex items-center gap-1'><input type='checkbox' checked={form.isTrending} onChange={(e) => setField('isTrending', e.target.checked)} /> Trending</label>
                    <label className='flex items-center gap-1'><input type='checkbox' checked={form.isFeatured} onChange={(e) => setField('isFeatured', e.target.checked)} /> Featured</label>
                </div>
                {msg && <p className='text-primary text-sm'>{msg}</p>}
                <div className='flex gap-2'>
                    <button className='px-5 py-2 bg-primary text-white rounded'>{editingId ? 'Update' : 'Create'}</button>
                    {editingId && <button type='button' onClick={reset} className='px-5 py-2 bg-gray-300 rounded'>Cancel</button>}
                </div>
            </form>

            {isLoading ? <p>Loading…</p> : (
                <div className='overflow-x-auto'>
                    <table className='w-full text-sm border'>
                        <thead className='bg-gray-100'><tr>
                            <th className='p-2 text-left'>Product</th><th className='p-2'>Audience</th><th className='p-2'>Price</th><th className='p-2'>Stock</th><th className='p-2'>Actions</th>
                        </tr></thead>
                        <tbody>
                            {products.map((p) => (
                                <tr key={p._id} className='border-t'>
                                    <td className='p-2 flex items-center gap-2'>
                                        <img src={(p.images && p.images[0])} alt='' className='w-10 h-10 object-cover rounded' />{p.name}
                                    </td>
                                    <td className='p-2 text-center capitalize'>{p.audience}</td>
                                    <td className='p-2 text-center'>{formatINR(p.price)}</td>
                                    <td className='p-2 text-center'>{p.stock}</td>
                                    <td className='p-2 text-center whitespace-nowrap'>
                                        <button onClick={() => startEdit(p)} className='text-blue-600 mr-3'>Edit</button>
                                        <button onClick={() => handleDelete(p._id)} className='text-red-600'>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ManageProducts;
