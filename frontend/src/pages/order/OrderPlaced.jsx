import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useGetOrderQuery } from '../../redux/features/orders/ordersApi'
import { formatINR } from '../../utils/formatCurrency'
import { etaRange, orderNo } from '../../data/orders'
import { Track } from '../account/OrderCard'

// Shown right after checkout: /order/:id
const OrderPlaced = () => {
    const { id } = useParams();
    const { user } = useSelector((s) => s.auth);
    const { data, isLoading, isError } = useGetOrderQuery(id);
    const o = data?.data?.order;
    const [copied, setCopied] = useState(false);

    if (isLoading) return <main className='wf-wrap wf-pagehead'><p className='wf-muted'>Loading your order…</p></main>;
    if (isError || !o) return (
        <main className='wf-wrap wf-pagehead' style={{ paddingBottom: 88 }}>
            <p className='wf-kick'>Order</p><h1>We couldn’t find that order</h1>
            <p className='wf-intro'>It may belong to another account. Your orders are all in <Link to='/dashboard/orders' className='wf-u'>your account</Link>.</p>
        </main>
    );

    const no = orderNo(o);
    const a = o.shippingAddress || {};
    const cod = o.paymentMethod === 'COD';
    const copy = () => { navigator.clipboard?.writeText(no); setCopied(true); setTimeout(() => setCopied(false), 1600); };

    return (
        <main className='wf-wrap wf-page'>
            <div className='wf-placed'>
                <svg className='wf-tickmark' viewBox='0 0 88 88' aria-hidden='true'><circle cx='44' cy='44' r='40' /><path d='m28 45 11 11 22-23' /></svg>
                <p className='wf-kick'>Order confirmed</p>
                <h1>Thank you{user?.username ? `, ${user.username.split(' ')[0]}` : ''}</h1>
                <p className='wf-intro'>Your order is in. You can follow it any time from Orders in your account.</p>
                <div className='wf-ordno'>Order #{no}<button type='button' onClick={copy}>{copied ? 'Copied' : 'Copy'}</button></div>
                <div className='wf-acts'>
                    <Link to='/dashboard/orders' className='wf-btn'>Track order<i className='ri-arrow-right-line'></i></Link>
                    <Link to='/' className='wf-btn wf-btn--line'>Continue shopping</Link>
                </div>
            </div>
            <div className='wf-done-grid'>
                <div>
                    <div className='wf-eta'>
                        <small>Estimated delivery</small>
                        <b>{etaRange(o.create_date)}</b>
                        <Track order={o} />
                    </div>
                    <p className='wf-sub'>What happens next</p>
                    <ol className='wf-next'>
                        <li><span><b>We pack your order</b>Usually within a day.</span></li>
                        <li><span><b>It ships</b>Its status changes to “On the way” in your account.</span></li>
                        <li><span><b>{cod ? 'Pay on delivery' : 'Already paid'}</b>{cod ? `Cash or UPI when it arrives. Keep ${formatINR(o.totalPrice)} ready.` : 'Nothing more to pay. Keep an eye out for the courier.'}</span></li>
                    </ol>
                </div>
                <aside className='wf-osum' aria-label='Order summary'>
                    <h2>Order summary</h2>
                    <ul className='wf-mini'>
                        {o.items.map((it, i) => (
                            <li key={i}>
                                <div className='wf-mini__ph'><img src={it.image} alt='' />{it.quantity > 1 && <span>{it.quantity}</span>}</div>
                                <span>{it.name}<small>{[it.size && `Size ${it.size}`, it.color, `Qty ${it.quantity}`].filter(Boolean).join(' · ')}</small></span>
                                <b>{formatINR(it.price * it.quantity)}</b>
                            </li>
                        ))}
                    </ul>
                    <dl className='wf-sum'>
                        <dt>Subtotal</dt><dd>{formatINR(o.itemsPrice)}</dd>
                        <dt>Tax</dt><dd>{formatINR(o.tax)}</dd>
                        <dt>Delivery</dt><dd className={o.shippingPrice ? '' : 'free'}>{o.shippingPrice ? formatINR(o.shippingPrice) : 'Free'}</dd>
                        <dt className='total'>Total</dt><dd className='total'>{formatINR(o.totalPrice)}</dd>
                    </dl>
                    <p className='wf-muted' style={{ fontSize: 13, marginTop: 14 }}>Delivering to {a.fullName}, {[a.line1, a.line2, a.city].filter(Boolean).join(', ')} {a.postalCode}</p>
                </aside>
            </div>
        </main>
    );
};

export default OrderPlaced;
