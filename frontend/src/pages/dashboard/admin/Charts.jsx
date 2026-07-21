import React, { useState } from 'react'

// Hand-built SVG charts — no charting dependency.
// Colours follow the data-viz rules: a single hue for magnitude, an ordinal
// blue ramp for the order pipeline, and one reserved status red for Cancelled.
export const INK = '#0f172a';
export const MUTED = '#64748b';
export const GRID = '#e8ecf1';
export const SERIES = '#2a78d6';

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
                    className='pointer-events-none absolute -translate-x-1/2 -translate-y-full bg-text-dark text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg'
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
    if (rows.length === 0) return <p className='text-sm text-text-light py-4'>{emptyText}</p>;
    const max = Math.max(...rows.map((r) => r.value), 1);

    return (
        <div className='space-y-3'>
            {rows.map((r) => (
                <div key={r.label}>
                    <div className='flex items-baseline justify-between gap-3 mb-1'>
                        <span className='text-sm text-text-dark truncate'>{r.label}</span>
                        <span className='text-sm font-semibold tabular-nums shrink-0'>
                            {valuePrefix}{r.value.toLocaleString('en-IN')}
                            {r.meta && <span className='text-text-light font-normal text-xs ml-1.5'>{r.meta}</span>}
                        </span>
                    </div>
                    <div className='h-2 rounded-full bg-gray-100 overflow-hidden'>
                        <div
                            className='h-full rounded-full transition-[width] duration-500'
                            style={{ width: `${Math.max((r.value / max) * 100, 2)}%`, background: r.color || SERIES }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};
