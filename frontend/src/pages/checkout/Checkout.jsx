import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { Totals } from '../shop/CartModel'
import { clearCart } from '../../redux/features/cart/cartSlice'
import { useCreateOrderMutation } from '../../redux/features/orders/ordersApi'
import { useCreatePaymentOrderMutation, useVerifyPaymentMutation } from '../../redux/features/payments/paymentsApi'
import { loadRazorpayScript } from '../../utils/loadRazorpay'
import { formatINR } from '../../utils/formatCurrency'

const emptyAddress = { fullName: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '' };

const Checkout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { products, grandTotal } = useSelector((s) => s.cart);
    const { user } = useSelector((s) => s.auth);

    // the default saved address (Profile) fills the form; otherwise just the name
    const saved = user?.addresses?.[0];
    const [address, setAddress] = useState(saved
        ? Object.fromEntries(Object.keys(emptyAddress).map((k) => [k, saved[k] || '']))
        : { ...emptyAddress, fullName: user?.username || '', phone: user?.phone || '' });
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

    const finishSuccess = (order) => {
        dispatch(clearCart());
        navigate(`/order/${order._id}`, { replace: true });
    };

    const [bad, setBad] = useState([]);
    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setError('');
        const invalid = [...e.currentTarget.querySelectorAll('input[name]')].filter((i) => !i.checkValidity()).map((i) => i.name);
        setBad(invalid);
        if (invalid.length) { e.currentTarget.querySelector(`[name="${invalid[0]}"]`).focus(); return; }
        if (products.length === 0) return setError('Your cart is empty.');
        try {
            const res = await createOrder({ items: orderItems, shippingAddress: address, paymentMethod }).unwrap();
            const order = res.data.order;

            if (paymentMethod === 'COD') {
                finishSuccess(order);
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
                theme: { color: '#c8102e' },
                handler: async (response) => {
                    try {
                        await verifyPayment({
                            orderId: order._id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        }).unwrap();
                        finishSuccess(order);
                    } catch {
                        setError('Payment verification failed.');
                    }
                },
            });
            rzp.open();
        } catch (err) {
            setError(err?.data?.message || 'Could not place order.');
        }
    };

    const FIELDS = [
        ['fullName', 'Full name', { placeholder: 'e.g. Priya Sharma',autoComplete: 'name' }, 'Enter your full name'],
        ['phone', 'Mobile number', { placeholder: '10 digits, e.g. 9876543210',inputMode: 'numeric', pattern: '[6-9][0-9]{9}', autoComplete: 'tel-national' }, 'Enter a 10-digit mobile number'],
        ['line1', 'House no., building, street', { placeholder: 'e.g. Flat 12B, Sunrise Apartments, MG Road',autoComplete: 'address-line1', wide: true }, 'Enter your address'],
        ['line2', 'Area, landmark (optional)', { placeholder: 'e.g. Near City Mall',autoComplete: 'address-line2', wide: true, optional: true }],
        ['postalCode', 'PIN code', { placeholder: 'e.g. 560001',inputMode: 'numeric', pattern: '[1-9][0-9]{5}', autoComplete: 'postal-code' }, 'Enter a 6-digit PIN code'],
        ['city', 'City', { placeholder: 'e.g. Bengaluru',autoComplete: 'address-level2' }, 'Enter your city'],
        ['state', 'State', { placeholder: 'e.g. Karnataka',autoComplete: 'address-level1', wide: true }, 'Enter your state'],
    ];
    const count = products.reduce((n, p) => n + p.quantity, 0);

    return (
        <main className='wf-page'>
            <div className='wf-wrap wf-page-top'>
                <nav className='wf-crumbs' aria-label='Breadcrumb'><Link to='/' className='wf-u'>Home</Link><span>/</span><span>Checkout</span></nav>
                <h1 style={{ fontSize: 'clamp(34px, 4vw, 56px)', lineHeight: 1, marginTop: 14 }}>Checkout</h1>
                <ol className='wf-steps'><li className='done'>Bag</li><li className='on'>Delivery and payment</li><li>Confirmation</li></ol>
            </div>
            {products.length === 0 ? (
                <div className='wf-wrap'><p className='wf-empty'><b>Your bag is empty</b><Link to='/' className='wf-u'>Continue shopping</Link></p></div>
            ) : (
                <div className='wf-wrap wf-co'>
                    <form onSubmit={handlePlaceOrder} noValidate>
                        <section className='wf-co__box'>
                            <h2><span>1</span>Delivery address</h2>
                            <div className='wf-fields'>
                                {FIELDS.map(([k, label, { wide, optional, ...attrs }, err]) => (
                                    <div key={k} className={`wf-field ${wide ? 'wide' : ''} ${bad.includes(k) ? 'bad' : ''}`}>
                                        <input
                                            id={`co-${k}`} name={k} placeholder=' ' required={!optional} {...attrs}
                                            value={address[k]}
                                            onChange={(e) => { setField(k, e.target.value); setBad((b) => b.filter((x) => x !== k)); }}
                                        />
                                        <label htmlFor={`co-${k}`}>{label}</label>
                                        {err && <span className='wf-err'>{err}</span>}
                                    </div>
                                ))}
                            </div>
                        </section>
                        <section className='wf-co__box'>
                            <h2><span>2</span>Payment</h2>
                            <div className='wf-pay'>
                                {[
                                    { v: 'COD', icon: 'ri-hand-coin-line', label: 'Cash on delivery', desc: 'Pay in cash or UPI when your order arrives' },
                                    { v: 'RAZORPAY', icon: 'ri-secure-payment-line', label: 'Pay online', desc: 'Secure payment via Razorpay', methods: ['UPI', 'VISA', 'MASTERCARD', 'RUPAY', 'NET BANKING'] },
                                ].map((m) => (
                                    <label key={m.v}>
                                        <input type='radio' name='pay' checked={paymentMethod === m.v} onChange={() => setPaymentMethod(m.v)} />
                                        <span className='wf-pay__card'>
                                            <i className={m.icon}></i><b>{m.label}</b><small>{m.desc}</small><span className='wf-tick'></span>
                                            {m.methods && <span className='wf-methods'>{m.methods.map((x) => <span key={x}>{x}</span>)}</span>}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </section>
                        {error && <p className='wf-alert' role='alert'>{error}</p>}
                        <button type='submit' className={`wf-btn wf-btn--block wf-place ${creating ? 'busy' : ''}`}>
                            {creating ? 'Placing order' : `Place order · ${formatINR(grandTotal)}`}
                        </button>
                        <p className='wf-secure'><i className='ri-lock-line'></i> Your details are encrypted and never stored with your card</p>
                    </form>

                    <aside className='wf-co__sum' aria-label='Order summary'>
                        <h2>Your order <span>({count} item{count === 1 ? '' : 's'})</span></h2>
                        <ul className='wf-mini'>
                            {products.map((p) => (
                                <li key={p.key || p._id}>
                                    <span className='wf-mini__ph'><img src={p.image} alt='' /><span>{p.quantity}</span></span>
                                    <div>{p.name}{(p.color || p.size) && <small>{[p.color, p.size].filter(Boolean).join(' · ')}</small>}</div>
                                    <b>{formatINR(p.price * p.quantity)}</b>
                                </li>
                            ))}
                        </ul>
                        <Totals />
                    </aside>
                </div>
            )}
        </main>
    );
};

export default Checkout;
