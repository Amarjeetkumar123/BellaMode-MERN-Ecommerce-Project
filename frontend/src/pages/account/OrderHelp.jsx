import { useRef, useState } from 'react'
import { useCancelOrderMutation } from '../../redux/features/orders/ordersApi'
import { useCreateRequestMutation, useGetMyRequestsQuery } from '../../redux/features/support/supportApi'
import { useActiveAudiences } from '../../hooks/useActiveAudiences'
import { formatINR } from '../../utils/formatCurrency'
import { HELP_TOPIC, fmtDate, orderNo, orderTone } from '../../data/orders'

const REASONS = ['Changed my mind', 'Ordered by mistake', 'Found a better price', 'Delivery is too slow', 'Want a different size or colour', 'Other'];
// what people usually need at each stage of an order
const TOPICS = {
    way: ['DELIVERY', 'PAYMENT', 'OTHER'],
    done: ['RETURN', 'REFUND', 'DAMAGED', 'WRONG_ITEM', 'OTHER'],
    cancel: ['REFUND', 'PAYMENT', 'OTHER'],
};
const HINT = {
    REFUND: 'e.g. I cancelled on Monday and haven’t got my money back yet.',
    RETURN: 'e.g. The shirt is too big. Can I swap it for a size M?',
    DAMAGED: 'e.g. The jeans arrived with a torn seam on the left leg.',
    WRONG_ITEM: 'e.g. I ordered the navy tee but got a black one.',
    DELIVERY: 'e.g. Tracking hasn’t moved for three days.',
    PAYMENT: 'e.g. I was charged twice for this order.',
    OTHER: 'Tell us what you need help with.',
};

// A modal on the browser's own <dialog>: focus stays inside, Esc closes it.
const Dialog = ({ dref, title, children }) => (
    <dialog ref={dref} className='wf-dialog' aria-labelledby={`${title}-h`.replace(/\W/g, '')} onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}>
        <div className='wf-dialog__in'>
            <button type='button' className='wf-dialog__x' aria-label='Close' onClick={() => dref.current.close()}><i className='ri-close-line'></i></button>
            <h2 id={`${title}-h`.replace(/\W/g, '')}>{title}</h2>
            {children}
        </div>
    </dialog>
);

const refundLine = (o) => {
    if (o.paymentStatus === 'PAID') return <>You paid online, so <b>{formatINR(o.totalPrice)}</b> goes back to your original payment method within 5 to 7 working days.</>;
    if (o.paymentMethod === 'COD') return <>You were paying on delivery, so there’s nothing to refund.</>;
    return null;
};

export const CancelOrder = ({ order: o, onDone }) => {
    const ref = useRef(null);
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [cancel, { isLoading }] = useCancelOrderMutation();

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await cancel({ id: o._id, reason }).unwrap();
            ref.current.close();
            const r = res.data.refund;
            onDone(r === 'done' ? `Order cancelled. ${formatINR(o.totalPrice)} is being refunded to your original payment method.`
                : r === 'pending' ? `Order cancelled. We’ll refund ${formatINR(o.totalPrice)} within 5 to 7 working days.`
                : 'Order cancelled.');
        } catch (err) { setError(err?.data?.message || 'Couldn’t cancel the order. Try again.'); }
    };

    return (
        <>
            <button type='button' className='wf-btn wf-btn--sm wf-btn--line' onClick={() => { setError(''); ref.current.showModal(); }}>Cancel order</button>
            <Dialog dref={ref} title='Cancel this order?'>
                <p className='wf-muted'>#{orderNo(o)} · {o.items.length} item{o.items.length === 1 ? '' : 's'} · {formatINR(o.totalPrice)}</p>
                <form onSubmit={submit}>
                    <fieldset className='wf-choices'>
                        <legend>Why are you cancelling? (optional)</legend>
                        {REASONS.map((r) => (
                            <label key={r}><input type='radio' name={`reason-${o._id}`} value={r} checked={reason === r} onChange={() => setReason(r)} /><span>{r}</span></label>
                        ))}
                    </fieldset>
                    {refundLine(o) && <p className='wf-dialog__note'><i className='ri-refund-2-line'></i><span>{refundLine(o)}</span></p>}
                    {error && <p className='wf-err-box' role='alert'>{error}</p>}
                    <div className='wf-dialog__acts'>
                        <button type='button' className='wf-btn wf-btn--sm wf-btn--line' onClick={() => ref.current.close()}>Keep order</button>
                        <button className='wf-btn wf-btn--sm' disabled={isLoading}>{isLoading ? 'Cancelling…' : 'Cancel order'}</button>
                    </div>
                </form>
            </Dialog>
        </>
    );
};

