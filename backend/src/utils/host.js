// Extracts the storefront subdomain label from a request hostname.
//
// With ROOT_DOMAIN set (e.g. "wearly.com"): "acme.wearly.com" → "acme"; the apex
// and "www" resolve to null (the marketplace itself). Without it, we fall back to a
// heuristic that also supports "acme.localhost" in development. Ports are ignored.
const RESERVED_HOSTS = new Set(['www', 'api', 'app', 'admin', 'static', 'assets', 'mail']);

function parseSubdomain(hostname, rootDomain = process.env.ROOT_DOMAIN) {
    if (!hostname) return null;
    const host = String(hostname).split(':')[0].toLowerCase().replace(/\.$/, '');

    let label = null;
    if (rootDomain) {
        const root = rootDomain.toLowerCase();
        if (host === root) return null;
        if (host.endsWith(`.${root}`)) {
            const prefix = host.slice(0, -(root.length + 1));
            // Only a single-label subdomain maps to a store (ignore deeper nesting).
            label = prefix.includes('.') ? prefix.split('.').pop() : prefix;
        }
    } else {
        const parts = host.split('.');
        // sub.localhost (2 parts) or sub.domain.tld (3+ parts).
        if (host.endsWith('.localhost') && parts.length >= 2) label = parts[0];
        else if (parts.length >= 3) label = parts[0];
    }

    if (!label || RESERVED_HOSTS.has(label)) return null;
    return label;
}

module.exports = { parseSubdomain, RESERVED_HOSTS };
