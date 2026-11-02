import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from '../../../redux/features/orders/ordersApi'
import { formatINR } from '../../../utils/formatCurrency'
import AdminPager from './AdminPager'
import { card, input, statusPill } from './adminUI'
import { AdminHead, FilterBar, Pick } from './AdminParts'
import { useUrlFilters } from './useUrlFilters'
import Seg from '../../../components/Seg'

const STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const cap = (s) => s.charAt(0) + s.slice(1).toLowerCase();

const ManageOrders = () => {
    const [f, setF, filtering, clearF] = useUrlFilters({ q: '', status: 'all', payment: 'all', days: 'all', sort: 'newest', page: '1' });
    const page = Number(f.page) || 1;
    const setPage = (n) => setF({ page: String(n) });
    const { data, isLoading, isFetching } = useGetAllOrdersQuery({
        limit: 20, page, sort: f.sort,
        ...(f.q && { search: f.q }),
        ...(f.status !== 'all' && { status: f.status }),
        ...(f.payment !== 'all' && { payment: f.payment }),
        ...(f.days !== 'all' && { days: f.days }),
    });
    const counts = data?.data?.statusCounts || {};
    const countAll = Object.values(counts).reduce((a, b) => a + b, 0);
    const [updateStatus] = useUpdateOrderStatusMutation();
    const orders = data?.data?.orders || [];
    const totalPages = data?.data?.totalPages || 1;
    const total = data?.data?.total || orders.length;

    const handleStatus = async (id, status) => { await updateStatus({ id, status }); };


    return (
        <div>
            <AdminHead title='All orders' sub='Change a status and the customer sees it in their account.' />
            <div className='mb-3 max-w-full overflow-x-auto'>
                <Seg label='Order status' value={f.status} onChange={(status) => setF({ status })}
                    options={[['all', 'All', countAll], ...STATUSES.map((st) => [st, cap(st), counts[st] || 0])]} />
            </div>
            <FilterBar search={f.q} onSearch={(q) => setF({ q })} placeholder='Order number, customer name or email'
                count={`${total} order${total === 1 ? '' : 's'}`} active={filtering} onClear={clearF}>
                <Pick label='Payment' value={f.payment} onChange={(payment) => setF({ payment })}
                    options={[['all', 'Any payment'], ['cod', 'Cash on delivery'], ['paid', 'Online, paid'], ['unpaid', 'Online, not paid'], ['refunded', 'Refunded']]} />
                <Pick label='Placed' value={f.days} onChange={(days) => setF({ days })}
                    options={[['all', 'Any time'], ['1', 'Last 24 hours'], ['7', 'Last 7 days'], ['30', 'Last 30 days'], ['90', 'Last 90 days']]} />
                <Pick label='Sort' value={f.sort} onChange={(sort) => setF({ sort })}
                    options={[['newest', 'Newest first'], ['oldest', 'Oldest first'], ['total_desc', 'Total, high to low'], ['total_asc', 'Total, low to high']]} />
            </FilterBar>
            {isLoading ? <p className='wf-muted'>Loading…</p> : orders.length === 0 ? (
                filtering
                    ? <div className='wf-blank'><b>No orders match these filters</b><button type='button' className='wf-linkbtn wf-u' onClick={clearF}>Clear filters</button></div>
                    : <div className='wf-blank'><b>No orders yet</b>New orders appear here as soon as they’re placed.</div>
            ) : (
                <div className={`${card} !p-0 overflow-hidden transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                            <thead><tr>
                                <th className='text-left'>Order</th><th className='text-left'>Customer</th><th className='text-left'>Total</th><th className='text-left'>Payment</th><th className='text-left'>Status</th>
                            </tr></thead>
                            <tbody>
                                {orders.map((o) => (
                                    <tr key={o._id}>
                                        <td>
                                            <div className='font-bold'>#{o._id.slice(-8).toUpperCase()}</div>
                                            <div className='text-xs wf-muted'>{o.items.length} item{o.items.length === 1 ? '' : 's'} · {new Date(Number(o.create_date)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                                        </td>
                                        <td>{o.user?.username || '—'}<div className='text-xs wf-muted'>{o.shippingAddress?.city}</div></td>
                                        <td className='font-bold tabular-nums'>{formatINR(o.totalPrice)}</td>
                                        <td>{o.paymentMethod === 'COD' ? 'Cash on delivery' : 'Online'}<div className='text-xs wf-muted'>{{ PAID: 'Paid', PENDING: 'Not paid', REFUNDED: 'Refunded', FAILED: 'Failed' }[o.paymentStatus] || o.paymentStatus}</div></td>
                                        <td>
                                            <div className='flex flex-col items-start gap-1.5'>
                                                <span className={statusPill(o.status)}>{(o.status || '').toLowerCase()}</span>
                                                {o.cancelReason && <span className='text-xs wf-muted'>Customer: “{o.cancelReason}”</span>}
                                                <select value={o.status} onChange={(e) => handleStatus(o._id, e.target.value)} className={`${input} !min-h-0 !py-1.5 !w-auto text-sm`} aria-label={`Status of order ${o._id.slice(-8).toUpperCase()}`}>
                                                    {STATUSES.map((st) => <option key={st} value={st}>{cap(st)}</option>)}
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <AdminPager page={page} totalPages={totalPages} total={total} onChange={setPage} label='orders' />
                </div>
            )}
        </div>
    );
};

export default ManageOrders;
