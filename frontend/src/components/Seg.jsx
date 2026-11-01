import { useLayoutEffect, useRef, useState } from 'react'

// Segmented control: a black block slides to the picked option.
// options: [[value, label, count?], …]
const Seg = ({ options, value, onChange, label }) => {
    const ref = useRef(null);
    const [ind, setInd] = useState({ width: 0 });
    const sig = options.map((o) => o.join(':')).join('|');

    useLayoutEffect(() => {
        const place = () => {
            const b = ref.current?.querySelector('[aria-pressed="true"]');
            if (b) setInd({ width: b.offsetWidth, transform: `translateX(${b.offsetLeft}px)` });
        };
        place();
        document.fonts?.ready.then(place); // widths change once the web font arrives
    }, [value, sig]);

    return (
        <div className='wf-seg' ref={ref} role='group' aria-label={label}>
            <span className='wf-seg__ind' style={ind} aria-hidden='true'></span>
            {options.map(([v, l, n]) => (
                <button key={v} type='button' aria-pressed={v === value} onClick={() => onChange(v)}>
                    {l}{n != null && <small>{n}</small>}
                </button>
            ))}
        </div>
    );
};

export default Seg;
