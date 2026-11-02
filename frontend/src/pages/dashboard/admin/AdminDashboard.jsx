import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetProductsQuery } from '../../../redux/features/products/productsApi'
import { useGetAllOrdersQuery, useGetOrderStatsQuery } from '../../../redux/features/orders/ordersApi'
import { useGetCategoriesQuery } from '../../../redux/features/categories/categoriesApi'
import { formatINR } from '../../../utils/formatCurrency'
import { TrendChart, BarList, ColumnChart, Donut, SERIES } from './Charts'
import { card, titleFont, statusPill, linkBtn } from './adminUI'
import { AdminHead } from './AdminParts'
import Seg from '../../../components/Seg'

// Order status is an ordinal pipeline, so it gets one grey stepped light→dark.
// Cancelled is the one genuine exception and takes the brand red.
const STATUS_COLOR = {
    PENDING: '#c9c9c5',
    PROCESSING: '#9a9a9a',
    SHIPPED: '#5f6368',
    DELIVERED: '#000000',
    CANCELLED: '#c8102e',
};
const STATUS_ORDER = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const RANGES = [
    { label: '7 days', days: 7 },
    { label: '30 days', days: 30 },
    { label: '90 days', days: 90 },
];

const Stat = ({ label, value, sub, icon, warn }) => (
    <div className={`wf-astat ${warn ? 'warn' : ''}`}>
        <i className={icon} aria-hidden='true'></i>
        <small>{label}</small>
        <b title={String(value)}>{value}</b>
        {sub && <span>{sub}</span>}
    </div>
);

