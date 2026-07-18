import React from 'react'
import { Link } from 'react-router-dom';
import RatingStars from '../../components/RatingStars';
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

const ProductCard = ({ products = [] }) => {
    const dispatch = useDispatch();
    const handleAddToCart = (product) => dispatch(addToCart(toCartProduct(product)));

    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
            {products.map((product) => {
                const image = (product.images && product.images[0]) || product.image;
                return (
                    <div key={product._id} className='product__card'>
                        <div className='relative'>
                            <Link to={`/shop/${product.slug || product._id}`}>
                                <img src={image} alt={product.name} className='max-h-96 md:h-64 w-full object-cover hover:scale-105 transition-all duration-300' />
                            </Link>
                            <div className='hover:block absolute top-3 right-3'>
                                <button onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}>
                                    <i className='ri-shopping-cart-2-line bg-primary p-1.5 text-white hover:bg-primary-dark'></i>
                                </button>
                            </div>
                        </div>
                        <div className='product__card__content'>
                            <h4>{product.name}</h4>
                            <p>
                                {formatINR(product.price)}{' '}
                                {product?.oldPrice ? <s className='text-gray-400'>{formatINR(product.oldPrice)}</s> : null}
                            </p>
                            <RatingStars rating={product.rating} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ProductCard;
