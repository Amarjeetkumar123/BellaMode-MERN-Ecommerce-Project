import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useGetProductQuery, useGetProductsQuery } from '../../../redux/features/products/productsApi'
import { useGetReviewsByProductQuery, useAddReviewMutation } from '../../../redux/features/reviews/reviewsApi'
import { addToCart } from '../../../redux/features/cart/cartSlice'
import ProductCard, { toCartProduct } from '../ProductCard'
import { formatINR } from '../../../utils/formatCurrency'
import { useWishlist } from '../../../hooks/useWishlist'
import { listingLink } from '../../../data/catalog'
import { SkeletonProduct } from '../../../components/Loaders'

const LABEL = { men: 'Men', women: 'Women', kids: 'Kids', unisex: 'Lifestyle' };
// With a single photo, the gallery offers detail crops of it instead.
const CROPS = [['1', '50% 40%'], ['1.7', '50% 22%'], ['1.8', '50% 62%'], ['2.3', '70% 88%']];
const canHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

const Stars = ({ value, size }) => (
    <span className='wf-stars' aria-label={`${value} out of 5`}>
        {[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= Math.round(value) ? '' : 'off'} style={size && { width: size, height: size }}></i>)}
    </span>
);

const RATE_WORD = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very good', 5: 'Excellent' };

