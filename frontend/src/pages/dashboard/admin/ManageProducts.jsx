import { useState } from 'react'
import {
    useGetProductsQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
} from '../../../redux/features/products/productsApi'
import { useGetCategoriesQuery } from '../../../redux/features/categories/categoriesApi'
import ImageInput from '../../../components/ImageInput'
import AdminPager from './AdminPager'
import { formatINR } from '../../../utils/formatCurrency'
import { card, input, primaryBtn, ghostBtn, titleFont } from './adminUI'

const AUDIENCES = ['men', 'women', 'kids', 'unisex'];
const blank = { name: '', description: '', price: '', oldPrice: '', audience: 'men', category: '', brand: '', colors: '', sizes: '', stock: '', image: '', isTrending: false, isFeatured: false };

const ManageProducts = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    // Search runs server-side: filtering only the current page would hide matches
    // that live on other pages.
    const q = search.trim();
    const { data, isLoading } = useGetProductsQuery({ limit: 20, page, ...(q ? { search: q } : {}) });
    const { data: catData } = useGetCategoriesQuery();
    const [createProduct] = useCreateProductMutation();
    const [updateProduct] = useUpdateProductMutation();
    const [deleteProduct] = useDeleteProductMutation();

    const products = data?.data?.products || [];
    const totalPages = data?.data?.totalPages || 1;
    const total = data?.data?.total || products.length;
    const categories = catData?.data?.categories || [];

    const [form, setForm] = useState(blank);
    const [editingId, setEditingId] = useState(null);
    const [msg, setMsg] = useState('');
    const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    // Categories for the audience currently selected in the form.
    const ownCats = categories.filter((c) => c.audience === form.audience);
    // Footwear/Watches/Bags are shared `unisex` categories: a men's shoe is a men's
    // product filed under the shared Footwear category, so they stay selectable
    // for every audience (and aren't repeated when unisex is already selected).
    const sharedCats = form.audience === 'unisex' ? [] : categories.filter((c) => c.audience === 'unisex');

    // Switching audience must drop a category that no longer belongs to it,
    // otherwise the form silently keeps an invalid pairing.
    const changeAudience = (audience) => setForm((f) => {
        const allowed = categories.filter((c) => c.audience === audience || (audience !== 'unisex' && c.audience === 'unisex'));
        const stillValid = allowed.some((c) => c._id === f.category);
        return { ...f, audience, category: stillValid ? f.category : '' };
    });

    const filtered = products;

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
            <h2 className='text-2xl font-bold mb-6' style={titleFont}>Manage Products</h2>

            <form onSubmit={handleSubmit} className={`${card} space-y-4 mb-8`}>
                <h3 className='font-semibold' style={titleFont}>{editingId ? 'Edit Product' : 'New Product'}</h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    <input required placeholder='Name' value={form.name} onChange={(e) => setField('name', e.target.value)} className={input} />
                    <input required type='number' placeholder='Price (₹)' value={form.price} onChange={(e) => setField('price', e.target.value)} className={input} />
                    <input type='number' placeholder='Old Price (₹)' value={form.oldPrice} onChange={(e) => setField('oldPrice', e.target.value)} className={input} />
                    <input type='number' placeholder='Stock' value={form.stock} onChange={(e) => setField('stock', e.target.value)} className={input} />
                    <select value={form.audience} onChange={(e) => changeAudience(e.target.value)} className={`${input} capitalize`}>
                        {AUDIENCES.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <select required value={form.category} onChange={(e) => setField('category', e.target.value)} className={input}>
                        <option value=''>Select category…</option>
                        {ownCats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                        {sharedCats.length > 0 && (
                            <optgroup label='Footwear &amp; Lifestyle (shared)'>
                                {sharedCats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </optgroup>
                        )}
                    </select>
                    <input placeholder='Brand' value={form.brand} onChange={(e) => setField('brand', e.target.value)} className={input} />
                    <input placeholder='Colors (comma separated)' value={form.colors} onChange={(e) => setField('colors', e.target.value)} className={input} />
                    <input placeholder='Sizes (comma separated)' value={form.sizes} onChange={(e) => setField('sizes', e.target.value)} className={input} />
                </div>
                <textarea placeholder='Description' value={form.description} onChange={(e) => setField('description', e.target.value)} className={input} rows={2} />
                <ImageInput value={form.image} onChange={(url) => setField('image', url)} />
                <div className='flex gap-5'>
                    <label className='flex items-center gap-1.5 text-sm'><input type='checkbox' checked={form.isTrending} onChange={(e) => setField('isTrending', e.target.checked)} className='accent-primary' /> Trending</label>
                    <label className='flex items-center gap-1.5 text-sm'><input type='checkbox' checked={form.isFeatured} onChange={(e) => setField('isFeatured', e.target.checked)} className='accent-primary' /> Featured</label>
                </div>
                {msg && <p className='text-primary text-sm'>{msg}</p>}
                <div className='flex gap-2'>
                    <button className={primaryBtn}>{editingId ? 'Update Product' : 'Create Product'}</button>
                    {editingId && <button type='button' onClick={reset} className={ghostBtn}>Cancel</button>}
                </div>
            </form>

            {/* Search */}
            <div className='flex items-center justify-between flex-wrap gap-3 mb-4'>
                <div className='relative w-full sm:max-w-sm'>
                    <i className='ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-text-light'></i>
                    <input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder='Search products by name, brand, category…'
                        className={`${input} !pl-9`}
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className='absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-primary'>
                            <i className='ri-close-line'></i>
                        </button>
                    )}
                </div>
                <span className='text-sm text-text-light'>{filtered.length} of {products.length} products</span>
            </div>

            {isLoading ? <p>Loading…</p> : (
                <div className={`${card} !p-0 overflow-hidden`}>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                            <thead className='bg-gray-50 text-text-light'><tr>
                                <th className='p-3 text-left font-medium'>Product</th><th className='p-3 font-medium'>Audience</th><th className='p-3 font-medium'>Price</th><th className='p-3 font-medium'>Stock</th><th className='p-3 font-medium'>Actions</th>
                            </tr></thead>
                            <tbody>
                                {filtered.length === 0 && (
                                    <tr><td colSpan={5} className='p-6 text-center text-text-light'>No products match “{search}”.</td></tr>
                                )}
                                {filtered.map((p) => (
                                    <tr key={p._id} className='border-t border-gray-100 hover:bg-gray-50/50'>
                                        <td className='p-3 flex items-center gap-3'>
                                            <img src={(p.images && p.images[0])} alt='' className='w-11 h-11 object-cover rounded-lg bg-gray-50' /><span className='font-medium'>{p.name}</span>
                                        </td>
                                        <td className='p-3 text-center capitalize'>{p.audience}</td>
                                        <td className='p-3 text-center'>{formatINR(p.price)}</td>
                                        <td className='p-3 text-center'>
                                            <span className={p.stock > 0 ? '' : 'text-primary font-medium'}>{p.stock}</span>
                                        </td>
                                        <td className='p-3 text-center whitespace-nowrap'>
                                            <button onClick={() => startEdit(p)} className='text-blue-600 hover:underline mr-3'>Edit</button>
                                            <button onClick={() => handleDelete(p._id)} className='text-primary hover:underline'>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <AdminPager page={page} totalPages={totalPages} total={total} onChange={setPage} label='products' />
                </div>
            )}
        </div>
    );
};

export default ManageProducts;
