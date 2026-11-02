import { useRef, useState } from 'react'
import { useUploadFileMutation, useUploadByUrlMutation } from '../redux/features/upload/uploadApi'
import ImageCropper from './ImageCropper'

const MAX = 8;

// Product photos: pick or drop several, crop each to 3:4, then reorder or remove.
// The first photo is the cover the cards show. value = array of URLs.
const ProductImages = ({ value = [], onChange }) => {
    const [queue, setQueue] = useState([]);     // files waiting to be cropped
    const [done, setDone] = useState(0);        // how many of this batch are cropped (for "2 of 4")
    const [pending, setPending] = useState(0);  // uploads in flight
    const [error, setError] = useState('');
    const [url, setUrl] = useState('');
    const [over, setOver] = useState(false);
    const [uploadFile] = useUploadFileMutation();
    const [uploadByUrl, { isLoading: savingUrl }] = useUploadByUrlMutation();
    const room = MAX - value.length - pending;

    // `value` can be stale by the time an upload finishes, so updates go through this
    const latest = useRef(value);
    latest.current = value;
    const add = (u) => { latest.current = [...latest.current, u]; onChange(latest.current); };

    const pick = (files) => {
        setError('');
        const imgs = [...files].filter((f) => f.type.startsWith('image/'));
        if (imgs.length < files.length) setError('Only image files can be added.');
        if (imgs.length > room) setError(`Up to ${MAX} photos per product. ${room > 0 ? `Added the first ${room}.` : ''}`);
        const take = imgs.slice(0, Math.max(0, room));
        if (take.length) { setQueue(take); setDone(0); }
    };

    const next = () => { setQueue((q) => q.slice(1)); setDone((d) => d + 1); };
    const cropped = async (blob) => {
        next();
        setPending((n) => n + 1);
        try {
            const res = await uploadFile(new File([blob], 'product.jpg', { type: 'image/jpeg' })).unwrap();
            add(res.data.url);
        } catch (err) {
            setError(err?.data?.message || 'A photo failed to upload. Try it again.');
        } finally {
            setPending((n) => n - 1);
        }
    };

    const addUrl = async () => {
        const u = url.trim();
        if (!u) return;
        if (room <= 0) return setError(`Up to ${MAX} photos per product.`);
        setError('');
        try { const res = await uploadByUrl(u).unwrap(); add(res.data.url); setUrl(''); }
        catch (err) { setError(err?.data?.message || 'Could not use that link.'); }
    };

    const move = (i, to) => { const a = [...value]; const [x] = a.splice(i, 1); a.splice(to, 0, x); onChange(a); };
    const remove = (i) => onChange(value.filter((_, k) => k !== i));

    return (
        <div className='space-y-2 min-w-0'>
            <div className='flex items-baseline justify-between'>
                <span className='font-medium text-sm'>Photos</span>
                <span className='text-xs text-text-light'>{value.length}/{MAX} · first photo is the cover · cropped to fill the card (3:4)</span>
            </div>
            <div className='grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-3'>
                {value.map((src, i) => (
                    <figure key={src + i} className='relative group'>
                        <img src={src} alt={`Photo ${i + 1}`} className='w-full aspect-[3/4] object-cover rounded-lg bg-gray-100 border' />
                        {i === 0 && <span className='absolute left-1.5 top-1.5 bg-white text-[11px] font-semibold px-1.5 py-0.5 rounded'>Cover</span>}
                        <div className='absolute inset-x-1 bottom-1 flex justify-between gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition'>
                            <span className='flex gap-1'>
                                {i > 0 && <button type='button' onClick={() => move(i, i - 1)} className='w-7 h-7 rounded-full bg-white/95 shadow text-sm' aria-label={`Move photo ${i + 1} left`}><i className='ri-arrow-left-s-line'></i></button>}
                                {i < value.length - 1 && <button type='button' onClick={() => move(i, i + 1)} className='w-7 h-7 rounded-full bg-white/95 shadow text-sm' aria-label={`Move photo ${i + 1} right`}><i className='ri-arrow-right-s-line'></i></button>}
                            </span>
                            <span className='flex gap-1'>
                                {i > 0 && <button type='button' onClick={() => move(i, 0)} className='w-7 h-7 rounded-full bg-white/95 shadow text-sm' aria-label={`Make photo ${i + 1} the cover`} title='Make cover'><i className='ri-star-line'></i></button>}
                                <button type='button' onClick={() => remove(i)} className='w-7 h-7 rounded-full bg-white/95 shadow text-sm text-primary' aria-label={`Remove photo ${i + 1}`}><i className='ri-delete-bin-line'></i></button>
                            </span>
                        </div>
                    </figure>
                ))}
                {Array.from({ length: pending }, (_, i) => (
                    <div key={`p${i}`} className='aspect-[3/4] rounded-lg bg-gray-100 border grid place-items-center text-xs text-text-light' role='status'>
                        <span className='flex flex-col items-center gap-2'><span className='w-6 h-6 rounded-full border-2 border-gray-300 border-t-primary animate-spin'></span>Uploading</span>
                    </div>
                ))}
                {room > 0 && (
                    <label
                        className={`aspect-[3/4] rounded-lg border-2 border-dashed grid place-items-center text-center text-xs font-medium cursor-pointer transition ${over ? 'border-primary text-primary bg-primary-light' : 'border-gray-300 text-text-light hover:border-primary hover:text-primary'}`}
                        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
                        onDragLeave={() => setOver(false)}
                        onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files); }}
                    >
                        <span><i className='ri-image-add-line text-2xl block'></i>Add photos<br /><span className='font-normal'>or drop here</span></span>
                        <input type='file' accept='image/*' multiple className='sr-only' onChange={(e) => { pick(e.target.files); e.target.value = ''; }} />
                    </label>
                )}
            </div>
            <div className='flex gap-2 min-w-0'>
                <input placeholder='or paste a link, e.g. https://…/photo.jpg' value={url} onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrl(); } }}
                    className='border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-0 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15' />
                <button type='button' onClick={addUrl} disabled={savingUrl} className='px-3 py-2 bg-text-dark text-white rounded-lg text-sm shrink-0 hover:opacity-90 disabled:opacity-50'>{savingUrl ? 'Adding…' : 'Add URL'}</button>
            </div>
            {error && <p className='text-xs text-primary' role='alert'>{error}</p>}
            {queue[0] && <ImageCropper key={done} file={queue[0]} step={done + 1} total={done + queue.length} onDone={cropped} onSkip={next} />}
        </div>
    );
};

export default ProductImages;
