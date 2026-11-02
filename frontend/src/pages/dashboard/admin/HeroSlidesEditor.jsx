import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../../../redux/features/settings/settingsApi'
import ImageInput from '../../../components/ImageInput'
import Seg from '../../../components/Seg'
import { HERO_SLIDES } from '../../../data/catalog'
import { card, input, primaryBtn, ghostBtn, titleFont, linkBtn } from './adminUI'
import { L } from './AdminParts'

const STORES = [['men', 'Men'], ['women', 'Women'], ['kids', 'Kids']];
// photo crop follows the layout: upright for the right-hand panel, wide for full-width
const LAYOUTS = {
    right: { label: 'Upright photo on the right', aspect: [4, 5] },
    wide: { label: 'Wide photo, text on the left', aspect: [2, 1] },
    'wide-right': { label: 'Wide photo, text on the right', aspect: [2, 1] },
};
const MAX = 5;
const blank = { image: '', layout: 'right', kicker: '', title: '', script: '', text: '', cta: '', link: '', note: '' };

// Each store's home page slides. No slides of its own = the store shows its built-in ones.
const HeroSlidesEditor = () => {
    const { data } = useGetSettingsQuery();
    const [update, { isLoading: saving }] = useUpdateSettingsMutation();
    const [store, setStore] = useState('men');
    const [all, setAll] = useState({ men: [], women: [], kids: [] });
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const h = data?.data?.settings?.heroSlides;
        if (h) setAll({ men: h.men || [], women: h.women || [], kids: h.kids || [] });
    }, [data]);

    const slides = all[store];
    const setSlides = (list) => { setAll((a) => ({ ...a, [store]: list })); setMsg(''); };
    const field = (i, k, v) => setSlides(slides.map((s, j) => (j === i ? { ...s, [k]: v } : s)));
    const move = (i, to) => { const a = [...slides]; const [x] = a.splice(i, 1); a.splice(to, 0, x); setSlides(a); };

    const save = async (e) => {
        e.preventDefault();
        const missing = STORES.find(([k]) => all[k].some((s) => !s.image));
        if (missing) { setStore(missing[0]); return setMsg(`Every ${missing[1]} slide needs a photo.`); }
        try { await update({ heroSlides: all }).unwrap(); setMsg('Hero slides saved.'); }
        catch (err) { setMsg(err?.data?.message || 'Could not save the slides.'); }
    };

    return (
        <form onSubmit={save} className={`${card} max-w-3xl space-y-4`}>
            <div className='flex flex-wrap items-center justify-between gap-3'>
                <h3 style={titleFont}>Store hero slides</h3>
                <Seg label='Store' options={STORES.map(([k, t]) => (all[k].length ? [k, t, all[k].length] : [k, t]))} value={store} onChange={setStore} />
            </div>
            <p className='text-sm wf-muted'>
                The slides at the top of each store’s home page. Upload any photo and crop it to fit; the background and text colours are picked from the photo.
                {' '}<Link to={`/categories/${store}`} target='_blank' className={linkBtn}>See the {store} store</Link>
            </p>

            {slides.length === 0 && (
                <p className='wf-alert'>The {store} store is showing its {HERO_SLIDES[store].length} built-in slides. Add a slide to use your own instead.</p>
            )}

            {slides.map((s, i) => (
                <div key={i} role='group' aria-label={`Slide ${i + 1}`} className='border border-gray-200 p-4 space-y-3'>
                    <div className='flex items-center justify-between gap-3'>
                        <h4 className='font-bold'>Slide {i + 1}</h4>
                        <span className='wf-acts' style={{ gap: 14 }}>
                            <button type='button' className={linkBtn} disabled={i === 0} onClick={() => move(i, i - 1)} aria-label={`Move slide ${i + 1} earlier`}>Earlier</button>
                            <button type='button' className={linkBtn} disabled={i === slides.length - 1} onClick={() => move(i, i + 1)} aria-label={`Move slide ${i + 1} later`}>Later</button>
                            <button type='button' className={`${linkBtn} wf-danger`} onClick={() => setSlides(slides.filter((_, j) => j !== i))}>Remove</button>
                        </span>
                    </div>
                    <L t='Layout'>
                        <select value={s.layout} onChange={(e) => field(i, 'layout', e.target.value)} className={input}>
                            {Object.entries(LAYOUTS).map(([k, l]) => <option key={k} value={k}>{l.label}</option>)}
                        </select>
                    </L>
                    <ImageInput key={s.layout} label='Photo' aspect={LAYOUTS[s.layout].aspect} note='It will fill the hero exactly.'
                        value={s.image} onChange={(url) => field(i, 'image', url)} />
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        <L t='Small heading'><input value={s.kicker} onChange={(e) => field(i, 'kicker', e.target.value)} maxLength={40} className={input} placeholder='e.g. New collection' /></L>
                        <L t='Headline'><input value={s.title} onChange={(e) => field(i, 'title', e.target.value)} maxLength={60} className={input} placeholder='e.g. Dressed for the' /></L>
                        <L t='Handwritten word (red, after the headline)'><input value={s.script} onChange={(e) => field(i, 'script', e.target.value)} maxLength={24} className={input} placeholder='e.g. weekend' /></L>
                        <L t='Button text'><input value={s.cta} onChange={(e) => field(i, 'cta', e.target.value)} maxLength={30} className={input} placeholder='e.g. Shop new in' /></L>
                        <L t='Text' className='sm:col-span-2'><textarea value={s.text} onChange={(e) => field(i, 'text', e.target.value)} maxLength={200} rows={2} className={input} placeholder='e.g. Overshirts, cargo trousers and clean white trainers.' /></L>
                        <L t='Button link (empty opens this store’s shop)'><input value={s.link} onChange={(e) => field(i, 'link', e.target.value)} maxLength={300} className={input} placeholder={`e.g. /sale?store=${store}`} /></L>
                        {s.layout === 'right' && (
                            <L t='Handwritten note on the photo (optional)'><input value={s.note} onChange={(e) => field(i, 'note', e.target.value)} maxLength={40} className={input} placeholder='e.g. Less fuss, more style' /></L>
                        )}
                    </div>
                </div>
            ))}

            <div className='flex flex-wrap items-center gap-3'>
                {slides.length < MAX && (
                    <button type='button' className={ghostBtn} onClick={() => setSlides([...slides, { ...blank }])}><i className='ri-add-line'></i>Add slide</button>
                )}
                <button className={primaryBtn} disabled={saving}>{saving ? 'Saving…' : 'Save slides'}</button>
                {msg && <p className='wf-alert' role='status'>{msg}</p>}
            </div>
        </form>
    );
};

export default HeroSlidesEditor;