const ProductView = ({ product }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((s) => s.auth);
    const { isWished, toggle } = useWishlist();
    const { data: reviewData } = useGetReviewsByProductQuery(product._id);
    const [addReview, { isLoading: posting }] = useAddReviewMutation();
    const { data: relData } = useGetProductsQuery({ category: product.category?.slug, limit: 5 }, { skip: !product.category?.slug });

    const images = [...new Set((product.images || []).filter(Boolean))];
    const shots = images.length > 1 ? images.map((src) => [src, '1', '50% 50%']) : CROPS.map(([z, o]) => [images[0], z, o]);
    const sizes = product.sizes || [];
    const colors = product.colors || [];
    const off = product.oldPrice > product.price ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
    const stock = product.stock ?? 1;
    const reviews = reviewData?.data?.reviews || [];
    const related = (relData?.data?.products || []).filter((p) => p._id !== product._id).slice(0, 4);
    const store = ['men', 'women', 'kids'].includes(product.audience) ? product.audience : null;

    const [shot, setShot] = useState(0);
    const [zoom, setZoom] = useState(null);
    const [color, setColor] = useState(colors[0] || '');
    const [size, setSize] = useState(sizes.length === 1 ? sizes[0] : '');
    const [qty, setQty] = useState(1);
    const [need, setNeed] = useState(0);
    const [added, setAdded] = useState(false);
    const [writing, setWriting] = useState(false);
    const [stars, setStars] = useState(5);
    const [hoverStar, setHoverStar] = useState(0);
    const [comment, setComment] = useState('');
    const [msg, setMsg] = useState('');
    const [barsIn, setBarsIn] = useState(false);
    const [buybar, setBuybar] = useState(false);
    const addRef = useRef(null);
    const sizeRef = useRef(null);

    useEffect(() => { const t = setTimeout(() => setBarsIn(true), 200); return () => clearTimeout(t); }, []);
    // phone: price + Add to bag stay on screen once the main button scrolls away
    useEffect(() => {
        const io = new IntersectionObserver(([e]) => setBuybar(!e.isIntersecting && e.boundingClientRect.top < 0));
        if (addRef.current) io.observe(addRef.current);
        return () => io.disconnect();
    }, []);

    const ready = () => {
        if (!sizes.length || size) return true;
        setNeed((n) => n + 1); // re-triggers the shake
        sizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
    };
    const add = () => dispatch(addToCart({ ...toCartProduct(product), ...(size && { size }), ...(color && { color }), quantity: qty }));
    const addToBag = () => {
        if (!ready()) return;
        add();
        setAdded(true);
        setTimeout(() => setAdded(false), 1600);
        window.dispatchEvent(new Event('wf:open-bag'));
    };
    const buyNow = () => { if (ready()) { add(); navigate('/checkout'); } };

    const postReview = async (e) => {
        e.preventDefault();
        setMsg('');
        try {
            await addReview({ productId: product._id, rating: stars, comment }).unwrap();
            setComment(''); setWriting(false); setMsg('Thanks, your review is live.');
        } catch (err) {
            setMsg(err?.data?.message || 'Could not post your review.');
        }
    };

    // rating comes from real reviews only, so it can't disagree with the review count
    const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
    const dist = [5, 4, 3, 2, 1].map((s) => [s, reviews.length ? Math.round((reviews.filter((r) => Math.round(r.rating) === s).length / reviews.length) * 100) : 0]);
    const [src, z, o] = shots[shot] || [];

    return (
        <main className='wf-page'>
            <div className='wf-wrap wf-page-top'>
                <nav className='wf-crumbs' aria-label='Breadcrumb'>
                    {store ? <Link to={`/categories/${store}`} className='wf-u'>{LABEL[store]}</Link> : <Link to='/' className='wf-u'>Home</Link>}
                    <span>/</span>
                    {product.category && <><Link to={listingLink(store, product.category)} className='wf-u'>{product.category.name}</Link><span>/</span></>}
                    <span>{product.name}</span>
                </nav>
            </div>

            <div className='wf-wrap wf-pdp'>
                <div className='wf-gallery'>
                    <div className='wf-thumbs'>
                        {shots.map(([s, sz, so], i) => (
                            <button key={i} type='button' className='wf-thumb' aria-label={`Photo ${i + 1}`} aria-current={i === shot} onClick={() => setShot(i)}>
                                <img src={s} alt='' style={{ '--z': sz, '--o': so }} />
                            </button>
                        ))}
                    </div>
                    <div
                        className={`wf-main-ph ${zoom ? 'zoom' : ''}`}
                        style={zoom ? { '--zx': `${zoom[0]}%`, '--zy': `${zoom[1]}%` } : undefined}
                        {...(canHover && {
                            onPointerMove: (e) => { const r = e.currentTarget.getBoundingClientRect(); setZoom([((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100]); },
                            onPointerLeave: () => setZoom(null),
                        })}
                    >
                        <img src={src} alt={product.name} style={{ '--z': z, '--o': o }} />
                        {off > 0 && <span className='wf-card__badge'>{off}% off</span>}
                        <span className='wf-hint'><i className='ri-zoom-in-line'></i> Hover to zoom</span>
                    </div>
                </div>

                <div className='wf-buy'>
                    {product.brand && <div className='wf-buy__brand'>{product.brand}</div>}
                    <h1>{product.name}</h1>
                    <a href='#reviews' className='wf-rating'><Stars value={avg} /> {avg ? avg.toFixed(1) : 'New'} <span className='wf-u'>{reviews.length} review{reviews.length === 1 ? '' : 's'}</span></a>
                    <div className='wf-buy-price'>
                        <b>{formatINR(product.price)}</b>
                        {off > 0 && <><s aria-label={`was ${formatINR(product.oldPrice)}`}>{formatINR(product.oldPrice)}</s><span className='wf-save'>Save {formatINR(product.oldPrice - product.price)}</span></>}
                    </div>
                    <p className='wf-tax-note'>Inclusive of all taxes</p>

                    {colors.length > 0 && (
                        <div className='wf-opt'>
                            <div className='wf-opt__head'>Colour <span>Selected: <b>{color}</b></span></div>
                            <div className='wf-swatches'>
                                {colors.map((c) => <button key={c} type='button' className='wf-sw' style={{ '--c': c }} title={c} aria-label={c} aria-pressed={c === color} onClick={() => setColor(c)} />)}
                            </div>
                        </div>
                    )}
                    {sizes.length > 0 && (
                        <div className={`wf-opt ${need ? 'need' : ''}`} key={need} ref={sizeRef}>
                            <div className='wf-opt__head'>Size {sizes.length > 1 && <a href='#size-fit' className='wf-u'>Size guide</a>}</div>
                            <div className='wf-sizes-lg'>
                                {sizes.map((s) => <button key={s} type='button' aria-pressed={s === size} onClick={() => { setSize(s); setNeed(0); }}>{s}</button>)}
                            </div>
                            <p className='wf-err' role='alert'>Choose a size first</p>
                        </div>
                    )}

                    <div className='wf-row'>
                        <div className='wf-qty'>
                            <button type='button' onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label='One less'>−</button>
                            <output>{qty}</output>
                            <button type='button' onClick={() => setQty((q) => Math.min(Math.max(stock, 1), q + 1))} aria-label='One more'>+</button>
                        </div>
                        <button type='button' ref={addRef} className={`wf-btn ${added ? 'is-ok' : ''}`} onClick={addToBag} disabled={stock < 1}>
                            {stock < 1 ? 'Out of stock' : added ? 'Added to bag ✓' : 'Add to bag'}
                        </button>
                        <button type='button' className='wf-sq' aria-label={isWished(product._id) ? 'Remove from wishlist' : 'Save to wishlist'} aria-pressed={isWished(product._id)} onClick={() => toggle(product)}>
                            <i className={isWished(product._id) ? 'ri-heart-fill' : 'ri-heart-line'}></i>
                        </button>
                    </div>
                    <button type='button' className='wf-btn wf-btn--line wf-btn--block' onClick={buyNow} disabled={stock < 1}>Buy now</button>
                    <p className={`wf-stock ${stock < 1 ? 'out' : ''}`}>{stock < 1 ? 'Out of stock' : stock <= 5 ? `Only ${stock} left` : 'In stock, ships within 24 hours'}</p>

                    <div className='wf-perks wf-perks--pdp'>
                        <span><i className='ri-truck-line'></i>Free delivery above ₹999</span>
                        <span><i className='ri-loop-left-line'></i>30-day easy returns</span>
                        <span><i className='ri-hand-coin-line'></i>Cash on delivery</span>
                    </div>
                    <div className='wf-acc'>
                        {product.description && <details open><summary>Description<i></i></summary><div><p>{product.description}</p></div></details>}
                        {sizes.length > 0 && <details id='size-fit'><summary>Size and fit<i></i></summary><div><ul>
                            {sizes.length === 1 ? <li>One size, fits most</li> : <><li>Regular fit, true to size</li><li>Available in {sizes.join(', ')}</li></>}
                        </ul></div></details>}
                        <details><summary>Delivery and returns<i></i></summary><div><ul>
                            <li>Free delivery on orders above ₹999</li><li>Cash on delivery or online payment</li><li>30-day easy returns and exchanges</li>
                        </ul></div></details>
                    </div>
                </div>
            </div>

            <section className='wf-wrap wf-reviews' id='reviews' aria-labelledby='wf-rv-h'>
                <div className='wf-score'>
                    <h2 className='wf-sr' id='wf-rv-h'>Customer reviews</h2>
                    <b>{avg ? avg.toFixed(1) : '–'}</b>
                    <Stars value={avg} size={20} />
                    <p>{reviews.length ? `Based on ${reviews.length} review${reviews.length === 1 ? '' : 's'}` : 'No reviews yet'}</p>
                    <div className='wf-bars'>
                        {dist.map(([s, pc]) => (
                            <div key={s}><span>{s}★</span><div className='wf-meter'><i style={{ width: barsIn ? `${pc}%` : 0 }}></i></div><small>{pc}%</small></div>
                        ))}
                    </div>
                    {user
                        ? <button type='button' className='wf-btn wf-btn--line' onClick={() => setWriting((w) => !w)}>{writing ? 'Cancel' : 'Write a review'}</button>
                        : <p style={{ marginTop: 22 }}><Link to='/login' className='wf-u' style={{ fontWeight: 700 }}>Sign in</Link> to write a review.</p>}
                </div>
                <div>
                    {msg && <p className='wf-msg' role='status' style={{ marginBottom: 16 }}>{msg}</p>}
                    {writing && (
                        <form className='wf-rform' onSubmit={postReview}>
                            {/* every star up to the one you pick (or point at) lights up */}
                            <div className='wf-rate' role='radiogroup' aria-label='Your rating' onMouseLeave={() => setHoverStar(0)}>
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <span key={s} style={{ display: 'contents' }}>
                                        <input type='radio' name='stars' id={`wf-r${s}`} checked={stars === s} onChange={() => setStars(s)} />
                                        <label htmlFor={`wf-r${s}`} aria-label={`${s} star${s > 1 ? 's' : ''}`} className={s <= (hoverStar || stars) ? 'on' : ''} onMouseEnter={() => setHoverStar(s)}></label>
                                    </span>
                                ))}
                                <span className='wf-rate__word' aria-hidden='true'>{RATE_WORD[hoverStar || stars]}</span>
                            </div>
                            <label className='wf-sr' htmlFor='wf-rv-text'>Your review</label>
                            <textarea id='wf-rv-text' required value={comment} onChange={(e) => setComment(e.target.value)} placeholder='What did you like or dislike? How was the fit?' />
                            <button className='wf-btn' disabled={posting}>{posting ? 'Posting…' : 'Post review'}</button>
                        </form>
                    )}
                    {reviews.length === 0 && !writing && <p className='wf-muted'>Be the first to review this.</p>}
                    {reviews.map((r) => (
                        <article key={r._id} className='wf-rv'>
                            <div className='wf-rv__head'>
                                <Stars value={r.rating} />
                                <b>{r.userName || 'Customer'}</b>
                                {r.create_date && <small>{new Date(r.create_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</small>}
                            </div>
                            <p>{r.comment}</p>
                        </article>
                    ))}
                </div>
            </section>

            {related.length > 0 && (
                <section className='wf-wrap wf-related' aria-label='You may also like'>
                    <div className='wf-bar'>
                        <span className='wf-tab-label'>You may also like</span>
                        <Link to={listingLink(store, product.category)} className='wf-u'>View all</Link>
                    </div>
                    <ProductCard products={related} />
                </section>
            )}

            <div className={`wf-buybar ${buybar ? 'show' : ''}`}>
                <div><small className='wf-muted'>{product.name}</small><br /><b>{formatINR(product.price)}</b></div>
                <button type='button' className='wf-btn' onClick={addToBag} disabled={stock < 1}>Add to bag</button>
            </div>
        </main>
    );
};

const SingleProduct = () => {
    const { id } = useParams(); // slug or id
    const { data, isLoading, isError } = useGetProductQuery(id);
    const product = data?.data?.product;
    useEffect(() => { window.scrollTo(0, 0); }, [id]);

    if (isLoading) return <SkeletonProduct />;
    if (isError || !product) {
        return <main className='wf-page wf-wrap' style={{ padding: '96px 0' }}><p className='wf-empty'><b>Product not found</b><Link to='/' className='wf-u'>Back to the store</Link></p></main>;
    }
    // keyed so size, colour and photo reset when you open another product
    return <ProductView key={product._id} product={product} />;
};

export default SingleProduct;
