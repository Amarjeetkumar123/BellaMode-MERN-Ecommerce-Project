import React from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart } from '../../redux/features/cart/cartSlice'
import { toCartProduct } from '../shop/ProductCard'
import { formatINR } from '../../utils/formatCurrency'
import { useWishlist } from '../../hooks/useWishlist'
import { useDrawer } from '../../hooks/useDrawer'

// Slide-in wishlist, mirroring CartModel: a sibling overlay + drawer so the
// dim never gets trapped inside the navbar's stacking context.
const WishlistDrawer = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const { items, toggle, isLoggedIn } = useWishlist();
    useDrawer(isOpen, onClose);

    const handleAddToCart = (product) => dispatch(addToCart(toCartProduct(product)));
    const handleRemove = (id) => toggle(id);

    return (
        <>
            {/* Dim overlay — sits BELOW the navbar (z-1001) so the nav stays crisp */}
            <div
                onClick={onClose}
                className={`fixed z-[1000] inset-0 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            />
            {/* Drawer — above the navbar */}
            <div
                style={{ height: '100vh' }}
                role='dialog' aria-modal='true' aria-label='Wishlist'
                className={`fixed z-[1002] right-0 top-0 md:w-[420px] w-full bg-white flex flex-col shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className='flex justify-between items-center px-5 py-4 border-b shrink-0'>
                    <h4 className='text-lg font-semibold' style={{ fontFamily: 'var(--header-font)' }}>
                        Wishlist <span className='text-text-light font-normal text-sm'>({items.length})</span>
                    </h4>
                    <button onClick={onClose} className='w-9 h-9 grid place-content-center rounded-full hover:bg-gray-100 text-xl'>
                        <i className='ri-close-line'></i>
                    </button>
                </div>

                {!isLoggedIn ? (
                    /* Signed-out state — the wishlist lives on the account */
                    <div className='flex-1 flex flex-col items-center justify-center text-center px-6 text-text-light'>
                        <i className='ri-heart-line text-5xl mb-3'></i>
                        <p className='font-medium text-text-dark'>Sign in to view your wishlist</p>
                        <p className='text-sm mb-4'>Your saved items follow you across devices.</p>
                        <Link to='/login' onClick={onClose} className='btn !rounded-lg'>Sign In</Link>
                    </div>
                ) : items.length === 0 ? (
                    /* Empty state */
                    <div className='flex-1 flex flex-col items-center justify-center text-center px-6 text-text-light'>
                        <i className='ri-heart-line text-5xl mb-3'></i>
                        <p className='font-medium text-text-dark'>Your wishlist is empty</p>
                        <p className='text-sm mb-4'>Tap the heart on any product to save it here.</p>
                        <button onClick={onClose} className='btn !rounded-lg'>Continue Shopping</button>
                    </div>
                ) : (
                    /* Saved items (scrollable) */
                    <div className='flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4'>
                        {items.map((item) => {
                            const image = (item.images && item.images[0]) || item.image;
                            const onSale = item.oldPrice && item.oldPrice > item.price;
                            return (
                                <div key={item._id} className='flex gap-3'>
                                    <Link to={`/shop/${item.slug || item._id}`} onClick={onClose} className='shrink-0'>
                                        <img src={image} alt={item.name} className='w-20 h-24 object-cover rounded-lg bg-gray-50' />
                                    </Link>
                                    <div className='flex-1 min-w-0'>
                                        <div className='flex justify-between gap-2'>
                                            <Link to={`/shop/${item.slug || item._id}`} onClick={onClose}
                                                className='text-sm font-medium text-text-dark line-clamp-2 hover:text-primary'>
                                                {item.name}
                                            </Link>
                                            <button onClick={() => handleRemove(item._id)}
                                                aria-label='Remove from wishlist'
                                                className='text-text-light hover:text-primary shrink-0'>
                                                <i className='ri-delete-bin-6-line'></i>
                                            </button>
                                        </div>
                                        {item.brand && (
                                            <p className='text-[11px] uppercase tracking-wide text-text-light mt-0.5'>{item.brand}</p>
                                        )}
                                        <div className='flex items-baseline gap-2 mt-1'>
                                            <span className='font-semibold text-text-dark'>{formatINR(item.price)}</span>
                                            {onSale && <s className='text-xs text-text-light'>{formatINR(item.oldPrice)}</s>}
                                        </div>
                                        <button
                                            onClick={() => handleAddToCart(item)}
                                            className='mt-2 text-xs font-medium uppercase tracking-wide border border-text-dark text-text-dark px-3 py-1.5 rounded hover:bg-text-dark hover:text-white transition'
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
};

export default WishlistDrawer;
