const Store = require('../models/store.model');
const { LoggerClass } = require('../exception/LoggerClass');
const {
    createMongoAndFilterForColumns,
    modifyMongoQuery,
    fetchData,
    fetchDataCount,
} = require('./mongohelpers');

const FILTER_COLUMNS = ['_id', 'owner', 'slug', 'status'];
const RANGE_COLUMNS = [];
const ARRAY_COLUMNS = [];
const SEARCH_COLUMNS = ['name', 'slug'];

// Maps a StoreFilter DTO into the flat filterJson mongohelpers expects.
function getRawJsonQuery(storeFilter = {}) {
    const filterJson = {};
    if (storeFilter.storeIdArray) filterJson._id = storeFilter.storeIdArray;
    if (storeFilter.ownerArray) filterJson.owner = storeFilter.ownerArray;
    if (storeFilter.slugArray) filterJson.slug = storeFilter.slugArray;
    if (storeFilter.statusArray) filterJson.status = storeFilter.statusArray;
    if (storeFilter.searchObj) filterJson.search_params = storeFilter.searchObj;
    return createMongoAndFilterForColumns(filterJson, FILTER_COLUMNS, RANGE_COLUMNS, ARRAY_COLUMNS, SEARCH_COLUMNS);
}

async function getStores(storeFilter, columnsRequired, sortParams, paginationParams, populate) {
    const loggerClass = new LoggerClass('getStores::', arguments);
    const query = Store.find(getRawJsonQuery(storeFilter));
    modifyMongoQuery(query, columnsRequired, sortParams, paginationParams);
    if (populate) query.populate(populate);
    const stores = await fetchData(query);
    loggerClass.writeDebugLogs(stores);
    return stores;
}

async function getStoresCount(storeFilter) {
    const loggerClass = new LoggerClass('getStoresCount::', arguments);
    const count = await fetchDataCount(Store.find(getRawJsonQuery(storeFilter)));
    loggerClass.writeDebugLogs(count);
    return count;
}

async function getStoreById(id) {
    const loggerClass = new LoggerClass('getStoreById::', arguments);
    const store = await Store.findById(id);
    loggerClass.writeDebugLogs(store);
    return store;
}

async function getStoreBySlug(slug) {
    const loggerClass = new LoggerClass('getStoreBySlug::', arguments);
    const store = await Store.findOne({ slug });
    loggerClass.writeDebugLogs(store);
    return store;
}

async function getStoreBySubdomain(subdomain) {
    const loggerClass = new LoggerClass('getStoreBySubdomain::', arguments);
    const store = await Store.findOne({ subdomain });
    loggerClass.writeDebugLogs(store);
    return store;
}

async function getStoreByOwner(ownerId) {
    const loggerClass = new LoggerClass('getStoreByOwner::', arguments);
    const store = await Store.findOne({ owner: ownerId });
    loggerClass.writeDebugLogs(store);
    return store;
}

// Ids of every approved store. The public marketplace scopes product/facet queries
// to this set so pending/suspended sellers' catalogues never surface to shoppers.
async function getApprovedStoreIds() {
    const loggerClass = new LoggerClass('getApprovedStoreIds::', arguments);
    const stores = await Store.find({ status: 'approved' }).select('_id').setOptions({ skipTenant: true });
    const ids = stores.map((s) => s._id);
    loggerClass.writeDebugLogs(ids);
    return ids;
}

// The platform's default store (oldest = Store #1). Powers public storefront
// chrome in Phase 1, before the marketplace gets its own settings.
async function getDefaultStore() {
    const loggerClass = new LoggerClass('getDefaultStore::', arguments);
    const store = await Store.findOne({}).sort({ create_date: 1 });
    loggerClass.writeDebugLogs(store);
    return store;
}

async function saveStore(data) {
    const loggerClass = new LoggerClass('saveStore::', arguments);
    const store = await new Store(data).save();
    loggerClass.writeDebugLogs(store);
    return store;
}

async function updateStoreById(id, data) {
    const loggerClass = new LoggerClass('updateStoreById::', arguments);
    const store = await Store.findByIdAndUpdate(id, { $set: { ...data, update_date: Date.now() } }, { new: true });
    loggerClass.writeDebugLogs(store);
    return store;
}

module.exports = {
    getStores,
    getStoresCount,
    getStoreById,
    getStoreBySlug,
    getStoreBySubdomain,
    getStoreByOwner,
    getApprovedStoreIds,
    getDefaultStore,
    saveStore,
    updateStoreById,
};
