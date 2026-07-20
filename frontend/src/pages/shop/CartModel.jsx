import React from 'react'
import OrderSummary from './OrderSummary'
import { useDispatch } from 'react-redux'
import { removeFromCart, updateQuantity } from '../../redux/features/cart/cartSlice';
import { formatINR } from '../../utils/formatCurrency';

const CartModel = ({ products, isOpen, onClose }) => {
    const dispatch = useDispatch();
    const handleQuantity = (type, id) => dispatch(updateQuantity({ type, _id: id }));
    const handleRemove = (e, id) => { e.preventDefault(); dispatch(removeFromCart({ _id: id })); };

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
                className={`fixed z-[1002] right-0 top-0 md:w-[420px] w-full bg-white flex flex-col shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className='flex justify-between items-center px-5 py-4 border-b shrink-0'>
                    <h4 className='text-lg font-semibold' style={{ fontFamily: 'var(--header-font)' }}>
                        Your Cart <span className='text-text-light font-normal text-sm'>({products.length})</span>
                    </h4>
                    <button onClick={onClose} className='w-9 h-9 grid place-content-center rounded-full hover:bg-gray-100 text-xl'>
                        <i className='ri-close-line'></i>
                    </button>
                </div>

                {products.length === 0 ? (
                    /* Empty state */
                    <div className='flex-1 flex flex-col items-center justify-center text-center px-6 text-text-light'>
                        <i className='ri-shopping-bag-line text-5xl mb-3'></i>
                        <p className='font-medium text-text-dark'>Your cart is empty</p>
                        <p className='text-sm mb-4'>Add something you love to get started.</p>
                        <button onClick={onClose} className='btn !rounded-lg'>Continue Shopping</button>
                    </div>
                ) : (
                    <>
                        {/* Items (scrollable) */}
                        <div className='flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4'>
                            {products.map((item) => (
                                <div key={item._id} className='flex gap-3'>
                                    <img src={item.image} alt={item.name} className='w-20 h-24 object-cover rounded-lg bg-gray-50 shrink-0' />
                                    <div className='flex-1 min-w-0'>
                                        <div className='flex justify-between gap-2'>
                                            <h5 className='text-sm font-medium text-text-dark line-clamp-2'>{item.name}</h5>
                                            <button onClick={(e) => handleRemove(e, item._id)} className='text-text-light hover:text-primary shrink-0'>
                                                <i className='ri-delete-bin-6-line'></i>
                                            </button>
                                        </div>
                                        {(item.size || item.color) && (
                                            <p className='text-xs text-text-light mt-0.5 capitalize'>
                                                {[item.color, item.size].filter(Boolean).join(' · ')}
                                            </p>
                                        )}
                                        <div className='flex items-center justify-between mt-2'>
                                            <div className='flex items-center border rounded-lg'>
                                                <button onClick={() => handleQuantity('decrement', item._id)} className='w-8 h-8 grid place-content-center hover:bg-gray-50'>−</button>
                                                <span className='w-8 text-center text-sm'>{item.quantity}</span>
                                                <button onClick={() => handleQuantity('increment', item._id)} className='w-8 h-8 grid place-content-center hover:bg-gray-50'>+</button>
                                            </div>
                                            <span className='font-semibold text-text-dark'>{formatINR(item.price * item.quantity)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary (pinned bottom) */}
                        <div className='shrink-0'>
                            <OrderSummary onClose={onClose} />
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default CartModel;