const AdminDashboard = () => {
    const [days, setDays] = useState(30);

    const { data: prod } = useGetProductsQuery({ limit: 100 });
    // Totals come from a Mongo aggregation, NOT a page of orders — otherwise
    // revenue silently under-reports once the store passes one page of results.
    const { data: statsRes } = useGetOrderStatsQuery({ days });
    const { data: orders } = useGetAllOrdersQuery({ limit: 5 });
    const { data: cats } = useGetCategoriesQuery();
    // stock alerts come from the server, so they count every product, not just one page
    const { data: outData } = useGetProductsQuery({ stock: 'out', limit: 6, sort: 'name_asc' });
    const { data: lowData } = useGetProductsQuery({ stock: 'low', limit: 6, sort: 'stock_asc' });
    const out = { list: outData?.data?.products || [], total: outData?.data?.total || 0 };
    const low = { list: lowData?.data?.products || [], total: lowData?.data?.total || 0 };

    const stats = statsRes?.data;
    const orderList = useMemo(() => orders?.data?.orders || [], [orders]);
    const productList = useMemo(() => prod?.data?.products || [], [prod]);

    const analytics = useMemo(() => {
        // Zero-fill every day in the window so quiet days stay visible.
        const now = Date.now();
        const byDay = new Map();
        for (let i = days - 1; i >= 0; i--) {
            byDay.set(new Date(now - i * 86400000).toISOString().slice(0, 10), 0);
        }
        (stats?.daily || []).forEach((d) => {
            if (byDay.has(d.date)) byDay.set(d.date, d);
        });
        const trend = [...byDay.entries()].map(([iso, d0]) => {
            const d = new Date(iso);
            return {
                label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                full: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                value: d0?.revenue || 0,
                count: d0?.count || 0,
            };
        });
        const perDay = trend.map((p) => ({ ...p, value: p.count }));

        const statusCount = Object.fromEntries((stats?.byStatus || []).map((s) => [(s.status || '').toUpperCase(), s.count]));
        const statusRows = STATUS_ORDER
            .filter((s) => statusCount[s])
            .map((s) => ({
                label: s.charAt(0) + s.slice(1).toLowerCase(),
                value: statusCount[s],
                color: STATUS_COLOR[s],
            }));

        const payRows = (stats?.byPayment || []).map((p) => ({
            label: p.method === 'COD' ? 'Cash on delivery' : 'Paid online',
            value: p.count,
            color: p.method === 'COD' ? '#9a9a9a' : SERIES,
        }));
        const storeRows = (stats?.byStore || []).map((s) => ({
            label: s.store === 'unisex' ? 'All stores' : s.store.charAt(0).toUpperCase() + s.store.slice(1),
            value: Math.round(s.revenue),
        }));

        const topProducts = (stats?.topProducts || []).map((t) => ({
            label: t.name,
            value: t.units,
            meta: t.units === 1 ? 'unit' : 'units',
        }));

        // Catalogue mix is a product-side metric, so it stays client-side.
        const audCount = {};
        productList.forEach((p) => { audCount[p.audience] = (audCount[p.audience] || 0) + 1; });
        const mix = Object.entries(audCount)
            .sort((a, b) => b[1] - a[1])
            .map(([k, v]) => ({ label: k.charAt(0).toUpperCase() + k.slice(1), value: v, meta: 'products' }));

        const ordersWindow = stats?.ordersWindow || 0;
        const revenueWindow = stats?.revenueWindow || 0;
        const aov = ordersWindow ? Math.round(revenueWindow / ordersWindow) : 0;

        return {
            trend, perDay, statusRows, payRows, storeRows, topProducts, mix,
            revenueWindow, revenueAll: stats?.revenueAll || 0,
            ordersWindow, ordersAll: stats?.ordersAll || 0,
            aov,
        };
    }, [stats, productList, days]);

    const recent = orderList;
    const rangeLabel = RANGES.find((r) => r.days === days)?.label || `${days} days`;

    return (
        <div>
            <AdminHead title='Overview' sub='Store performance at a glance.'>
                <Seg label='Date range' options={RANGES.map((r) => [r.days, r.label])} value={days} onChange={setDays} />
            </AdminHead>

            {/* Headline figures */}
            <div className='wf-astats'>
                <Stat label={`Revenue · ${rangeLabel}`} value={formatINR(analytics.revenueWindow)}
                    sub={`${formatINR(analytics.revenueAll)} all time`}
                    icon='ri-money-rupee-circle-line' />
                <Stat label={`Orders · ${rangeLabel}`} value={analytics.ordersWindow}
                    sub={`${analytics.ordersAll} all time`}
                    icon='ri-shopping-bag-line' />
                <Stat label='Avg. order value' value={formatINR(analytics.aov)}
                    sub={rangeLabel} icon='ri-bar-chart-2-line' />
                <Stat label='Products' value={prod?.data?.total ?? productList.length}
                    sub={out.total || low.total ? [out.total && `${out.total} out of stock`, low.total && `${low.total} running low`].filter(Boolean).join(' · ') : `${cats?.data?.categories?.length ?? 0} categories`}
                    icon='ri-t-shirt-line' warn={out.total + low.total > 0} />
            </div>

            {/* Stock alerts: only when something needs restocking */}
            {out.total + low.total > 0 && (
                <div className={`${card} mb-6 wf-stockalert`}>
                    <h3 style={titleFont}><i className='ri-alert-line' aria-hidden='true'></i> Needs restocking</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-4'>
                        {[['Out of stock', out, 'out', 'Shoppers see “Out of stock” and can’t add these to their bag.'], ['Running low (5 or fewer)', low, 'low', 'Shoppers see “Only 3 left” on the product.']]
                            .filter(([, g]) => g.total > 0)
                            .map(([title, g, key, note]) => (
                                <div key={key}>
                                    <p className='font-bold'>{title} <span className='wf-apill is-cancelled'>{g.total}</span></p>
                                    <p className='text-xs wf-muted mt-1'>{note}</p>
                                    <ul className='mt-3 space-y-2 text-sm'>
                                        {g.list.map((p) => (
                                            <li key={p._id} className='flex items-center gap-3'>
                                                <img src={p.images?.[0]} alt='' className='w-8 object-cover shrink-0' style={{ aspectRatio: '3 / 4' }} />
                                                <span className='truncate'>{p.name}</span>
                                                <span className='ml-auto tabular-nums font-bold wf-danger'>{p.stock > 0 ? `${p.stock} left` : 'Sold out'}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Link to={`/dashboard/manage-products?stock=${key}&sort=stock_asc`} className={`${linkBtn} inline-block mt-3`}>
                                        {g.total > g.list.length ? `See all ${g.total}` : 'Restock in Products'}
                                    </Link>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Revenue trend */}
            <div className={`${card} mb-6`}>
                <div className='flex items-baseline justify-between mb-4'>
                    <h3 style={titleFont}>Revenue · last {rangeLabel}</h3>
                    <span className='text-sm wf-muted'>
                        <span className='inline-block w-2.5 h-2.5 rounded-full mr-1.5 align-middle' style={{ background: SERIES }} />
                        {formatINR(analytics.revenueWindow)} total
                    </span>
                </div>
                {analytics.revenueWindow === 0 ? (
                    <p className='text-sm wf-muted py-8 text-center'>No revenue in this period yet.</p>
                ) : (
                    <TrendChart points={analytics.trend} valuePrefix='₹' />
                )}
            </div>

            {/* Orders per day + where they are now */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
                <div className={`${card} lg:col-span-2`}>
                    <div className='flex items-baseline justify-between mb-4'>
                        <h3 style={titleFont}>Orders per day</h3>
                        <span className='text-sm wf-muted'>{analytics.ordersWindow} in {rangeLabel}</span>
                    </div>
                    {analytics.ordersWindow === 0
                        ? <p className='text-sm wf-muted py-8 text-center'>No orders in this period yet.</p>
                        : <ColumnChart points={analytics.perDay} />}
                </div>
                <div className={card}>
                    <h3 className='mb-4' style={titleFont}>Order status</h3>
                    <Donut rows={analytics.statusRows} emptyText='No orders yet.' />
                </div>
            </div>

            {/* Breakdowns */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
                <div className={card}>
                    <h3 className='mb-4' style={titleFont}>Sales by store · {rangeLabel}</h3>
                    <BarList rows={analytics.storeRows} valuePrefix='₹' emptyText='No sales in this period yet.' />
                </div>
                <div className={card}>
                    <h3 className='mb-4' style={titleFont}>How customers pay · {rangeLabel}</h3>
                    <Donut rows={analytics.payRows} emptyText='No orders in this period yet.' />
                </div>
                <div className={card}>
                    <h3 className='mb-4' style={titleFont}>Best sellers</h3>
                    <BarList rows={analytics.topProducts} emptyText='No sales recorded yet.' />
                </div>
                <div className={card}>
                    <h3 className='mb-4' style={titleFont}>Catalogue by department</h3>
                    <BarList rows={analytics.mix} emptyText='No products yet.' />
                </div>
            </div>

            {/* Recent orders */}
            <div className={card}>
                <div className='flex items-center justify-between mb-4'>
                    <h3 style={titleFont}>Recent orders</h3>
                    <Link to='/dashboard/manage-orders' className={linkBtn}>View all</Link>
                </div>
                {recent.length === 0 ? (
                    <p className='wf-muted text-sm'>No orders yet.</p>
                ) : (
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                            <thead>
                                <tr className='text-left'>
                                    <th className='py-2 font-medium'>Order</th>
                                    <th className='py-2 font-medium'>Date</th>
                                    <th className='py-2 font-medium'>Status</th>
                                    <th className='py-2 font-medium text-right'>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.map((o) => (
                                    <tr key={o._id}>
                                        <td className='py-2.5 font-mono'>#{o._id.slice(-8).toUpperCase()}</td>
                                        <td className='py-2.5 wf-muted'>{new Date(Number(o.create_date)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                                        <td className='py-2.5'>
                                            <span className={statusPill(o.status)}>{(o.status || '').toLowerCase()}</span>
                                        </td>
                                        <td className='py-2.5 text-right font-medium tabular-nums'>{formatINR(o.totalPrice)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
