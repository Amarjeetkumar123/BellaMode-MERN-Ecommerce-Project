const Payout = require('../models/payout.model');
const { LoggerClass } = require('../exception/LoggerClass');
const {
    createMongoAndFilterForColumns,
    modifyMongoQuery,
    fetchData,
    fetchDataCount,
} = require('./mongohelpers');

const FILTER_COLUMNS = ['_id', 'store', 'order', 'paymentGroup', 'status'];

function getRawJsonQuery(filter = {}) {
    const filterJson = {};
    if (filter.payoutIdArray) filterJson._id = filter.payoutIdArray;
    if (filter.storeArray) filterJson.store = filter.storeArray;
    if (filter.orderArray) filterJson.order = filter.orderArray;
    if (filter.paymentGroupArray) filterJson.paymentGroup = filter.paymentGroupArray;
    if (filter.statusArray) filterJson.status = filter.statusArray;
    return createMongoAndFilterForColumns(filterJson, FILTER_COLUMNS, [], [], []);
}

async function getPayouts(filter, columnsRequired, sortParams, paginationParams, populate) {
    const loggerClass = new LoggerClass('getPayouts::', arguments);
    const query = Payout.find(getRawJsonQuery(filter));
    modifyMongoQuery(query, columnsRequired, sortParams, paginationParams);
    if (populate) query.populate(populate);
    const payouts = await fetchData(query);
    loggerClass.writeDebugLogs(payouts);
    return payouts;
}

async function getPayoutsCount(filter) {
    const loggerClass = new LoggerClass('getPayoutsCount::', arguments);
    const count = await fetchDataCount(Payout.find(getRawJsonQuery(filter)));
    loggerClass.writeDebugLogs(count);
    return count;
}

// Upsert-by-order so a re-verified/retried payment doesn't create duplicate payouts.
async function savePayout(data) {
    const loggerClass = new LoggerClass('savePayout::', arguments);
    const payout = await Payout.findOneAndUpdate(
        { order: data.order },
        { $set: data },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    loggerClass.writeDebugLogs(payout);
    return payout;
}

// Total routed + held for a store — powers the seller's earnings summary.
async function getStoreEarnings(storeId) {
    const loggerClass = new LoggerClass('getStoreEarnings::', arguments);
    const mongoose = require('mongoose');
    const match = { store: new mongoose.Types.ObjectId(String(storeId)) };
    const [agg] = await Payout.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                totalNet: { $sum: '$amount' },
                totalCommission: { $sum: '$commission' },
                routed: { $sum: { $cond: [{ $eq: ['$status', 'routed'] }, '$amount', 0] } },
                held: { $sum: { $cond: [{ $eq: ['$status', 'held'] }, '$amount', 0] } },
                count: { $sum: 1 },
            },
        },
    ]);
    const earnings = {
        totalNet: agg?.totalNet || 0,
        totalCommission: agg?.totalCommission || 0,
        routed: agg?.routed || 0,
        held: agg?.held || 0,
        count: agg?.count || 0,
    };
    loggerClass.writeDebugLogs(earnings);
    return earnings;
}

module.exports = {
    getPayouts,
    getPayoutsCount,
    savePayout,
    getStoreEarnings,
};
