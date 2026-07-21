import React from 'react'
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/features/cart/cartSlice';
import { formatINR } from '../../utils/formatCurrency';
import { useWishlist } from '../../hooks/useWishlist';

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
        <span className='text-amber-400 text-xs leading-none'>
            {'★★★★★'.split('').map((s, i) => (
                <span key={i} className={i < full ? '' : 'text-gray-300'}>★</span>
            ))}
        </span>
    );
};

// A single product tile. Exported so both the grid below and ProductRail can reuse it,
// keeping sale tags, pricing and the wishlist heart identical everywhere.
export const ProductCardItem = ({ product }) => {
    const dispatch = useDispatch();
    const { isWished, toggle } = useWishlist();

    const image = (product.images && product.images[0]) || product.image;
    const onSale = product.oldPrice && product.oldPrice > product.price;
    const discount = onSale
        ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
        : 0;
    const wished = isWished(product._id);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(addToCart(toCartProduct(product)));
    };

    const handleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(product._id);
    };

    return (
        <Link to={`/shop/${product.slug || product._id}`} className='pcard group'>
            <div className='pcard__media'>
                <img src={image} alt={product.name} loading='lazy' />

                <button
                    type='button'
                    onClick={handleWishlist}
                    aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
                    aria-pressed={wished}
                    className={`pcard__wish ${wished ? 'is-on' : ''}`}
                >
                    <i className={wished ? 'ri-heart-fill' : 'ri-heart-line'}></i>
                </button>

                <button type='button' onClick={handleAddToCart} className='pcard__add'>
                    Add to Cart
                </button>
            </div>

            <div className='pcard__body'>
                {product.brand && <span className='pcard__brand'>{product.brand}</span>}
                <h4 className='pcard__name'>{product.name}</h4>
                <div className='pcard__price'>
                    <span className='pcard__now'>{formatINR(product.price)}</span>
                    {onSale && (
                        <>
                            <s className='pcard__was'>{formatINR(product.oldPrice)}</s>
                            <span className='pcard__off'>{discount}% off</span>
                        </>
                    )}
                </div>
                {product.rating ? (
                    <div className='pcard__rating'>
                        <Stars rating={product.rating} />
                        {product.numReviews ? <span>({product.numReviews})</span> : null}
                    </div>
                ) : null}
            </div>
        </Link>
    );
};

const ProductCard = ({ products = [] }) => (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-9'>
        {products.map((product) => (
            <ProductCardItem key={product._id} product={product} />
        ))}
    </div>
);

export default ProductCard;
