import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { listingLink } from '../../data/catalog'

// WCAG relative luminance of [r, g, b]
const lum = (c) => {
    const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const rgb = (c, a = 1) => `rgba(${c.map(Math.round).join(',')},${a})`;
const mix = (c, to, t) => c.map((v, i) => v + (to[i] - v) * t);

// Average colour (top, middle, bottom) of a strip of the photo on the copy's side: the outer
// edge for a photo that fades into a colour field, the whole text side (40%) for a wide photo
// the text sits on. null when the image can't be read.
const sampleEdge = (src, side, cols) => new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
        try {
            const c = document.createElement('canvas');
            c.width = 16; c.height = 15;
            const ctx = c.getContext('2d');
            ctx.drawImage(img, 0, 0, 16, 15);
            const d = ctx.getImageData(side === 'right' ? 16 - cols : 0, 0, cols, 15).data;
            resolve([0, 1, 2].map((band) => {
                const sum = [0, 0, 0];
                const from = band * 5 * cols, to = from + 5 * cols;
                for (let k = from; k < to; k++) for (let ch = 0; ch < 3; ch++) sum[ch] += d[k * 4 + ch];
                return sum.map((v) => v / (to - from));
            }));
        } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = src;
});

// Colours for one slide: the background (or the shade over a wide photo) and whether the text goes white.
const lookFor = (edge, layout) => {
    if (!edge) return {};
    const light = lum(edge[1]) > 0.179; // above this, black text has more contrast than white
    if (layout === 'right') {
        return { dark: !light, style: { '--bg': `linear-gradient(${rgb(edge[0])}, ${rgb(edge[1])} 50%, ${rgb(edge[2])})` } };
    }
    // over a wide photo, push the shade further toward its own tone so the text always reads
    const base = light ? mix(edge[1], [255, 255, 255], 0.45) : mix(edge[1], [0, 0, 0], 0.55);
    const dir = layout === 'wide-right' ? 'to left' : 'to right';
    return {
        dark: !light,
        style: {
            '--shade': `linear-gradient(${dir}, ${rgb(base, 0.92)} 24%, ${rgb(base, 0.55)} 48%, ${rgb(base, 0)} 70%)`,
            '--shade-sm': `linear-gradient(to top, ${rgb(base, 0.95)} 34%, ${rgb(base, 0)} 74%)`,
        },
    };
};

const Heart = () => (
    <svg className='wf-heart' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' aria-hidden='true'>
        <path d='M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9Z' />
    </svg>
);

// A store's hero: one slide per story. The current dot's fill bar is the timer,
// so pausing the bar (hover, focus, the pause button) pauses the slides too.
const StoreHero = ({ store, slides, label }) => {
    const n = slides.length;
    const [cur, setCur] = useState(0);
    const [hold, setHold] = useState(false);
    const [stopped, setStopped] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const [looks, setLooks] = useState({});
    const x0 = useRef(null);
    const go = (i) => setCur(((i % n) + n) % n);

    useEffect(() => { setCur(0); }, [store]);
    useEffect(() => {
        let live = true;
        slides.forEach((s) => {
            sampleEdge(s.image, s.layout === 'wide-right' ? 'right' : 'left', s.layout === 'right' ? 2 : 6)
                .then((edge) => live && setLooks((l) => ({ ...l, [s.image + s.layout]: lookFor(edge, s.layout) })));
        });
        return () => { live = false; };
    }, [slides]);

    const swipeEnd = (e) => {
        if (x0.current === null) return;
        const dx = e.clientX - x0.current;
        x0.current = null;
        if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1));
    };

    return (
        <section
            className={`wf-hero ${hold ? 'is-paused' : ''} ${stopped ? 'is-stopped' : ''}`}
            aria-roledescription='carousel' aria-label={label}
            onPointerEnter={(e) => e.pointerType === 'mouse' && setHold(true)}
            onPointerLeave={() => setHold(false)}
            onFocus={() => setHold(true)}
            onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHold(false)}
            onKeyDown={(e) => { if (e.key === 'ArrowLeft') go(cur - 1); if (e.key === 'ArrowRight') go(cur + 1); }}
            onPointerDown={(e) => { if (e.pointerType !== 'mouse') x0.current = e.clientX; }}
            onPointerUp={swipeEnd}
        >
            <div aria-live={stopped ? 'polite' : 'off'}>
                {slides.map((s, i) => {
                    const look = looks[s.image + s.layout] || {};
                    const wide = s.layout !== 'right';
                    return (
                        <article
                            key={`${store}-${i}`}
                            className={`wf-slide ${wide ? 'wide' : ''} ${s.layout === 'wide-right' ? 'flip' : ''} ${look.dark ? 'dark' : ''} ${i === cur ? 'is-on' : ''}`}
                            aria-roledescription='slide' aria-label={`${i + 1} of ${n}`}
                            inert={i === cur ? undefined : ''}
                            style={{ ...look.style, ...(s.pos && { '--pos': s.pos }) }}
                        >
                            <img className='wf-slide__ph' src={s.image} alt='' {...(i === 0 && { fetchpriority: 'high' })} />
                            {wide && <div className='wf-slide__shade'></div>}
                            <div className='wf-slide__copy'>
                                {s.kicker && <p className='wf-slide__kick'>{s.kicker}</p>}
                                <h2 className='wf-slide__h'>
                                    {s.title && <span>{s.title}</span>}
                                    {s.script && <span><em>{s.script}</em><Heart /></span>}
                                </h2>
                                {s.text && <p className='wf-slide__text'>{s.text}</p>}
                                <Link to={s.link || listingLink(store)} className={`wf-btn ${look.dark ? 'wf-btn--light' : ''}`}>
                                    {s.cta || 'Shop now'} <i className='ri-arrow-right-line'></i>
                                </Link>
                            </div>
                            {s.note && !wide && <p className='wf-slide__note' aria-hidden='true'>{s.note}</p>}
                        </article>
                    );
                })}
            </div>
            {n > 1 && (
                <>
                    <button type='button' className='wf-hero__arrow prev' onClick={() => go(cur - 1)} aria-label='Previous slide'><i className='ri-arrow-left-s-line'></i></button>
                    <button type='button' className='wf-hero__arrow next' onClick={() => go(cur + 1)} aria-label='Next slide'><i className='ri-arrow-right-s-line'></i></button>
                    <div className='wf-hero__nav'>
                        <div className='flex' onAnimationEnd={() => !stopped && go(cur + 1)}>
                            {slides.map((_, i) => (
                                <button key={i} type='button' className='wf-dot' aria-current={i === cur} aria-label={`Go to slide ${i + 1}`} onClick={() => go(i)}><i></i></button>
                            ))}
                        </div>
                        <button type='button' className='wf-hero__pause' onClick={() => setStopped((v) => !v)} aria-label={stopped ? 'Play slides' : 'Pause slides'}>
                            <i className={stopped ? 'ri-play-fill' : 'ri-pause-fill'}></i>
                        </button>
                    </div>
                </>
            )}
        </section>
    );
};

export default StoreHero;
