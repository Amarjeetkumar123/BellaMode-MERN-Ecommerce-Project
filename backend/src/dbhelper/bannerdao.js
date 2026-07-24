const Banner = require('../models/banner.model');
const { LoggerClass } = require('../exception/LoggerClass');
const { createMongoAndFilterForColumns, modifyMongoQuery, fetchData } = require('./mongohelpers');

const FILTER_COLUMNS = ['_id', 'position', 'isActive'];

function getRawJsonQuery(filter = {}) {
    const filterJson = {};
    if (filter.bannerIdArray) filterJson._id = filter.bannerIdArray;
    if (filter.positionArray) filterJson.position = filter.positionArray;
    if (filter.isActive !== undefined) filterJson.isActive = filter.isActive;
    return createMongoAndFilterForColumns(filterJson, FILTER_COLUMNS, [], [], []);
}

async function getBanners(filter, sortParams) {
    const loggerClass = new LoggerClass('getBanners::', arguments);
    const query = Banner.find(getRawJsonQuery(filter));
    modifyMongoQuery(query, undefined, sortParams || { sortOrder: 1, create_date: -1 });
    const banners = await fetchData(query);
    loggerClass.writeDebugLogs(banners);
    return banners;
}

async function saveBanner(data) {
    const loggerClass = new LoggerClass('saveBanner::', arguments);
    const banner = await new Banner(data).save();
    loggerClass.writeDebugLogs(banner);
    return banner;
}

async function updateBannerById(id, data, storeId) {
    const loggerClass = new LoggerClass('updateBannerById::', arguments);
    const match = storeId ? { _id: id, store: storeId } : { _id: id };
    const banner = await Banner.findOneAndUpdate(match, { $set: { ...data, update_date: Date.now() } }, { new: true, skipTenant: true });
    loggerClass.writeDebugLogs(banner);
    return banner;
}

async function deleteBannerById(id, storeId) {
    const loggerClass = new LoggerClass('deleteBannerById::', arguments);
    const match = storeId ? { _id: id, store: storeId } : { _id: id };
    const banner = await Banner.findOneAndDelete(match, { skipTenant: true });
    loggerClass.writeDebugLogs(banner);
    return banner;
}

module.exports = { getBanners, saveBanner, updateBannerById, deleteBannerById };
