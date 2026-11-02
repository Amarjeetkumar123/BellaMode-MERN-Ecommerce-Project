import { useSearchParams } from 'react-router-dom'

// Filters kept in the URL (?store=men&stock=low), so a refresh or the back button keeps them.
// Values equal to the default are left out of the URL.
export const useUrlFilters = (defaults) => {
    const [params, setParams] = useSearchParams();
    const f = Object.fromEntries(Object.entries(defaults).map(([k, d]) => [k, params.get(k) ?? d]));
    const set = (patch) => setParams((p) => {
        const next = new URLSearchParams(p);
        Object.entries(patch).forEach(([k, v]) => (v === defaults[k] || v === '' ? next.delete(k) : next.set(k, v)));
        if (!('page' in patch)) next.delete('page'); // any filter change goes back to page 1
        return next;
    }, { replace: true });
    const active = Object.keys(defaults).some((k) => k !== 'page' && k !== 'sort' && f[k] !== defaults[k]);
    const clear = () => setParams({}, { replace: true });
    return [f, set, active, clear];
};
