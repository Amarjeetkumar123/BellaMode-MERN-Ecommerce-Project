import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { clearCart } from '../../redux/features/cart/cartSlice'
import { formatINR } from '../../utils/formatCurrency'

const OrderSummary = ({ onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { tax, taxRate, totalPrice, grandTotal, selectedItems } = useSelector((store) => store.cart);
    const { user } = useSelector((store) => store.auth);

    const handleCheckout = () => {
        if (onClose) onClose();
        navigate(user ? '/checkout' : '/login');
    };

    return (
        <div className='bg-primary-light mt-5 rounded text-base'>
            <div className='px-6 py-4 space-y-4'>
                <h2 className='text-xl text-text-dark'>Order Summary</h2>
                <p className='text-text-dark'>Selected items: {selectedItems}</p>
                <p>Total Price: {formatINR(totalPrice)}</p>
                <p>Tax ({taxRate * 100}%): {formatINR(tax)}</p>
                <h3 className='font-bold'>Grand Total: {formatINR(grandTotal)}</h3>
                <div className='mb-6'>
                    <button onClick={() => dispatch(clearCart())}
                        className='bg-red-500 px-3 py-1.5 text-white mt-2 rounded-md flex items-center mb-4'>
                        <span className='mr-2'>Clear cart</span><i className="ri-delete-bin-7-line"></i>
                    </button>
                    <button onClick={handleCheckout}
                        className='bg-green-600 px-3 py-1.5 text-white mt-2 rounded-md flex items-center'>
                        <span className='mr-2'>Proceed to Checkout</span><i className="ri-bank-card-line"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;
