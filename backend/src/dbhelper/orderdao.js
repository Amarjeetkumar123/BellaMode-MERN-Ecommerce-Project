const Order = require('../models/order.model');
const { LoggerClass } = require('../exception/LoggerClass');
const {
    createMongoAndFilterForColumns,
    modifyMongoQuery,
    fetchData,
    fetchDataCount,
} = require('./mongohelpers');

const FILTER_COLUMNS = ['_id', 'store', 'user', 'status', 'paymentStatus'];

function getRawJsonQuery(filter = {}) {
    const filterJson = {};
    if (filter.orderIdArray) filterJson._id = filter.orderIdArray;
    if (filter.storeArray) filterJson.store = filter.storeArray;
    if (filter.userArray) filterJson.user = filter.userArray;
    if (filter.statusArray) filterJson.status = filter.statusArray;
    if (filter.paymentStatusArray) filterJson.paymentStatus = filter.paymentStatusArray;
    return createMongoAndFilterForColumns(filterJson, FILTER_COLUMNS, [], [], []);
}

async function getOrders(filter, columnsRequired, sortParams, paginationParams, populate) {
    const loggerClass = new LoggerClass('getOrders::', arguments);
    const query = Order.find(getRawJsonQuery(filter));
    modifyMongoQuery(query, columnsRequired, sortParams, paginationParams);
    if (populate) query.populate(populate);
    const orders = await fetchData(query);
    loggerClass.writeDebugLogs(orders);
    return orders;
}

async function getOrdersCount(filter) {
    const loggerClass = new LoggerClass('getOrdersCount::', arguments);
    const count = await fetchDataCount(Order.find(getRawJsonQuery(filter)));
    loggerClass.writeDebugLogs(count);
    return count;
}

async function getOrderById(id) {
    const loggerClass = new LoggerClass('getOrderById::', arguments);
    const order = await Order.findById(id).populate('user', 'username email');
    loggerClass.writeDebugLogs(order);
    return order;
}

// All sibling orders from one checkout. skipTenant: a payment spans stores, so this
// must never be narrowed by tenant context.
async function getOrdersByPaymentGroup(paymentGroup) {
    const loggerClass = new LoggerClass('getOrdersByPaymentGroup::', arguments);
    const orders = await Order.find({ paymentGroup }).setOptions({ skipTenant: true }).populate('store', 'name razorpayAccountId');
    loggerClass.writeDebugLogs(orders);
    return orders;
}

// Applies the same update to every order in a group (e.g. mark the whole group paid).
async function updateOrdersByPaymentGroup(paymentGroup, data) {
    const loggerClass = new LoggerClass('updateOrdersByPaymentGroup::', arguments);
    const result = await Order.updateMany({ paymentGroup }, { $set: { ...data, update_date: Date.now() } }, { skipTenant: true });
    loggerClass.writeDebugLogs(result);
    return result;
}

async function saveOrder(data) {
    const loggerClass = new LoggerClass('saveOrder::', arguments);
    const order = await new Order(data).save();
    loggerClass.writeDebugLogs(order);
    return order;
}

async function updateOrderById(id, data, storeId) {
    const loggerClass = new LoggerClass('updateOrderById::', arguments);
    const match = storeId ? { _id: id, store: storeId } : { _id: id };
    const order = await Order.findOneAndUpdate(match, { $set: { ...data, update_date: Date.now() } }, { new: true, skipTenant: true });
    loggerClass.writeDebugLogs(order);
    return order;
}


// ---- analytics ----
// Aggregated in Mongo so the dashboard never derives totals from a capped page.
// `storeId` scopes to one store — aggregation is NOT covered by the tenant plugin,
// so every pipeline explicitly starts from the same base $match.
async function getOrderStats(sinceMs, storeId) {
    const loggerClass = new LoggerClass('getOrderStats::', arguments);
    const base = storeId ? { store: new (require('mongoose').Types.ObjectId)(String(storeId)) } : {};

    const [totals] = await Order.aggregate([
        { $match: base },
        { $group: { _id: null, revenue: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
    ]);

    const byStatus = await Order.aggregate([
        { $match: base },
        { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const windowMatch = { ...base, create_date: { $gte: sinceMs } };

    const [windowTotals] = await Order.aggregate([
        { $match: windowMatch },
        { $group: { _id: null, revenue: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
    ]);

    // One bucket per calendar day (UTC) within the window.
    const daily = await Order.aggregate([
        { $match: windowMatch },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: { $toDate: '$create_date' } } },
                revenue: { $sum: '$totalPrice' },
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    // Units sold per product, across this store's orders.
    const topProducts = await Order.aggregate([
        { $match: base },
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.name',
                units: { $sum: '$items.quantity' },
                revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            },
        },
        { $sort: { units: -1 } },
        { $limit: 5 },
    ]);

    const stats = {
        revenueAll: totals?.revenue || 0,
        ordersAll: totals?.count || 0,
        revenueWindow: windowTotals?.revenue || 0,
        ordersWindow: windowTotals?.count || 0,
        byStatus: byStatus.map((s) => ({ status: s._id, count: s.count })),
        daily: daily.map((d) => ({ date: d._id, revenue: d.revenue, count: d.count })),
        topProducts: topProducts.map((t) => ({ name: t._id, units: t.units, revenue: t.revenue })),
    };
    loggerClass.writeDebugLogs(stats);
    return stats;
}

module.exports = {
    getOrders,
    getOrdersCount,
    getOrderById,
    getOrdersByPaymentGroup,
    updateOrdersByPaymentGroup,
    saveOrder,
    updateOrderById,
    getOrderStats,
};
