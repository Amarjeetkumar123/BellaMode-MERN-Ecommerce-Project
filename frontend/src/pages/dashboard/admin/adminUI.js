// Shared class strings for a consistent admin look across CRUD pages.
export const card = 'bg-white border border-gray-100 rounded-2xl p-6 shadow-sm';
export const input = 'border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm w-full focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition';
export const label = 'block text-xs font-medium text-text-light mb-1';
export const primaryBtn = 'btn !rounded-lg';
export const ghostBtn = 'px-5 py-2.5 rounded-lg bg-gray-100 text-text-dark text-sm font-medium hover:bg-gray-200 transition';
export const titleFont = { fontFamily: 'var(--header-font)' };

// Order/user status pill colors
export const STATUS_STYLE = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};
export const statusPill = (s) => STATUS_STYLE[(s || '').toLowerCase()] || 'bg-gray-100 text-gray-700';
