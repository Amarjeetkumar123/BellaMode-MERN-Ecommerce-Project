import React from 'react'
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/features/cart/cartSlice';
import { formatINR } from '../../utils/formatCurrency';

// Normalizes an API product into the shape the cart expects (single `image`).
export const toCartProduct = (product) => ({
    _id: product._id,
    name: product.name,
    price: product.price,
    image: (product.images && product.images[0]) || product.image,
});

const Stars = ({ rating = 0 }) => {
    const full = Math.round(rating);
    return (
        <span className='text-amber-400 text-sm leading-none'>
            {'★★★★★'.split('').map((s, i) => (
                <span key={i} className={i < full ? '' : 'text-gray-300'}>★</span>
            ))}
        </span>
    );
};

const ProductCard = ({ products = [] }) => {
    const dispatch = useDispatch();
    const handleAddToCart = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(addToCart(toCartProduct(product)));
    };

    return (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8'>
            {products.map((product) => {
                const image = (product.images && product.images[0]) || product.image;
                const discount = product.oldPrice && product.oldPrice > product.price
                    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                    : 0;
                return (
                    <Link
                        key={product._id}
                        to={`/shop/${product.slug || product._id}`}
                        className='group flex flex-col rounded-xl overflow-hidden bg-white border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300'
                    >
                        <div className='relative overflow-hidden bg-gray-50 aspect-[4/5]'>
                            <img src={image} alt={product.name}
                                className='h-full w-full object-cover group-hover:scale-105 transition-transform duration-500' />
                            {discount > 0 && (
                                <span className='absolute top-3 left-3 bg-primary text-white text-xs font-semibold px-2 py-1 rounded-full'>
                                    -{discount}%
                                </span>
                            )}
                            {/* quick add-to-cart, slides up on hover */}
                            <button
                                onClick={(e) => handleAddToCart(e, product)}
                                className='absolute bottom-0 inset-x-0 bg-text-dark/90 text-white text-sm font-medium py-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2'>
                                <i className='ri-shopping-cart-2-line'></i> Add to Cart
                            </button>
                        </div>
                        <div className='p-3 flex flex-col gap-1'>
                            {product.brand && (
                                <span className='text-[11px] uppercase tracking-wide text-text-light font-medium'>{product.brand}</span>
                            )}
                            <h4 className='text-sm font-medium text-text-dark line-clamp-1'>{product.name}</h4>
                            <div className='flex items-center gap-2'>
                                <span className='text-base font-bold text-text-dark'>{formatINR(product.price)}</span>
                                {product.oldPrice ? <s className='text-xs text-text-light'>{formatINR(product.oldPrice)}</s> : null}
                            </div>
                            <div className='flex items-center gap-1'>
                                <Stars rating={product.rating} />
                                {product.numReviews ? <span className='text-xs text-text-light'>({product.numReviews})</span> : null}
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
};

export default ProductCard;
