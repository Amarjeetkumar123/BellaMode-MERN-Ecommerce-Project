// Shared class strings for the admin pages (styles in styles/account.css, "admin" section).
export const card = 'wf-apanel';
export const input = 'wf-ainput';
export const label = 'wf-alabel';
export const primaryBtn = 'wf-btn wf-btn--sm';
export const ghostBtn = 'wf-btn wf-btn--sm wf-btn--line';
export const linkBtn = 'wf-linkbtn wf-u';
export const titleFont = { fontFamily: 'var(--wf-display)', fontWeight: 500, letterSpacing: '-.02em' };

// Order status tag: open orders in red, delivered green, cancelled grey.
export const statusPill = (s) => `wf-apill is-${(s || '').toLowerCase()}`;
