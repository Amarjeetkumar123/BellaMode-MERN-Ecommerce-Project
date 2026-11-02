import { useState } from 'react'
import { useGetRequestsQuery, useUpdateRequestMutation } from '../../../redux/features/support/supportApi'
import { formatINR } from '../../../utils/formatCurrency'
import { HELP_TOPIC, fmtDate } from '../../../data/orders'
import Seg from '../../../components/Seg'
import AdminPager from './AdminPager'
import { card, primaryBtn, ghostBtn, statusPill } from './adminUI'
import { AdminHead } from './AdminParts'
import { InlineLoader } from '../../../components/Loaders'

const PAYMENT = { PAID: 'paid', PENDING: 'not paid', REFUNDED: 'refunded', FAILED: 'failed' };

// One request: what the customer said, the order it's about, and a reply box.
const Request = ({ r }) => {
    const [reply, setReply] = useState(r.reply || '');
    const [msg, setMsg] = useState('');
    const [update, { isLoading }] = useUpdateRequestMutation();
    const o = r.order || {};
    const save = async (body, done) => {
        try { await update({ id: r._id, ...body }).unwrap(); setMsg(done); }
        catch (err) { setMsg(err?.data?.message || 'Couldn’t save.'); }
    };

    return (
        <article className={`${card} space-y-3`}>
            <div className='flex flex-wrap items-baseline gap-x-4 gap-y-1'>
                <b>{HELP_TOPIC[r.topic] || r.topic}</b>
                <span className={statusPill(r.status === 'OPEN' ? 'pending' : 'delivered')}>{r.status === 'OPEN' ? 'Open' : 'Resolved'}</span>
                <span className='text-sm wf-muted ml-auto'>{fmtDate(r.create_date, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</span>
            </div>
            <p className='text-sm'>
                <b>{r.user?.username || 'Customer'}</b> <span className='wf-muted'>{r.user?.email}</span>
                <br />
                <span className='wf-muted'>
                    Order #{String(o._id || r.order).slice(-8).toUpperCase()}
                    {o.totalPrice != null && <> · {formatINR(o.totalPrice)} · {o.paymentMethod === 'COD' ? 'cash on delivery' : `online, ${PAYMENT[o.paymentStatus] || ''}`} · {(o.status || '').toLowerCase()}</>}
                    {o.cancelReason && <> · cancelled: “{o.cancelReason}”</>}
                </span>
            </p>
            <p className='whitespace-pre-line'>{r.message}</p>
            <label className='block'>
                <span className='wf-alabel'>Reply to the customer (they see it under the order)</span>
                <textarea className='wf-ainput' rows={3} maxLength={1000} value={reply} onChange={(e) => { setReply(e.target.value); setMsg(''); }}
                    placeholder='e.g. Sorry about that. We’ve refunded ₹1,299 to your card; it shows in 5 to 7 working days.' />
            </label>
            <div className='flex flex-wrap items-center gap-2'>
                {r.status === 'OPEN' ? (
                    <>
                        <button type='button' className={primaryBtn} disabled={isLoading || !reply.trim()} onClick={() => save({ reply, status: 'RESOLVED' }, 'Reply sent and marked resolved.')}>Reply and resolve</button>
                        <button type='button' className={ghostBtn} disabled={isLoading || !reply.trim()} onClick={() => save({ reply }, 'Reply sent. Still open.')}>Reply, keep open</button>
                        <button type='button' className='wf-linkbtn wf-u' disabled={isLoading} onClick={() => save({ status: 'RESOLVED' }, 'Marked resolved.')}>Resolve without reply</button>
                    </>
                ) : (
                    <>
                        <button type='button' className={ghostBtn} disabled={isLoading || reply === (r.reply || '')} onClick={() => save({ reply }, 'Reply updated.')}>Update reply</button>
                        <button type='button' className='wf-linkbtn wf-u' disabled={isLoading} onClick={() => save({ status: 'OPEN' }, 'Reopened.')}>Reopen</button>
                    </>
                )}
                {msg && <span className='text-sm font-bold' role='status'>{msg}</span>}
            </div>
        </article>
    );
};

const ManageHelp = () => {
    const [status, setStatus] = useState('OPEN');
    const [page, setPage] = useState(1);
    const { data, isLoading } = useGetRequestsQuery({ status: status === 'ALL' ? undefined : status, page, limit: 10 });
    const d = data?.data;
    const requests = d?.requests || [];

    return (
        <div>
            <AdminHead title='Help requests' sub='Questions customers sent about their orders: refunds, returns, delivery and more.'>
                <Seg label='Show' value={status} onChange={(v) => { setStatus(v); setPage(1); }}
                    options={[['OPEN', 'Open', d?.openCount ?? 0], ['RESOLVED', 'Resolved'], ['ALL', 'All']]} />
            </AdminHead>
            {isLoading ? <InlineLoader label='Loading requests' /> : requests.length === 0 ? (
                <div className='wf-blank'><b>{status === 'OPEN' ? 'Nothing waiting' : 'No requests here'}</b>{status === 'OPEN' ? 'New help requests from customers appear here.' : 'Try another filter.'}</div>
            ) : (
                <div className='space-y-4 max-w-3xl'>
                    {requests.map((r) => <Request key={`${r._id}-${r.update_date}`} r={r} />)}
                    <AdminPager page={page} totalPages={d?.totalPages} total={d?.total} onChange={setPage} label='requests' />
                </div>
            )}
        </div>
    );
};

export default ManageHelp;
