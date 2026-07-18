const Banner = require('../models/banner.model');
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
    const query = Banner.find(getRawJsonQuery(filter));
    modifyMongoQuery(query, undefined, sortParams || { sortOrder: 1, create_date: -1 });
    return fetchData(query);
}

async function saveBanner(data) {
    return new Banner(data).save();
}

async function updateBannerById(id, data) {
    return Banner.findByIdAndUpdate(id, { $set: { ...data, update_date: Date.now() } }, { new: true });
}

async function deleteBannerById(id) {
    return Banner.findByIdAndDelete(id);
}

module.exports = { getBanners, saveBanner, updateBannerById, deleteBannerById };
