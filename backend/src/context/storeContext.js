const { AsyncLocalStorage } = require('async_hooks');

// Per-request tenant context. `resolveStore` enters a storeId for the current
// request; anything running inside that request can read it back. This powers the
// Mongoose plugin backstop below without threading storeId through every call.
const als = new AsyncLocalStorage();

// Set the active store for the current request chain. Uses enterWith (not run)
// so it composes with Express/andMiddleware without wrapping the rest of the chain.
function enterStore(storeId) {
    als.enterWith({ storeId: storeId ? String(storeId) : null });
}

function getStoreId() {
    const ctx = als.getStore();
    return ctx ? ctx.storeId : null;
}

// Run fn with an explicit store context (used by scripts/tests, not requests).
function runInStore(storeId, fn) {
    return als.run({ storeId: storeId ? String(storeId) : null }, fn);
}

// The query hooks the plugin guards. NOTE: aggregation pipelines are intentionally
// NOT covered — Mongoose has no query middleware for .aggregate(), so facets and
// stats must add their own `$match: { store }` (see productdao/orderdao).
const GUARDED_OPS = [
    'find', 'findOne', 'countDocuments', 'count',
    'findOneAndUpdate', 'findOneAndDelete', 'findOneAndReplace',
    'updateOne', 'updateMany', 'deleteOne', 'deleteMany',
];

// Backstop plugin: when a request has entered a store context and a query on a
// tenant model doesn't already constrain `store`, inject it. This catches anything
// the explicit service-layer scoping forgets — defence in depth, not the primary
// mechanism. Never injects when there is no context (public reads, seeds, scripts).
function tenantPlugin(schema) {
    schema.pre(GUARDED_OPS, function tenantScope() {
        // Explicit opt-out for genuinely cross-store lookups (e.g. global slug
        // uniqueness checks), which must ignore the current tenant context.
        const opts = typeof this.getOptions === 'function' ? this.getOptions() : {};
        if (opts && opts.skipTenant) return;
        const storeId = getStoreId();
        if (!storeId) return; // no active tenant → leave the query global
        const filter = this.getFilter();
        if (filter && Object.prototype.hasOwnProperty.call(filter, 'store')) return; // caller was explicit
        this.where({ store: storeId });
    });
}

module.exports = { enterStore, getStoreId, runInStore, tenantPlugin };
