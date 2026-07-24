import { useResolveHostQuery } from '../redux/features/storefronts/storefrontApi'

const RESERVED = new Set(['www', 'api', 'app', 'admin', 'static', 'assets', 'mail']);

// Cheap client-side check for whether the current hostname looks like a store
// subdomain, so we only hit /resolve when it could actually match. Mirrors the
// server's parseSubdomain heuristic (dev supports "acme.localhost").
function hasSubdomain(hostname) {
    const host = String(hostname || '').split(':')[0].toLowerCase();
    const parts = host.split('.');
    let label = null;
    if (host.endsWith('.localhost') && parts.length >= 2) label = parts[0];
    else if (parts.length >= 3) label = parts[0];
    return label && !RESERVED.has(label);
}

// Resolves the storefront implied by the current host. On the apex/www domain this
// skips the request and reports the marketplace (store: null).
export function useHostStore() {
    const maybeStore = typeof window !== 'undefined' && hasSubdomain(window.location.hostname);
    const { data, isLoading } = useResolveHostQuery(undefined, { skip: !maybeStore });
    const store = data?.data?.store || null;
    return { store, isStorefront: Boolean(store), isLoading: Boolean(maybeStore) && isLoading };
}
