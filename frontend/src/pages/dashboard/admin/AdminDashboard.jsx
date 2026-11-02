import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetProductsQuery } from '../../../redux/features/products/productsApi'
import { useGetAllOrdersQuery, useGetOrderStatsQuery } from '../../../redux/features/orders/ordersApi'
import { useGetCategoriesQuery } from '../../../redux/features/categories/categoriesApi'
import { formatINR } from '../../../utils/formatCurrency'
import { TrendChart, BarList, SERIES } from './Charts'
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
            if (byDay.has(d.date)) byDay.set(d.date, d.revenue);
        });
        const trend = [...byDay.entries()].map(([iso, value]) => {
            const d = new Date(iso);
            return {
                label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                full: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                value,
            };
        });

        const statusCount = Object.fromEntries((stats?.byStatus || []).map((s) => [(s.status || '').toUpperCase(), s.count]));
        const statusRows = STATUS_ORDER
            .filter((s) => statusCount[s])
            .map((s) => ({
                label: s.charAt(0) + s.slice(1).toLowerCase(),
                value: statusCount[s],
                color: STATUS_COLOR[s],
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
        const lowStock = productList.filter((p) => (p.stock ?? 0) <= 5).length;

        return {
            trend, statusRows, topProducts, mix,
            revenueWindow, revenueAll: stats?.revenueAll || 0,
            ordersWindow, ordersAll: stats?.ordersAll || 0,
            aov, lowStock,
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
                    sub={analytics.lowStock ? `${analytics.lowStock} low on stock` : `${cats?.data?.categories?.length ?? 0} categories`}
                    icon='ri-t-shirt-line' warn={analytics.lowStock > 0} />
            </div>

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

            {/* Breakdowns */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
                <div className={card}>
                    <h3 className='mb-4' style={titleFont}>Order pipeline</h3>
                    <BarList rows={analytics.statusRows} emptyText='No orders yet.' />
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
