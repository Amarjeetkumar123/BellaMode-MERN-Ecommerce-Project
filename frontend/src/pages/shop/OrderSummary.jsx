import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { clearCart } from '../../redux/features/cart/cartSlice'
import { formatINR } from '../../utils/formatCurrency'

const OrderSummary = ({ onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { tax, taxRate, totalPrice, grandTotal } = useSelector((store) => store.cart);
    const { user } = useSelector((store) => store.auth);

    const handleCheckout = () => {
        if (onClose) onClose();
        navigate(user ? '/checkout' : '/login');
    };

    const freeShip = totalPrice >= 999;

    return (
        <div className='border-t bg-white px-5 py-4 space-y-3'>
            <div className='flex justify-between text-sm text-text-light'>
                <span>Subtotal</span><span className='text-text-dark font-medium'>{formatINR(totalPrice)}</span>
            </div>
            <div className='flex justify-between text-sm text-text-light'>
                <span>Tax ({Math.round(taxRate * 100)}%)</span><span className='text-text-dark font-medium'>{formatINR(tax)}</span>
            </div>
            <div className='flex justify-between text-sm text-text-light'>
                <span>Shipping</span>
                <span className={freeShip ? 'text-green-600 font-medium' : 'text-text-dark font-medium'}>{freeShip ? 'FREE' : 'Calculated at checkout'}</span>
            </div>
            {!freeShip && (
                <p className='text-xs text-text-light bg-extra-light rounded-md px-3 py-2'>
                    Add <b className='text-text-dark'>{formatINR(999 - totalPrice)}</b> more for free shipping.
                </p>
            )}
            <div className='flex justify-between items-center pt-2 border-t'>
                <span className='font-semibold'>Grand Total</span>
                <span className='text-lg font-bold text-text-dark'>{formatINR(grandTotal)}</span>
            </div>
            <button onClick={handleCheckout} className='btn w-full !rounded-lg flex items-center justify-center gap-2'>
                Proceed to Checkout <i className='ri-arrow-right-line'></i>
            </button>
            <button onClick={() => dispatch(clearCart())}
                className='w-full text-sm text-text-light hover:text-primary flex items-center justify-center gap-1.5'>
                <i className='ri-delete-bin-6-line'></i> Clear cart
            </button>
        </div>
    );
};

export default OrderSummary;
