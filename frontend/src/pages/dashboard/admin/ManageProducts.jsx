import { useState } from 'react'
import {
    useGetProductsQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
} from '../../../redux/features/products/productsApi'
import { useGetCategoriesQuery } from '../../../redux/features/categories/categoriesApi'
import ProductImages from '../../../components/ProductImages'
import AdminPager from './AdminPager'
import { formatINR } from '../../../utils/formatCurrency'
import { card, input, primaryBtn, ghostBtn, titleFont, linkBtn } from './adminUI'
import { AdminHead, L } from './AdminParts'

const AUDIENCES = ['men', 'women', 'kids', 'unisex'];
const blank = { name: '', description: '', price: '', oldPrice: '', audience: 'men', category: '', brand: '', colors: '', sizes: '', stock: '', images: [], isTrending: false, isFeatured: false };

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
            images: p.images || [], isTrending: p.isTrending, isFeatured: p.isFeatured,
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
            images: form.images,
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
        if (!window.confirm('Delete this product? This can’t be undone.')) return;
        await deleteProduct(id);
    };

    return (
        <div>
            <AdminHead title='Products' sub='Add, edit and price what’s in the store. Photos are cropped to fill the product cards.' />

            <form onSubmit={handleSubmit} className={`${card} space-y-4 mb-8`}>
                <h3 style={titleFont}>{editingId ? `Edit: ${form.name || 'product'}` : 'New product'}</h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    <L t='Name'><input placeholder='e.g. Slim Fit Oxford Shirt' required value={form.name} onChange={(e) => setField('name', e.target.value)} className={input} /></L>
                    <L t='Price (₹)'><input placeholder='e.g. 1499' required type='number' value={form.price} onChange={(e) => setField('price', e.target.value)} className={input} /></L>
                    <L t='Old price (₹), shows a sale badge'><input placeholder='e.g. 1999 (leave empty if not on sale)' type='number' value={form.oldPrice} onChange={(e) => setField('oldPrice', e.target.value)} className={input} /></L>
                    <L t='Stock'><input placeholder='e.g. 25' type='number' value={form.stock} onChange={(e) => setField('stock', e.target.value)} className={input} /></L>
                    <L t='Store'><select value={form.audience} onChange={(e) => changeAudience(e.target.value)} className={`${input} capitalize`}>
                        {AUDIENCES.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select></L>
                    <L t='Category'><select required value={form.category} onChange={(e) => setField('category', e.target.value)} className={input}>
                        <option value=''>Select category…</option>
                        {ownCats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                        {sharedCats.length > 0 && (
                            <optgroup label='Footwear &amp; Lifestyle (shared)'>
                                {sharedCats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </optgroup>
                        )}
                    </select></L>
                    <L t='Brand'><input placeholder='e.g. Wearly' value={form.brand} onChange={(e) => setField('brand', e.target.value)} className={input} /></L>
                    <L t='Colours, comma separated'><input placeholder='e.g. Navy, White, Olive' value={form.colors} onChange={(e) => setField('colors', e.target.value)} className={input} /></L>
                    <L t='Sizes, comma separated'><input placeholder='e.g. S, M, L, XL' value={form.sizes} onChange={(e) => setField('sizes', e.target.value)} className={input} /></L>
                </div>
                <L t='Description'><textarea placeholder='Fabric, fit and care, e.g. 100% cotton, regular fit, machine wash cold.' value={form.description} onChange={(e) => setField('description', e.target.value)} className={input} rows={3} /></L>
                <ProductImages value={form.images} onChange={(urls) => setField('images', urls)} />
                <div className='flex gap-5'>
                    <label className='flex items-center gap-2 text-sm font-semibold cursor-pointer'><input type='checkbox' checked={form.isTrending} onChange={(e) => setField('isTrending', e.target.checked)} className='w-4 h-4' /> Trending</label>
                    <label className='flex items-center gap-2 text-sm font-semibold cursor-pointer'><input type='checkbox' checked={form.isFeatured} onChange={(e) => setField('isFeatured', e.target.checked)} className='w-4 h-4' /> Featured</label>
                </div>
                {msg && <p className='wf-alert' role='status'>{msg}</p>}
                <div className='flex gap-2'>
                    <button className={primaryBtn}>{editingId ? 'Save product' : 'Add product'}</button>
                    {editingId && <button type='button' onClick={reset} className={ghostBtn}>Cancel</button>}
                </div>
            </form>

            {/* Search */}
            <div className='flex items-center justify-between flex-wrap gap-3 mb-4'>
                <div className='wf-asearch'>
                    <i className='ri-search-line' aria-hidden='true'></i>
                    <label className='sr-only' htmlFor='wf-psearch'>Search products</label>
                    <input id='wf-psearch' type='search' value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder='Search by name, brand or category' className={input} />
                </div>
                <span className='text-sm wf-muted'>{total} product{total === 1 ? '' : 's'}</span>
            </div>

            {isLoading ? <p className='wf-muted'>Loading…</p> : (
                <div className={`${card} !p-0 overflow-hidden`}>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                            <thead><tr>
                                <th className='text-left'>Product</th><th className='text-left'>Store</th><th className='text-left'>Price</th><th className='text-left'>Stock</th><th><span className='sr-only'>Actions</span></th>
                            </tr></thead>
                            <tbody>
                                {filtered.length === 0 && (
                                    <tr><td colSpan={5} className='text-center wf-muted' style={{ padding: 28 }}>No products match “{search}”.</td></tr>
                                )}
                                {filtered.map((p) => (
                                    <tr key={p._id}>
                                        <td>
                                            <div className='flex items-center gap-3'>
                                                <img src={(p.images && p.images[0])} alt='' className='w-10 object-cover shrink-0' style={{ aspectRatio: '3 / 4' }} />
                                                <span><b>{p.name}</b><span className='block text-xs wf-muted'>{p.category?.name || ''}{p.images?.length > 1 ? ` · ${p.images.length} photos` : ''}</span></span>
                                            </div>
                                        </td>
                                        <td className='capitalize'>{p.audience === 'unisex' ? 'All stores' : p.audience}</td>
                                        <td className='tabular-nums'><b>{formatINR(p.price)}</b>{p.oldPrice > p.price && <s className='block text-xs wf-muted'>{formatINR(p.oldPrice)}</s>}</td>
                                        <td className='tabular-nums'>{p.stock > 0 ? p.stock : <span className='wf-apill is-shipped'>Out of stock</span>}{p.stock > 0 && p.stock <= 5 && <span className='block text-xs wf-danger font-bold'>Low</span>}</td>
                                        <td className='text-right whitespace-nowrap'>
                                            <span className='wf-acts justify-end' style={{ gap: 16 }}>
                                                <button type='button' onClick={() => startEdit(p)} className={linkBtn}>Edit</button>
                                                <button type='button' onClick={() => handleDelete(p._id)} className={`${linkBtn} wf-danger`}>Delete</button>
                                            </span>
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