export const GetHelp = ({ order: o }) => {
    const ref = useRef(null);
    const topics = TOPICS[orderTone(o.status)];
    const [topic, setTopic] = useState(topics[0]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);
    const [send, { isLoading }] = useCreateRequestMutation();
    const { settings } = useActiveAudiences();

    const open = () => { setTopic(topics[0]); setMessage(''); setError(''); setSent(false); ref.current.showModal(); };
    const submit = async (e) => {
        e.preventDefault();
        if (message.trim().length < 10) return setError('Tell us a little more (at least 10 characters).');
        try { await send({ orderId: o._id, topic, message: message.trim() }).unwrap(); setSent(true); }
        catch (err) { setError(err?.data?.message || 'Couldn’t send that. Try again.'); }
    };

    return (
        <>
            <button type='button' className='wf-linkbtn wf-u' onClick={open}>Get help</button>
            <Dialog dref={ref} title='Help with this order'>
                {sent ? (
                    <div className='wf-dialog__sent' role='status'>
                        <i className='ri-checkbox-circle-line'></i>
                        <b>Thanks, we’ve got it.</b>
                        <p className='wf-muted'>We usually reply within 24 hours. The reply shows under this order in your account.</p>
                        <button type='button' className='wf-btn wf-btn--sm' onClick={() => ref.current.close()}>Done</button>
                    </div>
                ) : (
                    <form onSubmit={submit}>
                        <p className='wf-muted'>#{orderNo(o)} · placed {fmtDate(o.create_date)}</p>
                        <fieldset className='wf-choices'>
                            <legend>What do you need help with?</legend>
                            {topics.map((t) => (
                                <label key={t}><input type='radio' name={`topic-${o._id}`} value={t} checked={topic === t} onChange={() => setTopic(t)} /><span>{HELP_TOPIC[t]}</span></label>
                            ))}
                        </fieldset>
                        <label className='wf-tlabel' htmlFor={`msg-${o._id}`}>Tell us what happened</label>
                        <textarea id={`msg-${o._id}`} className='wf-textarea' rows={4} maxLength={1000} value={message}
                            onChange={(e) => { setMessage(e.target.value); setError(''); }} placeholder={HINT[topic]} />
                        {error && <p className='wf-err-box' role='alert'>{error}</p>}
                        {(settings?.contactEmail || settings?.contactPhone) && (
                            <p className='wf-dialog__note'><i className='ri-customer-service-2-line'></i><span>Need it sooner? {settings.contactPhone && <>Call <a className='wf-u' href={`tel:${settings.contactPhone.replace(/\s/g, '')}`}>{settings.contactPhone}</a></>}{settings.contactPhone && settings.contactEmail && ' or '}{settings.contactEmail && <>email <a className='wf-u' href={`mailto:${settings.contactEmail}?subject=Order ${orderNo(o)}`}>{settings.contactEmail}</a></>}.</span></p>
                        )}
                        <div className='wf-dialog__acts'>
                            <button type='button' className='wf-btn wf-btn--sm wf-btn--line' onClick={() => ref.current.close()}>Close</button>
                            <button className='wf-btn wf-btn--sm' disabled={isLoading}>{isLoading ? 'Sending…' : 'Send'}</button>
                        </div>
                    </form>
                )}
            </Dialog>
        </>
    );
};

// The customer's help requests for one order, with our replies.
export const OrderRequests = ({ orderId }) => {
    const { data } = useGetMyRequestsQuery();
    const list = (data?.data?.requests || []).filter((r) => String(r.order) === String(orderId));
    if (!list.length) return null;
    return (
        <ul className='wf-reqs' aria-label='Your help requests for this order'>
            {list.map((r) => (
                <li key={r._id}>
                    <div className='wf-reqs__top'>
                        <b>{HELP_TOPIC[r.topic] || r.topic}</b>
                        <span className={`wf-reqs__st ${r.status === 'OPEN' ? (r.reply ? 'is-replied' : 'is-open') : 'is-done'}`}>
                            {r.status === 'RESOLVED' ? 'Resolved' : r.reply ? 'Replied' : 'Waiting for reply'}
                        </span>
                        <small>{fmtDate(r.create_date, { day: 'numeric', month: 'short' })}</small>
                    </div>
                    <p>{r.message}</p>
                    {r.reply && <p className='wf-reqs__reply'><span>Our reply</span>{r.reply}</p>}
                </li>
            ))}
        </ul>
    );
};
