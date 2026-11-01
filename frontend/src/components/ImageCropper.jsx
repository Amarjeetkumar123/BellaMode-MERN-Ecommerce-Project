import { useEffect, useRef, useState } from 'react'

// Product photos are cut to the card's 3:4 shape so every photo fills its card,
// whatever size or shape was uploaded. Output is always OUT_W × OUT_H.
const FRAME_W = 300, FRAME_H = 400;   // on-screen frame (3:4)
const OUT_W = 1200, OUT_H = 1600;     // saved image (3:4)
const SMALL = 600;                    // below this many source pixels across, warn it may look soft
const MAX_ZOOM = 4;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Crops one file. onDone(blob) with the cropped JPEG, onSkip() to drop this photo.
const ImageCropper = ({ file, step, total, onDone, onSkip }) => {
    const [img, setImg] = useState(null);       // loaded HTMLImageElement
    const [failed, setFailed] = useState(false);
    const [zoom, setZoom] = useState(1);         // 1 = photo just covers the frame
    const [pos, setPos] = useState({ x: 0, y: 0 }); // image top-left inside the frame
    const [saving, setSaving] = useState(false);
    const drag = useRef(null);
    const useBtn = useRef(null);

    const base = img ? Math.max(FRAME_W / img.naturalWidth, FRAME_H / img.naturalHeight) : 1;
    const scale = base * zoom;
    const dw = img ? img.naturalWidth * scale : 0;
    const dh = img ? img.naturalHeight * scale : 0;
    const fit = (p, w = dw, h = dh) => ({ x: clamp(p.x, FRAME_W - w, 0), y: clamp(p.y, FRAME_H - h, 0) });

    // load the file, start centred and just covering the frame
    useEffect(() => {
        const url = URL.createObjectURL(file);
        const el = new Image();
        el.onload = () => {
            const s = Math.max(FRAME_W / el.naturalWidth, FRAME_H / el.naturalHeight);
            setImg(el); setZoom(1); setFailed(false);
            setPos({ x: (FRAME_W - el.naturalWidth * s) / 2, y: (FRAME_H - el.naturalHeight * s) / 2 });
            useBtn.current?.focus();
        };
        el.onerror = () => setFailed(true);
        el.src = url;
        return () => URL.revokeObjectURL(url);
    }, [file]);

    // zoom around the frame's centre
    const zoomTo = (z) => {
        if (!img) return;
        const nz = clamp(z, 1, MAX_ZOOM);
        const ns = base * nz;
        const cx = (FRAME_W / 2 - pos.x) / scale, cy = (FRAME_H / 2 - pos.y) / scale; // centre in photo pixels
        setZoom(nz);
        setPos(fit({ x: FRAME_W / 2 - cx * ns, y: FRAME_H / 2 - cy * ns }, img.naturalWidth * ns, img.naturalHeight * ns));
    };

    const onDown = (e) => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { px: e.clientX, py: e.clientY, ...pos }; };
    const onMove = (e) => { const d = drag.current; if (d) setPos(fit({ x: d.x + e.clientX - d.px, y: d.y + e.clientY - d.py })); };
    const onUp = () => { drag.current = null; };
    const onKey = (e) => {
        const step = e.shiftKey ? 20 : 5;
        const moves = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
        if (moves[e.key]) { e.preventDefault(); setPos(fit({ x: pos.x + moves[e.key][0], y: pos.y + moves[e.key][1] })); }
        if (e.key === '+' || e.key === '=') zoomTo(zoom + 0.1);
        if (e.key === '-') zoomTo(zoom - 0.1);
    };
    useEffect(() => {
        const esc = (e) => e.key === 'Escape' && onSkip();
        window.addEventListener('keydown', esc);
        return () => window.removeEventListener('keydown', esc);
    }, [onSkip]);

    const srcW = img ? FRAME_W / scale : 0; // photo pixels across the crop
    const save = () => {
        setSaving(true);
        const canvas = document.createElement('canvas');
        canvas.width = OUT_W; canvas.height = OUT_H;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, OUT_W, OUT_H);
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, -pos.x / scale, -pos.y / scale, srcW, FRAME_H / scale, 0, 0, OUT_W, OUT_H);
        canvas.toBlob((blob) => { setSaving(false); onDone(blob); }, 'image/jpeg', 0.88);
    };

    return (
        <div className='fixed inset-0 z-[1200] grid place-items-center bg-black/60 p-4' role='dialog' aria-modal='true' aria-labelledby='crop-h'>
            <div className='bg-white rounded-2xl shadow-xl w-full max-w-md p-6'>
                <div className='flex items-baseline justify-between mb-1'>
                    <h3 id='crop-h' className='font-semibold text-lg'>Crop photo</h3>
                    {total > 1 && <span className='text-sm text-text-light'>{step} of {total}</span>}
                </div>
                <p className='text-sm text-text-light mb-4'>Drag to position, zoom to frame. It will fill the product card exactly.</p>

                {failed ? (
                    <p className='rounded-lg bg-red-50 text-primary text-sm p-4'>This file can’t be opened as an image. Try a JPG, PNG or WebP.</p>
                ) : (
                    <div
                        className='relative mx-auto overflow-hidden rounded-lg bg-gray-100 cursor-grab active:cursor-grabbing touch-none select-none focus:outline-none focus:ring-2 focus:ring-primary'
                        style={{ width: FRAME_W, height: FRAME_H }}
                        tabIndex={0}
                        aria-label='Photo position. Use arrow keys to move, plus and minus to zoom.'
                        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onKeyDown={onKey}
                    >
                        {img && <img src={img.src} alt='' draggable={false} className='absolute max-w-none pointer-events-none'
                            style={{ left: pos.x, top: pos.y, width: dw, height: dh }} />}
                        {/* thirds grid helps line the product up */}
                        <div className='absolute inset-0 pointer-events-none' aria-hidden='true'>
                            {['33.333%', '66.666%'].map((p) => (
                                <span key={p}>
                                    <i className='absolute inset-y-0 w-px bg-white/60' style={{ left: p }}></i>
                                    <i className='absolute inset-x-0 h-px bg-white/60' style={{ top: p }}></i>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {img && (
                    <>
                        <div className='flex items-center gap-3 mt-4'>
                            <button type='button' onClick={() => zoomTo(zoom - 0.25)} className='w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200' aria-label='Zoom out'><i className='ri-subtract-line'></i></button>
                            <input type='range' min={1} max={MAX_ZOOM} step={0.01} value={zoom} onChange={(e) => zoomTo(Number(e.target.value))} className='flex-1 accent-primary' aria-label='Zoom' />
                            <button type='button' onClick={() => zoomTo(zoom + 0.25)} className='w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200' aria-label='Zoom in'><i className='ri-add-line'></i></button>
                        </div>
                        <p className='text-xs text-text-light mt-2'>
                            Photo {img.naturalWidth}×{img.naturalHeight}px.
                            {srcW < SMALL && <span className='text-primary font-medium'> This crop is small ({Math.round(srcW)}px wide) and may look soft on large screens.</span>}
                        </p>
                    </>
                )}

                <div className='flex justify-end gap-2 mt-5'>
                    <button type='button' onClick={onSkip} className='px-4 py-2 rounded-lg bg-gray-100 text-sm font-medium hover:bg-gray-200'>{total > 1 ? 'Skip this photo' : 'Cancel'}</button>
                    <button type='button' ref={useBtn} onClick={save} disabled={!img || saving} className='btn !rounded-lg disabled:opacity-50'>{saving ? 'Saving…' : 'Use photo'}</button>
                </div>
            </div>
        </div>
    );
};

export default ImageCropper;
