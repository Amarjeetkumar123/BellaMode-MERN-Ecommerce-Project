import { useState } from 'react'

// Floating-label input used by sign in, register, profile and address forms.
// `password` adds a Show/Hide button; `error` shows under the field when `bad`.
export const Field = ({ id, label, error, bad, wide, password, children, ...input }) => {
    const [show, setShow] = useState(false);
    return (
        <div className={`wf-field ${wide ? 'wide' : ''} ${bad ? 'bad' : ''}`}>
            <input id={id} name={id} placeholder=' ' {...input} {...(password && { type: show ? 'text' : 'password' })} />
            <label htmlFor={id}>{label}</label>
            {password && (
                <button type='button' className='wf-show' onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'}>
                    {show ? 'Hide' : 'Show'}
                </button>
            )}
            {error && <span className='wf-err'>{error}</span>}
            {children}
        </div>
    );
};

const LEVELS = ['', 'Weak', 'Weak', 'Good', 'Strong'];
// 1–4: length, mixed case, digits, symbols, extra length
const scorePassword = (v) => (!v ? 0 : Math.min(4, Math.max(1, (v.length >= 8) + /[A-Z]/.test(v) + /\d/.test(v) + /[^A-Za-z0-9]/.test(v) + (v.length >= 12))));

export const PasswordMeter = ({ value }) => {
    const s = scorePassword(value);
    return (
        <div className='wf-meter4' data-s={s} aria-live='polite'>
            <i></i><i></i><i></i><i></i><span>{LEVELS[s]}</span>
        </div>
    );
};
