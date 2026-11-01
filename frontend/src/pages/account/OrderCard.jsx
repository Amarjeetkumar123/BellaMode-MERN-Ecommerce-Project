import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart } from '../../redux/features/cart/cartSlice'
import { formatINR } from '../../utils/formatCurrency'
import { ORDER_LABEL, ORDER_STEP, ORDER_STEPS, PAYMENT_LABEL, etaRange, fmtDate, orderNo, orderTone } from '../../data/orders'

// Placed → Packed → Shipped → Delivered. The line fills in once it's on screen.
export const Track = ({ order }) => {
    const step = ORDER_STEP[order.status] ?? 1;
    const [go, setGo] = useState(false);
    useEffect(() => { const t = setTimeout(() => setGo(true), 60); return () => clearTimeout(t); }, []);
    return (
        <ol className={`wf-track ${go ? 'go' : ''}`} aria-label={`Progress: ${ORDER_STEPS[Math.max(step, 1) - 1]}`}>
            {ORDER_STEPS.map((s, k) => (
                <li key={s} style={{ '--k': k }} className={`${k < step ? 'done' : ''} ${k === step - 1 && step < 4 ? 'now' : ''}`}>
                    {s}<small>{k === 0 ? fmtDate(order.create_date, { day: 'numeric', month: 'short' }) : k === step - 1 && step > 1 ? 'Latest' : ' '}</small>
                </li>
            ))}
        </ol>
    );
};

const note = (o) => {
    if (o.status === 'DELIVERED') return <>Delivered. Returns are open for 30 days.</>;
    if (o.status === 'CANCELLED') return <>Cancelled{o.paymentStatus === 'PAID' ? '. Your refund is on its way.' : '.'}</>;
    return <>Arriving <b>{etaRange(o.create_date)}</b></>;
};

// One order: summary row, photos, actions, and a fold-out with progress, items and payment.
const OrderCard = ({ order: o, open = false, compact = false }) => {
    const dispatch = useDispatch();
    const tone = orderTone(o.status);
    const a = o.shippingAddress || {};

    const buyAgain = () => {
        o.items.forEach((it) => dispatch(addToCart({
            _id: String(it.product?._id || it.product), name: it.name, price: it.price, image: it.image,
            quantity: it.quantity, ...(it.size && { size: it.size }), ...(it.color && { color: it.color }),
        })));
        window.dispatchEvent(new Event('wf:open-bag'));
    };

    return (
        <article className='wf-order'>
            <dl className='wf-order__head'>
                <div><dt>Order</dt><dd>#{orderNo(o)}</dd></div>
                <div><dt>Placed</dt><dd>{fmtDate(o.create_date)}</dd></div>
                <div><dt>Total</dt><dd>{formatINR(o.totalPrice)}</dd></div>
                <span className={`wf-status ${tone}`}><i></i>{ORDER_LABEL[o.status] || o.status}</span>
            </dl>
            <div className='wf-order__body'>
                <div>
                    <div className='wf-othumbs'>
                        {o.items.map((it, i) => (
                            <Link key={i} to={`/shop/${it.product?._id || it.product}`} aria-label={it.name}><img src={it.image} alt='' loading='lazy' /></Link>
                        ))}
                    </div>
                    {compact && tone === 'way' && <Track order={o} />}
                    <p>{note(o)}</p>
                </div>
                <div className='wf-acts'>
                    {tone === 'way' && !compact && <a href={`#d-${o._id}`} className='wf-btn wf-btn--sm' onClick={(e) => { e.preventDefault(); const d = document.getElementById(`d-${o._id}`); d.open = true; d.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }}>Track order</a>}
                    {compact && <Link to='/dashboard/orders' className='wf-btn wf-btn--sm'>Track order</Link>}
                    {tone === 'done' && <Link to='/help/shipping#returns' className='wf-btn wf-btn--sm wf-btn--line'>Return or exchange</Link>}
                    {tone !== 'way' && <button type='button' className={`wf-btn wf-btn--sm ${tone === 'cancel' ? 'wf-btn--line' : ''}`} onClick={buyAgain}>Buy again</button>}
                </div>
            </div>
            {!compact && (
                <details id={`d-${o._id}`} open={open}>
                    <summary>Order details<span className='wf-pm'></span></summary>
                    <div className='wf-order__more'>
                        <div>
                            {tone !== 'cancel' && <><h4>Progress</h4><Track order={o} /></>}
                            <h4 style={{ marginTop: tone !== 'cancel' ? 20 : 0 }}>Items</h4>
                            <ul>{o.items.map((it, i) => (
                                <li key={i}>{it.name}<br /><span className='wf-muted'>{[it.size && `Size ${it.size}`, it.color, `Qty ${it.quantity}`, formatINR(it.price * it.quantity)].filter(Boolean).join(' · ')}</span></li>
                            ))}</ul>
                        </div>
                        <div>
                            <h4>Delivery address</h4>
                            {a.fullName}<br />{[a.line1, a.line2].filter(Boolean).join(', ')}<br />{a.city}, {a.state} {a.postalCode}<br /><span className='wf-muted'>{a.phone}</span>
                        </div>
                        <div>
                            <h4>Payment</h4>
                            {PAYMENT_LABEL[o.paymentMethod] || o.paymentMethod}<br /><span className='wf-muted'>{o.paymentStatus === 'PAID' ? 'Paid' : o.paymentMethod === 'COD' ? 'Pay on delivery' : 'Not paid'}</span>
                            <dl className='wf-sum'>
                                <dt>Subtotal</dt><dd>{formatINR(o.itemsPrice)}</dd>
                                <dt>Tax</dt><dd>{formatINR(o.tax)}</dd>
                                <dt>Delivery</dt><dd>{o.shippingPrice ? formatINR(o.shippingPrice) : 'Free'}</dd>
                                <dt className='total'>Total</dt><dd className='total'>{formatINR(o.totalPrice)}</dd>
                            </dl>
                        </div>
                    </div>
                </details>
            )}
        </article>
    );
};

export default OrderCard;
