import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import RatingStars from '../../../components/RatingStars'
import { useGetProductQuery } from '../../../redux/features/products/productsApi'
import { useGetReviewsByProductQuery, useAddReviewMutation } from '../../../redux/features/reviews/reviewsApi'
import { addToCart } from '../../../redux/features/cart/cartSlice'
import { toCartProduct } from '../ProductCard'
import { formatINR } from '../../../utils/formatCurrency'

const TRUST = [
    { icon: 'ri-truck-line', text: 'Free delivery over ₹999' },
    { icon: 'ri-arrow-go-back-line', text: '30-day easy returns' },
    { icon: 'ri-secure-payment-line', text: 'Secure checkout' },
];

const SingleProduct = () => {
    const { id } = useParams(); // slug or id
    const dispatch = useDispatch();
    const { user } = useSelector((s) => s.auth);

    const { data, isLoading, isError } = useGetProductQuery(id);
    const product = data?.data?.product;

    const { data: reviewData } = useGetReviewsByProductQuery(product?._id, { skip: !product?._id });
    const [addReview, { isLoading: submitting }] = useAddReviewMutation();

    const [size, setSize] = useState('');
    const [color, setColor] = useState('');
    const [qty, setQty] = useState(1);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [msg, setMsg] = useState('');
    const [added, setAdded] = useState(false);
    const [activeImg, setActiveImg] = useState(0);

    if (isLoading) return <div className='section__container'>Loading…</div>;
    if (isError || !product) return <div className='section__container'>Product not found.</div>;

    const image = (product.images && product.images[0]) || product.image;
    // De-duplicated image list; falls back to the single image when that's all there is.
    const gallery = [...new Set((product.images || []).filter(Boolean))];
    if (gallery.length === 0 && image) gallery.push(image);
    const reviews = reviewData?.data?.reviews || [];
    const discount = product.oldPrice && product.oldPrice > product.price
        ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
    const inStock = (product.stock ?? 1) > 0;

    const handleAddToCart = () => {
        for (let i = 0; i < qty; i++) dispatch(addToCart({ ...toCartProduct(product), size, color }));
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
    };

    const handleReview = async (e) => {
        e.preventDefault();
        setMsg('');
        try {
            await addReview({ productId: product._id, rating: Number(rating), comment }).unwrap();
            setComment('');
            setMsg('Thanks for your review!');
        } catch (err) {
            setMsg(err?.data?.message || 'Could not submit review.');
        }
    };

    return (
        <>
            <section className='section__container !py-16'>
                {/* Breadcrumb */}
                <nav className='flex items-center gap-2 text-sm text-text-light mb-8'>
                    <Link to='/' className='hover:text-primary'>Home</Link>
                    <i className='ri-arrow-right-s-line'></i>
                    <Link to='/shop' className='hover:text-primary'>Shop</Link>
                    {product.category?.slug && (
                        <>
                            <i className='ri-arrow-right-s-line'></i>
                            <Link to={`/categories/${product.category.slug}`} className='hover:text-primary'>{product.category.name}</Link>
                        </>
                    )}
                    <i className='ri-arrow-right-s-line'></i>
                    <span className='text-text-dark line-clamp-1'>{product.name}</span>
                </nav>

                <div className='grid md:grid-cols-2 gap-10 lg:gap-16'>
                    {/* Gallery — thumbnails appear only when there's more than one image */}
                    <div>
                        <div className='relative rounded-2xl overflow-hidden bg-gray-50 aspect-[4/5]'>
                            <img src={gallery[activeImg] || image} alt={product.name}
                                className='w-full h-full object-cover' />
                            {discount > 0 && (
                                <span className='absolute top-4 left-4 bg-text-dark text-white text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded'>
                                    {discount}% off
                                </span>
                            )}
                            {gallery.length > 1 && (
                                <>
                                    <button type='button' aria-label='Previous image' className='pdp-gal__nav left-3'
                                        onClick={() => setActiveImg((i) => (i - 1 + gallery.length) % gallery.length)}>
                                        <i className='ri-arrow-left-s-line'></i>
                                    </button>
                                    <button type='button' aria-label='Next image' className='pdp-gal__nav right-3'
                                        onClick={() => setActiveImg((i) => (i + 1) % gallery.length)}>
                                        <i className='ri-arrow-right-s-line'></i>
                                    </button>
                                </>
                            )}
                        </div>

                        {gallery.length > 1 && (
                            <div className='pdp-thumbs'>
                                {gallery.map((src, i) => (
                                    <button key={src + i} type='button'
                                        aria-label={`View image ${i + 1}`}
                                        aria-current={i === activeImg}
                                        className={`pdp-thumb ${i === activeImg ? 'is-on' : ''}`}
                                        onClick={() => setActiveImg(i)}>
                                        <img src={src} alt='' loading='lazy' />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div>
                        {product.brand && (
                            <span className='text-xs uppercase tracking-widest text-text-light font-semibold'>{product.brand}</span>
                        )}
                        <h1 className='text-3xl font-extrabold text-text-dark mt-1 mb-3' style={{ fontFamily: 'var(--header-font)' }}>{product.name}</h1>
                        <div className='flex items-center gap-2 mb-5'>
                            <RatingStars rating={product.rating} />
                            <span className='text-sm text-text-light'>{product.rating?.toFixed(1) || '0.0'} · {product.numReviews || 0} reviews</span>
                        </div>

                        <div className='flex items-end gap-3 mb-6'>
                            <span className='text-3xl font-bold text-text-dark'>{formatINR(product.price)}</span>
                            {product.oldPrice ? <s className='text-lg text-text-light'>{formatINR(product.oldPrice)}</s> : null}
                            {discount > 0 && <span className='text-sm font-semibold text-green-600 mb-1'>You save {formatINR(product.oldPrice - product.price)}</span>}
                        </div>

                        <p className='text-text-light leading-relaxed mb-6'>{product.description}</p>

                        {product.sizes?.length > 0 && (
                            <div className='mb-5'>
                                <strong className='block mb-2 text-sm'>Select Size</strong>
                                <div className='flex flex-wrap gap-2'>
                                    {product.sizes.map((s) => (
                                        <button key={s} onClick={() => setSize(s)}
                                            className={`min-w-[46px] px-3 py-2 border rounded-lg text-sm transition ${size === s ? 'bg-text-dark text-white border-text-dark' : 'hover:border-text-dark'}`}>{s}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {product.colors?.length > 0 && (
                            <div className='mb-6'>
                                <strong className='block mb-2 text-sm'>Color</strong>
                                <div className='flex flex-wrap gap-2'>
                                    {product.colors.map((c) => (
                                        <button key={c} onClick={() => setColor(c)}
                                            className={`px-3 py-2 border rounded-lg text-sm capitalize transition ${color === c ? 'bg-text-dark text-white border-text-dark' : 'hover:border-text-dark'}`}>{c}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className='flex items-center gap-4 mb-6'>
                            <div className='flex items-center border rounded-lg overflow-hidden'>
                                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className='px-3 py-2 text-lg hover:bg-gray-50'>−</button>
                                <span className='px-4 py-2 min-w-[42px] text-center'>{qty}</span>
                                <button onClick={() => setQty((q) => q + 1)} className='px-3 py-2 text-lg hover:bg-gray-50'>+</button>
                            </div>
                            <span className={`text-sm font-medium ${inStock ? 'text-green-600' : 'text-primary'}`}>
                                <i className={`${inStock ? 'ri-checkbox-circle-line' : 'ri-close-circle-line'} mr-1`}></i>
                                {inStock ? 'In stock' : 'Out of stock'}
                            </span>
                        </div>

                        <div className='flex flex-col sm:flex-row gap-3 mb-8'>
                            <button onClick={handleAddToCart} disabled={!inStock}
                                className='flex-1 px-6 py-3.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2'>
                                <i className='ri-shopping-cart-2-line'></i>
                                {added ? 'Added to Cart ✓' : 'Add to Cart'}
                            </button>
                            <Link to='/checkout' onClick={handleAddToCart}
                                className='flex-1 px-6 py-3.5 border-2 border-text-dark text-text-dark rounded-lg font-semibold hover:bg-text-dark hover:text-white transition text-center'>
                                Buy Now
                            </Link>
                        </div>

                        <div className='grid grid-cols-3 gap-3 border-t pt-6'>
                            {TRUST.map((t) => (
                                <div key={t.text} className='flex flex-col items-center text-center gap-1.5 text-text-light'>
                                    <i className={`${t.icon} text-2xl text-text-dark`}></i>
                                    <span className='text-xs'>{t.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Reviews */}
            <section className='section__container !pt-0'>
                <h3 className='text-xl font-semibold mb-6' style={{ fontFamily: 'var(--header-font)' }}>Customer Reviews ({reviews.length})</h3>
                <div className='space-y-4 mb-8'>
                    {reviews.length === 0 && <p className='text-gray-500'>No reviews yet. Be the first!</p>}
                    {reviews.map((r) => (
                        <div key={r._id} className='border-b pb-3'>
                            <div className='flex items-center gap-2'>
                                <span className='font-medium'>{r.userName || 'User'}</span>
                                <RatingStars rating={r.rating} />
                            </div>
                            <p className='text-gray-600'>{r.comment}</p>
                        </div>
                    ))}
                </div>

                {user ? (
                    <form onSubmit={handleReview} className='max-w-lg space-y-3'>
                        <h4 className='font-medium'>Write a review</h4>
                        <select value={rating} onChange={(e) => setRating(e.target.value)} className='border p-2 rounded'>
                            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
                        </select>
                        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder='Share your experience…'
                            className='w-full border p-2 rounded' rows={3} />
                        {msg && <p className='text-sm text-primary'>{msg}</p>}
                        <button type='submit' disabled={submitting} className='px-5 py-2 bg-primary text-white rounded'>
                            {submitting ? 'Submitting…' : 'Submit Review'}
                        </button>
                    </form>
                ) : (
                    <p className='text-gray-500'><Link to='/login' className='text-primary underline'>Log in</Link> to write a review.</p>
                )}
            </section>
        </>
    );
};

export default SingleProduct;
