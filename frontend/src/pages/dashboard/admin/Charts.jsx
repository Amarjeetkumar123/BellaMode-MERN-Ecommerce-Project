import { useState } from 'react'

// Hand-built SVG charts — no charting dependency.
// Colours follow the store: ink for magnitude, an ordinal grey ramp for the order
// pipeline, and the brand red reserved for one status (Cancelled).
export const INK = '#000000';
export const MUTED = '#5f6368';
export const GRID = '#e4e4e1';
export const SERIES = '#000000';

const fmtShort = (n) => {
    if (n >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return `${Math.round(n)}`;
};

/**
 * Area + line chart for a value over time.
 * points: [{ label, value, full }]
 */
export const TrendChart = ({ points = [], height = 190, valuePrefix = '' }) => {
    const [hover, setHover] = useState(null);
    if (points.length === 0) return null;

    const W = 640, H = height, PAD_L = 46, PAD_R = 12, PAD_T = 12, PAD_B = 26;
    const innerW = W - PAD_L - PAD_R;
    const innerH = H - PAD_T - PAD_B;
    const max = Math.max(...points.map((p) => p.value), 1);
    // Round the axis top to something readable rather than the raw max.
    const step = Math.pow(10, Math.floor(Math.log10(max)));
    const top = Math.ceil(max / step) * step || 1;

    const x = (i) => PAD_L + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
    const y = (v) => PAD_T + innerH - (v / top) * innerH;

    const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.value)}`).join(' ');
    const area = `${line} L${x(points.length - 1)},${PAD_T + innerH} L${x(0)},${PAD_T + innerH} Z`;
    const ticks = [0, top / 2, top];

    return (
        <div className='relative'>
            <svg viewBox={`0 0 ${W} ${H}`} className='w-full' role='img' aria-label='Revenue over time'>
                <defs>
                    <linearGradient id='trendFill' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='0%' stopColor={SERIES} stopOpacity='0.18' />
                        <stop offset='100%' stopColor={SERIES} stopOpacity='0' />
                    </linearGradient>
                </defs>

                {/* recessive gridlines + y ticks */}
                {ticks.map((t) => (
                    <g key={t}>
                        <line x1={PAD_L} x2={W - PAD_R} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth='1' />
                        <text x={PAD_L - 8} y={y(t) + 3.5} textAnchor='end' fontSize='10' fill={MUTED}>
                            {fmtShort(t)}
                        </text>
                    </g>
                ))}

                <path d={area} fill='url(#trendFill)' />
                <path d={line} fill='none' stroke={SERIES} strokeWidth='2' strokeLinejoin='round' strokeLinecap='round' />

                {/* x labels — thinned so they never collide */}
                {points.map((p, i) => {
                    const everyNth = Math.ceil(points.length / 7);
                    if (i % everyNth !== 0 && i !== points.length - 1) return null;
                    return (
                        <text key={p.label} x={x(i)} y={H - 8} textAnchor='middle' fontSize='10' fill={MUTED}>
                            {p.label}
                        </text>
                    );
                })}

                {/* hover layer: crosshair + marker, with generous hit targets */}
                {hover !== null && (
                    <g pointerEvents='none'>
                        <line x1={x(hover)} x2={x(hover)} y1={PAD_T} y2={PAD_T + innerH} stroke={INK} strokeOpacity='0.18' strokeWidth='1' />
                        <circle cx={x(hover)} cy={y(points[hover].value)} r='4.5' fill={SERIES} stroke='#fff' strokeWidth='2' />
                    </g>
                )}
                {points.map((p, i) => (
                    <rect key={p.label} x={x(i) - innerW / (points.length * 2) - 1} y={PAD_T}
                        width={innerW / points.length + 2} height={innerH}
                        fill='transparent'
                        onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />
                ))}
            </svg>

            {hover !== null && (
                <div
                    className='pointer-events-none absolute -translate-x-1/2 -translate-y-full bg-black text-white text-xs px-2 py-1 whitespace-nowrap shadow-lg'
                    style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(points[hover].value) / H) * 100}%` }}
                >
                    <strong>{valuePrefix}{points[hover].value.toLocaleString('en-IN')}</strong>
                    <span className='opacity-70'> · {points[hover].full || points[hover].label}</span>
                </div>
            )}
        </div>
    );
};

/**
 * Horizontal bar list — magnitude by named category.
 * rows: [{ label, value, color?, meta? }]
 */
