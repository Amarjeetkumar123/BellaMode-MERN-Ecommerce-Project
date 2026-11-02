import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { apis } from '../redux/store'

// true while any API request (query or save) is on its way
const busySelector = (state) => apis.some(({ reducerPath }) => {
    const s = state[reducerPath];
    return Object.values(s.queries).some((q) => q?.status === 'pending')
        || Object.values(s.mutations).some((m) => m?.status === 'pending');
});

// Thin red bar along the top while anything loads. Waits a moment before showing so quick
// requests don't flicker, creeps toward the end, then fills and fades when done.
export const TopLoader = () => {
    const busy = useSelector(busySelector);
    const [phase, setPhase] = useState('idle'); // idle → run → done → idle
    useEffect(() => {
        if (busy) {
            const t = setTimeout(() => setPhase('run'), 150);
            return () => clearTimeout(t);
        }
        if (phase !== 'run') return undefined;
        setPhase('done');
        const t = setTimeout(() => setPhase('idle'), 450);
        return () => clearTimeout(t);
    }, [busy]); // eslint-disable-line react-hooks/exhaustive-deps
    return <div className={`wf-toploader is-${phase}`} aria-hidden='true'><i></i></div>;
};

// A spinner with a label, for a whole page or a panel that's waiting.
export const PageLoader = ({ label = 'Loading' }) => (
    <div className='wf-pageloader' role='status'><span className='wf-ring' aria-hidden='true'></span><span>{label}…</span></div>
);

// A small spinner line, for lists inside a page.
export const InlineLoader = ({ label = 'Loading' }) => (
    <p className='wf-inloader' role='status'><span className='wf-ring wf-ring--sm' aria-hidden='true'></span>{label}…</p>
);

// Grey shapes that shimmer where content is about to appear.
export const Skel = ({ w = '100%', h = 14, className = '', style }) => (
    <span className={`wf-skel ${className}`} style={{ width: w, height: h, ...style }} aria-hidden='true'></span>
);

// Product grid placeholders shaped like the real cards.
export const SkeletonGrid = ({ count = 8, className = '' }) => (
    <div className={`wf-grid ${className}`} role='status' aria-label='Loading products'>
        {Array.from({ length: count }, (_, i) => (
            <div key={i} className='wf-skelcard' style={{ '--i': i }}>
                <Skel className='wf-skelcard__ph' h='auto' />
                <div className='wf-skelcard__info'>
                    <div><Skel w='40%' h={11} /><Skel w='80%' h={14} style={{ marginTop: 8 }} /><Skel w='30%' h={11} style={{ marginTop: 8 }} /></div>
                    <Skel w={56} h={14} />
                </div>
            </div>
        ))}
    </div>
);

// Product page placeholder: photos on the left, details on the right.
export const SkeletonProduct = () => (
    <main className='wf-page wf-wrap wf-page-top' role='status' aria-label='Loading product'>
        <div className='wf-skelpdp'>
            <div className='wf-skelpdp__ph'><Skel h='100%' /></div>
            <div>
                <Skel w='30%' h={12} /><Skel w='75%' h={34} style={{ marginTop: 14 }} /><Skel w='40%' h={14} style={{ marginTop: 14 }} />
                <Skel w='25%' h={26} style={{ marginTop: 28 }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 32 }}>{[1, 2, 3, 4].map((i) => <Skel key={i} w={52} h={48} />)}</div>
                <Skel h={54} style={{ marginTop: 28 }} /><Skel h={54} style={{ marginTop: 10 }} />
                <Skel w='90%' h={12} style={{ marginTop: 28 }} /><Skel w='70%' h={12} style={{ marginTop: 10 }} />
            </div>
        </div>
    </main>
);

// Order card placeholders for the account pages.
export const SkeletonOrders = ({ count = 2 }) => (
    <div role='status' aria-label='Loading orders'>
        {Array.from({ length: count }, (_, i) => (
            <div key={i} className='wf-skelorder'>
                <div className='wf-skelorder__head'><Skel w={90} h={30} /><Skel w={90} h={30} /><Skel w={70} h={30} /></div>
                <div className='wf-skelorder__body'><Skel w={64} h={80} /><Skel w={64} h={80} /><Skel w='30%' h={12} style={{ alignSelf: 'center' }} /></div>
            </div>
        ))}
    </div>
);
