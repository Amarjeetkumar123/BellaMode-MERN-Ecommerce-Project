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
            // A cart spanning multiple sellers becomes several orders sharing one
            // paymentGroup; a single Razorpay payment (with Route splits) settles them.
            const { paymentGroup } = res.data;

            if (paymentMethod === 'COD') {
                finishSuccess();
                return;
            }

            // Razorpay flow
            const loaded = await loadRazorpayScript();
            if (!loaded) return setError('Failed to load payment gateway.');
            const payRes = await createPaymentOrder({ paymentGroup }).unwrap();
            const { razorpayOrderId, amount, currency, keyId } = payRes.data;

            const rzp = new window.Razorpay({
                key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount,
                currency,
                name: 'Wearly',
                description: 'Wearly order',
                order_id: razorpayOrderId,
                prefill: { name: address.fullName, contact: address.phone, email: user?.email },
                theme: { color: '#d3213c' },
                handler: async (response) => {
                    try {
                        await verifyPayment({
                            paymentGroup,
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

    const inputCls = 'border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition';
    const freeShip = totalPrice >= 999;

    return (
        <>
            <section className='page-hero'>
                <h1>Checkout</h1>
                <p>You're just a step away — enter your details to complete the order.</p>
            </section>
            <section className='section__container !pt-12'>
                {products.length === 0 ? (
                    <div className='text-center py-16 text-text-light'>
                        <i className='ri-shopping-bag-line text-4xl mb-3 block'></i>
                        Your cart is empty. <a href='/shop' className='text-primary font-medium'>Continue shopping</a>.
                    </div>
                ) : (
                    <div className='grid lg:grid-cols-[1fr_380px] gap-8 items-start'>
                        <form onSubmit={handlePlaceOrder} className='space-y-6'>
                            <div className='bg-white border border-gray-100 rounded-2xl p-6 shadow-sm'>
                                <h3 className='text-lg font-semibold mb-4 flex items-center gap-2' style={{ fontFamily: 'var(--header-font)' }}>
                                    <i className='ri-map-pin-line text-primary'></i> Shipping Address
                                </h3>
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                    <input required placeholder='Full name' value={address.fullName} onChange={(e) => setField('fullName', e.target.value)} className={inputCls} />
                                    <input required placeholder='Phone' value={address.phone} onChange={(e) => setField('phone', e.target.value)} className={inputCls} />
                                    <input required placeholder='Address line 1' value={address.line1} onChange={(e) => setField('line1', e.target.value)} className={`${inputCls} sm:col-span-2`} />
                                    <input placeholder='Address line 2 (optional)' value={address.line2} onChange={(e) => setField('line2', e.target.value)} className={`${inputCls} sm:col-span-2`} />
                                    <input required placeholder='City' value={address.city} onChange={(e) => setField('city', e.target.value)} className={inputCls} />
                                    <input required placeholder='State' value={address.state} onChange={(e) => setField('state', e.target.value)} className={inputCls} />
                                    <input required placeholder='Postal code' value={address.postalCode} onChange={(e) => setField('postalCode', e.target.value)} className={inputCls} />
                                </div>
                            </div>

                            <div className='bg-white border border-gray-100 rounded-2xl p-6 shadow-sm'>
                                <h3 className='text-lg font-semibold mb-4 flex items-center gap-2' style={{ fontFamily: 'var(--header-font)' }}>
                                    <i className='ri-bank-card-line text-primary'></i> Payment Method
                                </h3>
                                <div className='space-y-3'>
                                    {[
                                        { v: 'COD', icon: 'ri-hand-coin-line', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
                                        { v: 'RAZORPAY', icon: 'ri-secure-payment-line', label: 'Pay Online', desc: 'UPI, cards & netbanking via Razorpay' },
                                    ].map((m) => (
                                        <label key={m.v} className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition ${paymentMethod === m.v ? 'border-primary bg-primary-light/50' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <input type='radio' name='pay' checked={paymentMethod === m.v} onChange={() => setPaymentMethod(m.v)} className='accent-primary' />
                                            <i className={`${m.icon} text-xl text-text-dark`}></i>
                                            <div>
                                                <div className='text-sm font-medium'>{m.label}</div>
                                                <div className='text-xs text-text-light'>{m.desc}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {error && <p className='text-primary text-sm'>{error}</p>}
                            <button type='submit' disabled={creating} className='btn w-full !rounded-lg flex items-center justify-center gap-2 disabled:opacity-60'>
                                {creating ? 'Placing order…' : 'Place Order'} <i className='ri-arrow-right-line'></i>
                            </button>
                        </form>

                        <div className='bg-white border border-gray-100 rounded-2xl p-6 shadow-sm lg:sticky lg:top-24'>
                            <h3 className='text-lg font-semibold mb-4' style={{ fontFamily: 'var(--header-font)' }}>Your Order</h3>
                            <div className='space-y-3 max-h-64 overflow-y-auto mb-4'>
                                {products.map((p) => (
                                    <div key={p._id} className='flex gap-3'>
                                        <div className='relative shrink-0'>
                                            <img src={p.image} alt={p.name} className='w-14 h-16 object-cover rounded-lg bg-gray-50' />
                                            <span className='absolute -top-2 -right-2 bg-text-dark text-white text-[11px] w-5 h-5 grid place-content-center rounded-full'>{p.quantity}</span>
                                        </div>
                                        <div className='flex-1 min-w-0 flex flex-col justify-center'>
                                            <p className='text-sm font-medium line-clamp-1'>{p.name}</p>
                                            <p className='text-xs text-text-light'>{formatINR(p.price)}</p>
                                        </div>
                                        <span className='text-sm font-medium self-center'>{formatINR(p.price * p.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className='border-t pt-4 space-y-2 text-sm'>
                                <div className='flex justify-between text-text-light'><span>Subtotal</span><span className='text-text-dark'>{formatINR(totalPrice)}</span></div>
                                <div className='flex justify-between text-text-light'><span>Tax</span><span className='text-text-dark'>{formatINR(tax)}</span></div>
                                <div className='flex justify-between text-text-light'><span>Shipping</span><span className={freeShip ? 'text-green-600 font-medium' : 'text-text-dark'}>{freeShip ? 'FREE' : 'At delivery'}</span></div>
                                <div className='flex justify-between font-bold text-base pt-2 border-t'><span>Total</span><span>{formatINR(grandTotal)}</span></div>
                            </div>
                            <div className='flex items-center gap-2 text-xs text-text-light mt-4'>
                                <i className='ri-lock-line'></i> Secure, encrypted checkout
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </>
    );
};

export default Checkout;
