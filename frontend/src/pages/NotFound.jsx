import { useState } from 'react'
import { Link, useNavigate, useRouteError, isRouteErrorResponse } from 'react-router-dom'
import { womenFashion } from '../assets/images'

const canMove = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const STORES = [['/categories/men', 'Men'], ['/categories/women', 'Women'], ['/categories/kids', 'Kids'], ['/sale', 'Sale']];

// Serves the catch-all route and the router's errorElement. "404" is cut out of a photo
// that follows the pointer.
const NotFound = () => {
    const error = useRouteError();
    const is404 = !error || (isRouteErrorResponse(error) && error.status === 404);
    const navigate = useNavigate();
    const [q, setQ] = useState('');
    const [pos, setPos] = useState(null);

    return (
        <main className='wf-wrap wf-nf' onPointerMove={canMove ? (e) => setPos([e.clientX / window.innerWidth * 100, e.clientY / window.innerHeight * 100]) : undefined}>
            <div className='wf-nf__big' aria-hidden='true' style={{ '--img': `url("${womenFashion}")`, ...(pos && { '--bx': `${pos[0]}%`, '--by': `${pos[1]}%` }) }}>{is404 ? '404' : 'Oops'}</div>
            <div>
                <p className='wf-kick'>{is404 ? 'Page not found' : 'Something went wrong'}</p>
                <h1>{is404 ? 'This page took the day off' : 'We hit a snag'}</h1>
                <p className='wf-intro'>{is404 ? 'The link may be old, or the product sold out. Try a search, or start from a store.' : 'Something broke while loading this page. Try again, or start from a store.'}</p>
                <form className='wf-sbar' role='search' onSubmit={(e) => { e.preventDefault(); navigate(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : '/search'); }}>
                    <i className='ri-search-line' aria-hidden='true'></i>
                    <label className='wf-sr' htmlFor='wf-nfq'>Search</label>
                    <input id='wf-nfq' type='search' value={q} onChange={(e) => setQ(e.target.value)} placeholder='Search products and brands' />
                </form>
                <ul className='wf-jump'>
                    {STORES.map(([to, l]) => <li key={to}><Link to={to}>{l}<i className='ri-arrow-right-line'></i></Link></li>)}
                </ul>
            </div>
        </main>
    );
};

export default NotFound;
