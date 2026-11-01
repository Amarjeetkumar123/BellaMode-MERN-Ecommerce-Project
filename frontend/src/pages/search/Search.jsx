import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../shop/ProductCard'
import Seg from '../../components/Seg'
import { useGetProductsQuery } from '../../redux/features/products/productsApi'

const STORES = [['men', 'Men'], ['women', 'Women'], ['kids', 'Kids'], ['unisex', 'Lifestyle']];
const POPULAR = ['shirt', 'sneakers', 'dress', 'watch', 'jeans', 'saree'];

// Results update as you type; the query lives in ?q= so links and Back work.
const Search = () => {
    const [sp, setSp] = useSearchParams();
    const q = (sp.get('q') || '').trim();
    const [text, setText] = useState(q);
    const [store, setStore] = useState('all');
    const input = useRef(null);

    // the navbar search (or Back) changes ?q= → follow it
    useEffect(() => { setText((t) => (t.trim() === q ? t : q)); setStore('all'); }, [q]);
    // typing updates ?q= after a short pause
    useEffect(() => {
        const t = setTimeout(() => { if (text.trim() !== q) setSp(text.trim() ? { q: text.trim() } : {}, { replace: true }); }, 300);
        return () => clearTimeout(t);
    }, [text, q, setSp]);

    const { data, isFetching } = useGetProductsQuery({ search: q, limit: 60 }, { skip: !q });
    const found = q ? data?.data?.products || [] : [];
    const { data: popData } = useGetProductsQuery({ sort: 'rating', limit: 4 });
    const popular = popData?.data?.products || [];

    const counts = Object.fromEntries(STORES.map(([k]) => [k, found.filter((p) => p.audience === k).length]));
    const tabs = [['all', 'All', found.length], ...STORES.filter(([k]) => counts[k]).map(([k, l]) => [k, l, counts[k]])];
    const shown = store === 'all' ? found : found.filter((p) => p.audience === store);
    const settled = q && !isFetching;

    return (
        <main className='wf-wrap wf-page wf-pagehead' style={{ paddingBottom: 88 }}>
            <form className='wf-sbar' role='search' onSubmit={(e) => { e.preventDefault(); setSp(text.trim() ? { q: text.trim() } : {}, { replace: true }); }}>
                <i className='ri-search-line' aria-hidden='true'></i>
                <label className='wf-sr' htmlFor='wf-sq'>Search</label>
                <input id='wf-sq' ref={input} type='search' value={text} onChange={(e) => setText(e.target.value)} placeholder='What are you looking for?' autoComplete='off' autoFocus />
                {text && <button type='button' className='wf-clear' aria-label='Clear search' onClick={() => { setText(''); input.current.focus(); }}><i className='ri-close-line'></i></button>}
            </form>

            {q && found.length > 0 && (
                <>
                    <div className='wf-sline'>
                        <p aria-live='polite'>{found.length} result{found.length > 1 ? 's' : ''} for “{q}”{isFetching ? ' …' : ''}</p>
                        {tabs.length > 2 && <Seg label='Store' options={tabs} value={store} onChange={setStore} />}
                    </div>
                    <ProductCard products={shown} />
                </>
            )}

            {(!q || (settled && found.length === 0)) && (
                <div style={{ marginTop: 40 }}>
                    <div className='wf-nores'>
                        <div>
                            <h2 aria-live='polite'>{q ? `Nothing for “${q}”` : 'Search the whole store'}</h2>
                            <ul>
                                {q && <li>Check the spelling</li>}
                                <li>Try a broader word, like “shirt” or “dress”</li>
                                <li>Search by brand or colour</li>
                            </ul>
                        </div>
                        <div>
                            <p className='wf-sub'>Popular searches</p>
                            <div className='wf-tags'>
                                {POPULAR.map((t) => <button key={t} type='button' className='wf-tag' onClick={() => setSp({ q: t })}>{t}<i className='ri-arrow-right-line'></i></button>)}
                            </div>
                        </div>
                    </div>
                    {popular.length > 0 && <><p className='wf-sub'>Popular right now</p><ProductCard products={popular} /></>}
                </div>
            )}
        </main>
    );
};

export default Search;