export const BarList = ({ rows = [], valuePrefix = '', emptyText = 'No data yet.' }) => {
    if (rows.length === 0) return <p className='text-sm wf-muted py-4'>{emptyText}</p>;
    const max = Math.max(...rows.map((r) => r.value), 1);

    return (
        <div className='space-y-3'>
            {rows.map((r) => (
                <div key={r.label}>
                    <div className='flex items-baseline justify-between gap-3 mb-1'>
                        <span className='text-sm truncate'>{r.label}</span>
                        <span className='text-sm font-semibold tabular-nums shrink-0'>
                            {valuePrefix}{r.value.toLocaleString('en-IN')}
                            {r.meta && <span className='wf-muted font-normal text-xs ml-1.5'>{r.meta}</span>}
                        </span>
                    </div>
                    <div className='h-1.5 overflow-hidden' style={{ background: GRID }}>
                        <div
                            className='h-full transition-[width] duration-700'
                            style={{ width: `${Math.max((r.value / max) * 100, 2)}%`, background: r.color || SERIES }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

/**
 * Column chart for a count per day. points: [{ label, value, full }]
 */
export const ColumnChart = ({ points = [], height = 170, unit = 'orders' }) => {
    const [hover, setHover] = useState(null);
    if (points.length === 0) return null;

    const W = 640, H = height, PAD_L = 30, PAD_R = 8, PAD_T = 10, PAD_B = 24;
    const innerW = W - PAD_L - PAD_R, innerH = H - PAD_T - PAD_B;
    const top = Math.max(...points.map((p) => p.value), 1);
    const slot = innerW / points.length;
    const bw = Math.max(slot * 0.62, 1.5);
    const y = (v) => PAD_T + innerH - (v / top) * innerH;
    const everyNth = Math.ceil(points.length / 7);

    return (
        <div className='relative'>
            <svg viewBox={`0 0 ${W} ${H}`} className='w-full' role='img' aria-label={`${unit} per day`}>
                {[0, top].map((t) => (
                    <g key={t}>
                        <line x1={PAD_L} x2={W - PAD_R} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth='1' />
                        <text x={PAD_L - 6} y={y(t) + 3.5} textAnchor='end' fontSize='10' fill={MUTED}>{t}</text>
                    </g>
                ))}
                {points.map((p, i) => (
                    <g key={p.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                        <rect x={PAD_L + i * slot} y={PAD_T} width={slot} height={innerH} fill='transparent' />
                        <rect x={PAD_L + i * slot + (slot - bw) / 2} y={y(p.value)} width={bw} height={PAD_T + innerH - y(p.value)}
                            fill={hover === i ? '#c8102e' : SERIES} />
                        {(i % everyNth === 0 || i === points.length - 1) && (
                            <text x={PAD_L + i * slot + slot / 2} y={H - 8} textAnchor='middle' fontSize='10' fill={MUTED}>{p.label}</text>
                        )}
                    </g>
                ))}
            </svg>
            {hover !== null && (
                <div className='pointer-events-none absolute -translate-x-1/2 -translate-y-full bg-black text-white text-xs px-2 py-1 whitespace-nowrap'
                    style={{ left: `${((PAD_L + hover * slot + slot / 2) / W) * 100}%`, top: `${(y(points[hover].value) / H) * 100}%` }}>
                    <strong>{points[hover].value} {unit}</strong><span className='opacity-70'> · {points[hover].full || points[hover].label}</span>
                </div>
            )}
        </div>
    );
};

/**
 * Donut with a legend — share of a whole. rows: [{ label, value, color }]
 */
export const Donut = ({ rows = [], center, emptyText = 'No data yet.' }) => {
    const total = rows.reduce((s, r) => s + r.value, 0);
    if (!total) return <p className='text-sm wf-muted py-4'>{emptyText}</p>;
    const R = 42, C = 2 * Math.PI * R;
    let at = 0;

    return (
        <div className='flex items-center gap-5'>
            <svg viewBox='0 0 100 100' className='w-32 h-32 shrink-0 -rotate-90' role='img'
                aria-label={rows.map((r) => `${r.label} ${r.value}`).join(', ')}>
                <circle cx='50' cy='50' r={R} fill='none' stroke={GRID} strokeWidth='12' />
                {rows.map((r) => {
                    const len = (r.value / total) * C;
                    const seg = <circle key={r.label} cx='50' cy='50' r={R} fill='none' stroke={r.color} strokeWidth='12'
                        strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-at} />;
                    at += len;
                    return seg;
                })}
                <text x='50' y='50' transform='rotate(90 50 50)' textAnchor='middle' dominantBaseline='central' fontSize='15' fontWeight='600' fill={INK}>
                    {center ?? total}
                </text>
            </svg>
            <ul className='space-y-1.5 text-sm min-w-0 flex-1'>
                {rows.map((r) => (
                    <li key={r.label} className='flex items-center gap-2'>
                        <span className='w-2.5 h-2.5 shrink-0' style={{ background: r.color }} />
                        <span className='truncate'>{r.label}</span>
                        <span className='ml-auto tabular-nums font-semibold'>{Math.round((r.value / total) * 100)}%</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};
