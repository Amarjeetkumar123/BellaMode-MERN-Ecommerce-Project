import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { clearCart } from '../../redux/features/cart/cartSlice'
import { useCreateOrderMutation } from '../../redux/features/orders/ordersApi'
import { useCreatePaymentOrderMutation, useVerifyPaymentMutation } from '../../redux/features/payments/paymentsApi'
import { loadRazorpayScript } from '../../utils/loadRazorpay'
import { formatINR } from '../../utils/formatCurrency'

const emptyAddress = { fullName: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '' };

const Checkout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { products, totalPrice, tax, grandTotal } = useSelector((s) => s.cart);
    const { user } = useSelector((s) => s.auth);

    const [address, setAddress] = useState({ ...emptyAddress, fullName: user?.username || '' });
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [error, setError] = useState('');

    const [createOrder, { isLoading: creating }] = useCreateOrderMutation();
    const [createPaymentOrder] = useCreatePaymentOrderMutation();
    const [verifyPayment] = useVerifyPaymentMutation();

    const setField = (k, v) => setAddress((a) => ({ ...a, [k]: v }));

    const orderItems = products.map((p) => ({
        product: p._id,
        quantity: p.quantity,
        ...(p.size ? { size: p.size } : {}),
        ...(p.color ? { color: p.color } : {}),
    }));

    const finishSuccess = () => {
        dispatch(clearCart());
        navigate('/dashboard/orders');
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setError('');
        if (products.length === 0) return setError('Your cart is empty.');
        try {
            const res = await createOrder({ items: orderItems, shippingAddress: address, paymentMethod }).unwrap();
            const order = res.data.order;

            if (paymentMethod === 'COD') {
                finishSuccess();
                return;
            }

            // Razorpay flow
            const loaded = await loadRazorpayScript();
            if (!loaded) return setError('Failed to load payment gateway.');
            const payRes = await createPaymentOrder({ orderId: order._id }).unwrap();
            const { razorpayOrderId, amount, currency, keyId } = payRes.data;

            const rzp = new window.Razorpay({
                key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount,
                currency,
                name: 'Wearly',
                description: `Order ${order._id}`,
                order_id: razorpayOrderId,
                prefill: { name: address.fullName, contact: address.phone, email: user?.email },
                theme: { color: '#d3213c' },
                handler: async (response) => {
                    try {
                        await verifyPayment({
                            orderId: order._id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        }).unwrap();
                        finishSuccess();
                    } catch (err) {
                        setError('Payment verification failed.');
                    }
                },
            });
            rzp.open();
        } catch (err) {
            setError(err?.data?.message || 'Could not place order.');
        }
    };

    return (
        <>
            <section className='section__container bg-primary-light'>
                <h2 className='section__header'>Checkout</h2>
            </section>
            <section className='section__container'>
                {products.length === 0 ? (
                    <p className='text-gray-500'>Your cart is empty. <a href='/shop' className='text-primary underline'>Continue shopping</a>.</p>
                ) : (
                    <div className='flex flex-col md:flex-row gap-8'>
                        <form onSubmit={handlePlaceOrder} className='flex-1 space-y-4'>
                            <h3 className='text-lg font-semibold'>Shipping Address</h3>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                <input required placeholder='Full name' value={address.fullName} onChange={(e) => setField('fullName', e.target.value)} className='border p-2 rounded' />
                                <input required placeholder='Phone' value={address.phone} onChange={(e) => setField('phone', e.target.value)} className='border p-2 rounded' />
                                <input required placeholder='Address line 1' value={address.line1} onChange={(e) => setField('line1', e.target.value)} className='border p-2 rounded sm:col-span-2' />
                                <input placeholder='Address line 2 (optional)' value={address.line2} onChange={(e) => setField('line2', e.target.value)} className='border p-2 rounded sm:col-span-2' />
                                <input required placeholder='City' value={address.city} onChange={(e) => setField('city', e.target.value)} className='border p-2 rounded' />
                                <input required placeholder='State' value={address.state} onChange={(e) => setField('state', e.target.value)} className='border p-2 rounded' />
                                <input required placeholder='Postal code' value={address.postalCode} onChange={(e) => setField('postalCode', e.target.value)} className='border p-2 rounded' />
                            </div>

                            <h3 className='text-lg font-semibold pt-2'>Payment Method</h3>
                            <label className='flex items-center gap-2'>
                                <input type='radio' name='pay' checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                                Cash on Delivery
                            </label>
                            <label className='flex items-center gap-2'>
                                <input type='radio' name='pay' checked={paymentMethod === 'RAZORPAY'} onChange={() => setPaymentMethod('RAZORPAY')} />
                                Pay Online (Razorpay)
                            </label>

                            {error && <p className='text-red-500'>{error}</p>}
                            <button type='submit' disabled={creating} className='px-6 py-3 bg-primary text-white rounded'>
                                {creating ? 'Placing order…' : `Place Order`}
                            </button>
                        </form>

                        <div className='md:w-80 bg-primary-light rounded p-6 h-fit'>
                            <h3 className='text-lg font-semibold mb-3'>Your Order</h3>
                            {products.map((p) => (
                                <div key={p._id} className='flex justify-between text-sm mb-2'>
                                    <span>{p.name} × {p.quantity}</span>
                                    <span>{formatINR(p.price * p.quantity)}</span>
                                </div>
                            ))}
                            <hr className='my-2' />
                            <div className='flex justify-between text-sm'><span>Subtotal</span><span>{formatINR(totalPrice)}</span></div>
                            <div className='flex justify-between text-sm'><span>Tax</span><span>{formatINR(tax)}</span></div>
                            <div className='flex justify-between font-bold mt-2'><span>Total (excl. shipping)</span><span>{formatINR(grandTotal)}</span></div>
                            <p className='text-xs text-gray-500 mt-2'>Final total incl. shipping is confirmed on the order.</p>
                        </div>
                    </div>
                )}
            </section>
        </>
    );
};

export default Checkout;
