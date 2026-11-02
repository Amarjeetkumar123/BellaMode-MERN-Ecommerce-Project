import { label as labelCls } from './adminUI'

// Page heading: small red "Admin" kicker, big title, optional note and actions on the right.
export const AdminHead = ({ title, sub, children }) => (
    <div className='wf-abar'>
        <div><p className='wf-kick'>Admin</p><h1>{title}</h1>{sub && <p className='wf-muted' style={{ marginTop: 6 }}>{sub}</p>}</div>
        {children}
    </div>
);

// A visible label above a form control (placeholders alone aren't labels).
export const L = ({ t, className = '', children }) => (
    <label className={`block min-w-0 ${className}`}><span className={labelCls}>{t}</span>{children}</label>
);
