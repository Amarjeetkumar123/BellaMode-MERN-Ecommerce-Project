import { useEffect, useState } from 'react'
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

// One labelled dropdown in a filter bar. options: [[value, label], …]
export const Pick = ({ label, value, onChange, options }) => (
    <label className='wf-afilter'>
        <span>{label}</span>
        <select value={value} onChange={(e) => onChange(e.target.value)} className='wf-ainput'>
            {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
    </label>
);

// Search input that waits for a pause in typing before searching.
const SearchBox = ({ value, onChange, placeholder }) => {
    const [text, setText] = useState(value);
    // follow outside changes (e.g. "Clear filters") without eating a space being typed
    useEffect(() => { setText((t) => (t.trim() === value ? t : value)); }, [value]);
    useEffect(() => {
        if (text.trim() === value) return undefined;
        const t = setTimeout(() => onChange(text.trim()), 300);
        return () => clearTimeout(t);
    }, [text, value, onChange]);
    return <input type='search' value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} className='wf-ainput' />;
};

// Search box + dropdowns, a result count, and "Clear filters" once anything is set.
export const FilterBar = ({ search, onSearch, placeholder, count, active, onClear, children }) => (
    <div className='wf-afilters' role='search'>
        {onSearch && (
            <label className='wf-afilter wf-afilter--q'>
                <span>Search</span>
                <span className='wf-asearch'>
                    <i className='ri-search-line' aria-hidden='true'></i>
                    <SearchBox value={search} onChange={onSearch} placeholder={placeholder} />
                </span>
            </label>
        )}
        {children}
        <div className='wf-afilters__end'>
            {count != null && <span className='wf-muted text-sm' role='status'>{count}</span>}
            {active && <button type='button' className='wf-linkbtn wf-u' onClick={onClear}>Clear filters</button>}
        </div>
    </div>
);
