import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    useGetStoreProductsQuery,
    useGetStoreCategoriesQuery,
    useGetStoreOrdersQuery,
    useGetStoreOrderStatsQuery,
} from '../../../redux/features/stores/storeApi'
import { useMyStoreId } from '../../../hooks/useMyStoreId'
import { formatINR } from '../../../utils/formatCurrency'
import { TrendChart, BarList, SERIES } from './Charts'

const card = 'bg-white border border-gray-100 rounded-2xl p-6 shadow-sm';
const titleFont = { fontFamily: 'var(--header-font)' };

// Order status is an ordinal pipeline, so it gets one hue stepped light→dark.
// Cancelled is the one genuine exception and takes the reserved critical red.
const STATUS_COLOR = {
    PENDING: '#86b6ef',
    PROCESSING: '#5598e7',
    SHIPPED: '#2a78d6',
    DELIVERED: '#1c5cab',
    CANCELLED: '#d03b3b',
};
const STATUS_ORDER = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const RANGES = [
    { label: '7 days', days: 7 },
    { label: '30 days', days: 30 },
    { label: '90 days', days: 90 },
];

const Stat = ({ label, value, sub, icon, tint }) => (
    <div className={`${card} !p-5 flex items-start gap-4`}>
        <span className={`w-11 h-11 grid place-content-center rounded-xl text-lg shrink-0 ${tint}`}>
            <i className={icon}></i>
        </span>
        <div className='min-w-0'>
            <p className='text-sm text-text-light'>{label}</p>
            <p className='text-2xl font-bold leading-tight truncate'>{value}</p>
            {sub && <p className='text-xs text-text-light mt-0.5'>{sub}</p>}
        </div>
    </div>
);

const AdminDashboard = () => {
    const storeId = useMyStoreId();
    const [days, setDays] = useState(30);

    const { data: prod } = useGetStoreProductsQuery({ storeId, limit: 100 });
    // Totals come from a Mongo aggregation, NOT a page of orders — otherwise
    // revenue silently under-reports once the store passes one page of results.
    const { data: statsRes } = useGetStoreOrderStatsQuery({ storeId, days });
    const { data: orders } = useGetStoreOrdersQuery({ storeId, limit: 5 });
    const { data: cats } = useGetStoreCategoriesQuery({ storeId });

    const stats = statsRes?.data;
    const orderList = useMemo(() => orders?.data?.orders || [], [orders]);
    const productList = prod?.data?.products || [];

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
            <div className='flex items-end justify-between flex-wrap gap-3 mb-6'>
                <div>
                    <h2 className='text-2xl font-bold' style={titleFont}>Analytics</h2>
                    <p className='text-sm text-text-light mt-1'>Store performance at a glance.</p>
                </div>
                {/* Range filter — one row, above the charts */}
                <div className='flex items-center gap-1 bg-gray-100 rounded-lg p-1'>
                    {RANGES.map((r) => (
                        <button key={r.days} onClick={() => setDays(r.days)}
                            className={`px-3 py-1.5 text-sm rounded-md transition ${days === r.days ? 'bg-white shadow-sm font-medium text-text-dark' : 'text-text-light hover:text-text-dark'}`}>
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Headline figures */}
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                <Stat label={`Revenue · ${rangeLabel}`} value={formatINR(analytics.revenueWindow)}
                    sub={`${formatINR(analytics.revenueAll)} all time`}
                    icon='ri-money-rupee-circle-line' tint='bg-green-100 text-green-600' />
                <Stat label={`Orders · ${rangeLabel}`} value={analytics.ordersWindow}
                    sub={`${analytics.ordersAll} all time`}
                    icon='ri-shopping-bag-line' tint='bg-indigo-100 text-indigo-600' />
                <Stat label='Avg. order value' value={formatINR(analytics.aov)}
                    sub={rangeLabel} icon='ri-bar-chart-2-line' tint='bg-blue-100 text-blue-600' />
                <Stat label='Products' value={prod?.data?.total ?? productList.length}
                    sub={analytics.lowStock ? `${analytics.lowStock} low on stock` : `${cats?.data?.categories?.length ?? 0} categories`}
                    icon='ri-t-shirt-line' tint={analytics.lowStock ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'} />
            </div>

            {/* Revenue trend */}
            <div className={`${card} mb-6`}>
                <div className='flex items-baseline justify-between mb-4'>
                    <h3 className='font-semibold' style={titleFont}>Revenue · last {rangeLabel}</h3>
                    <span className='text-sm text-text-light'>
                        <span className='inline-block w-2.5 h-2.5 rounded-full mr-1.5 align-middle' style={{ background: SERIES }} />
                        {formatINR(analytics.revenueWindow)} total
                    </span>
                </div>
                {analytics.revenueWindow === 0 ? (
                    <p className='text-sm text-text-light py-8 text-center'>No revenue in this period yet.</p>
                ) : (
                    <TrendChart points={analytics.trend} valuePrefix='₹' />
                )}
            </div>

            {/* Breakdowns */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
                <div className={card}>
                    <h3 className='font-semibold mb-4' style={titleFont}>Order pipeline</h3>
                    <BarList rows={analytics.statusRows} emptyText='No orders yet.' />
                </div>
                <div className={card}>
                    <h3 className='font-semibold mb-4' style={titleFont}>Best sellers</h3>
                    <BarList rows={analytics.topProducts} emptyText='No sales recorded yet.' />
                </div>
                <div className={card}>
                    <h3 className='font-semibold mb-4' style={titleFont}>Catalogue by department</h3>
                    <BarList rows={analytics.mix} emptyText='No products yet.' />
                </div>
            </div>

            {/* Recent orders */}
            <div className={card}>
                <div className='flex items-center justify-between mb-4'>
                    <h3 className='font-semibold' style={titleFont}>Recent Orders</h3>
                    <Link to='/dashboard/manage-orders' className='text-sm text-primary font-medium'>View all</Link>
                </div>
                {recent.length === 0 ? (
                    <p className='text-text-light text-sm'>No orders yet.</p>
                ) : (
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                            <thead>
                                <tr className='text-left text-text-light border-b'>
                                    <th className='py-2 font-medium'>Order</th>
                                    <th className='py-2 font-medium'>Date</th>
                                    <th className='py-2 font-medium'>Status</th>
                                    <th className='py-2 font-medium text-right'>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.map((o) => (
                                    <tr key={o._id} className='border-b last:border-0'>
                                        <td className='py-2.5 font-mono'>#{o._id.slice(-8).toUpperCase()}</td>
                                        <td className='py-2.5 text-text-light'>{new Date(Number(o.create_date)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                                        <td className='py-2.5'>
                                            <span className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100 text-xs capitalize'>
                                                <span className='w-1.5 h-1.5 rounded-full' style={{ background: STATUS_COLOR[(o.status || '').toUpperCase()] || '#94a3b8' }} />
                                                {(o.status || '').toLowerCase()}
                                            </span>
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
