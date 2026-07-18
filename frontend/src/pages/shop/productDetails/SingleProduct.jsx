import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import RatingStars from '../../../components/RatingStars'
import { useGetProductQuery } from '../../../redux/features/products/productsApi'
import { useGetReviewsByProductQuery, useAddReviewMutation } from '../../../redux/features/reviews/reviewsApi'
import { addToCart } from '../../../redux/features/cart/cartSlice'
import { toCartProduct } from '../ProductCard'
import { formatINR } from '../../../utils/formatCurrency'

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
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [msg, setMsg] = useState('');

    if (isLoading) return <div className='section__container'>Loading…</div>;
    if (isError || !product) return <div className='section__container'>Product not found.</div>;

    const image = (product.images && product.images[0]) || product.image;
    const reviews = reviewData?.data?.reviews || [];

    const handleAddToCart = () => {
        dispatch(addToCart({ ...toCartProduct(product), size, color }));
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
            <section className='section__container bg-primary-light'>
                <h2 className='section__header capitalize'>{product.name}</h2>
                <div className='section__subheader space-x-2'>
                    <span className='hover:text-primary'><Link to="/">home</Link></span>
                    <i className='ri-arrow-right-s-line'></i>
                    <span className='hover:text-primary'><Link to="/shop">shop</Link></span>
                    <i className='ri-arrow-right-s-line'></i>
                    <span className='capitalize'>{product.name}</span>
                </div>
            </section>

            <section className='section__container mt-8'>
                <div className='flex flex-col items-center md:flex-row gap-8'>
                    <div className='md:w-1/2 w-full'>
                        <img src={image} alt={product.name} className='rounded-md w-full h-auto object-cover' />
                    </div>
                    <div className='md:w-1/2 w-full'>
                        <h3 className='text-2xl font-semibold mb-4'>{product.name}</h3>
                        <p className='text-xl text-primary mb-4'>
                            {formatINR(product.price)}{' '}
                            {product.oldPrice ? <s className='text-gray-400'>{formatINR(product.oldPrice)}</s> : null}
                        </p>
                        <p className='text-gray-500 mb-4'>{product.description}</p>
                        <div className='space-y-1 mb-4'>
                            <p><strong>Category:</strong> {product.category?.name} <span className='text-gray-400'>({product.audience})</span></p>
                            {product.brand && <p><strong>Brand:</strong> {product.brand}</p>}
                            <div className='flex gap-1 items-center'>
                                <strong>Rating:</strong> <RatingStars rating={product.rating} /> <span className='text-gray-400 text-sm'>({product.numReviews || 0})</span>
                            </div>
                        </div>

                        {product.sizes?.length > 0 && (
                            <div className='mb-3'>
                                <strong className='block mb-1'>Size:</strong>
                                <div className='flex flex-wrap gap-2'>
                                    {product.sizes.map((s) => (
                                        <button key={s} onClick={() => setSize(s)}
                                            className={`px-3 py-1 border rounded ${size === s ? 'bg-primary text-white' : ''}`}>{s}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {product.colors?.length > 0 && (
                            <div className='mb-4'>
                                <strong className='block mb-1'>Color:</strong>
                                <div className='flex flex-wrap gap-2'>
                                    {product.colors.map((c) => (
                                        <button key={c} onClick={() => setColor(c)}
                                            className={`px-3 py-1 border rounded capitalize ${color === c ? 'bg-primary text-white' : ''}`}>{c}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button onClick={handleAddToCart} className='mt-2 px-6 py-3 bg-primary text-white rounded'>
                            Add to Cart
                        </button>
                    </div>
                </div>
            </section>

            {/* Reviews */}
            <section className='section__container mt-8'>
                <h3 className='text-xl font-semibold mb-4'>Customer Reviews ({reviews.length})</h3>
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
