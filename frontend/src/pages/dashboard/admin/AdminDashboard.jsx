import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetProductsQuery } from '../../../redux/features/products/productsApi'
import { useGetAllOrdersQuery } from '../../../redux/features/orders/ordersApi'
import { useGetCategoriesQuery } from '../../../redux/features/categories/categoriesApi'
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
    const [days, setDays] = useState(30);

    const { data: prod } = useGetProductsQuery({ limit: 100 });
    const { data: orders } = useGetAllOrdersQuery({ limit: 200 });
    const { data: cats } = useGetCategoriesQuery();

    const orderList = useMemo(() => orders?.data?.orders || [], [orders]);
    const productList = prod?.data?.products || [];

    const analytics = useMemo(() => {
        const now = Date.now();
        const cutoff = now - days * 86400000;
        const inRange = orderList.filter((o) => Number(o.create_date) >= cutoff);

        // --- revenue per day across the window (zero-filled so gaps stay visible) ---
        const byDay = new Map();
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(now - i * 86400000);
            byDay.set(d.toISOString().slice(0, 10), 0);
        }
        inRange.forEach((o) => {
            const key = new Date(Number(o.create_date)).toISOString().slice(0, 10);
            if (byDay.has(key)) byDay.set(key, byDay.get(key) + (o.totalPrice || 0));
        });
        const trend = [...byDay.entries()].map(([iso, value]) => {
            const d = new Date(iso);
            return {
                label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                full: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                value,
            };
        });

        // --- order pipeline ---
        const statusCount = {};
        orderList.forEach((o) => {
            const s = (o.status || 'PENDING').toUpperCase();
            statusCount[s] = (statusCount[s] || 0) + 1;
        });
        const statusRows = STATUS_ORDER
            .filter((s) => statusCount[s])
            .map((s) => ({
                label: s.charAt(0) + s.slice(1).toLowerCase(),
                value: statusCount[s],
                color: STATUS_COLOR[s],
            }));

        // --- best sellers, by units actually ordered ---
        const unitsByName = new Map();
        orderList.forEach((o) => (o.items || []).forEach((it) => {
            const n = it.name || 'Unknown';
            unitsByName.set(n, (unitsByName.get(n) || 0) + (it.quantity || 0));
        }));
        const topProducts = [...unitsByName.entries()]
            .sort((a, b) => b[1] - a[1]).slice(0, 5)
            .map(([label, value]) => ({ label, value, meta: value === 1 ? 'unit' : 'units' }));

        // --- catalogue mix by department ---
        const audCount = {};
        productList.forEach((p) => { audCount[p.audience] = (audCount[p.audience] || 0) + 1; });
        const mix = Object.entries(audCount)
            .sort((a, b) => b[1] - a[1])
            .map(([k, v]) => ({ label: k.charAt(0).toUpperCase() + k.slice(1), value: v, meta: 'products' }));

        const revenueWindow = inRange.reduce((s, o) => s + (o.totalPrice || 0), 0);
        const revenueAll = orderList.reduce((s, o) => s + (o.totalPrice || 0), 0);
        const aov = inRange.length ? Math.round(revenueWindow / inRange.length) : 0;
        const lowStock = productList.filter((p) => (p.stock ?? 0) <= 5).length;

        return { trend, statusRows, topProducts, mix, revenueWindow, revenueAll, ordersWindow: inRange.length, aov, lowStock };
    }, [orderList, productList, days]);

    const recent = orderList.slice(0, 5);
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
                    sub={`${orders?.data?.total ?? orderList.length} all time`}
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
