const Order = require('../models/order.model');
const { ORDER_STATUS } = require('../constants/constants');
const {
    createMongoAndFilterForColumns,
    modifyMongoQuery,
    fetchData,
    fetchDataCount,
} = require('./mongohelpers');

const FILTER_COLUMNS = ['_id', 'user', 'status', 'paymentMethod', 'paymentStatus'];

function getRawJsonQuery(filter = {}) {
    const filterJson = {};
    if (filter.orderIdArray) filterJson._id = filter.orderIdArray;
    if (filter.userArray) filterJson.user = filter.userArray;
    if (filter.statusArray) filterJson.status = filter.statusArray;
    if (filter.paymentStatusArray) filterJson.paymentStatus = filter.paymentStatusArray;
    if (filter.paymentMethodArray) filterJson.paymentMethod = filter.paymentMethodArray;
    const mongo = createMongoAndFilterForColumns(filterJson, FILTER_COLUMNS, [], [], []);
    if (filter.sinceMs) mongo.create_date = { $gte: filter.sinceMs };
    // search: customers whose name/email matched, or the order number (any part of the id)
    if (filter.search) {
        const or = [{ user: { $in: filter.search.userIds } }];
        if (filter.search.idPart) or.push({ $expr: { $regexMatch: { input: { $toString: '$_id' }, regex: filter.search.idPart } } });
        mongo.$or = or;
    }
    return mongo;
}

// Order count per status for the same filters, ignoring the status filter itself (for the tabs).
async function countByStatus(filter) {
    const rows = await Order.aggregate([
        { $match: getRawJsonQuery({ ...filter, statusArray: undefined }) },
        { $group: { _id: '$status', n: { $sum: 1 } } },
    ]);
    return Object.fromEntries(rows.map((r) => [r._id, r.n]));
}

async function getOrders(filter, columnsRequired, sortParams, paginationParams, populate) {
    const query = Order.find(getRawJsonQuery(filter));
    modifyMongoQuery(query, columnsRequired, sortParams, paginationParams);
    if (populate) query.populate(populate);
    return fetchData(query);
}

async function getOrdersCount(filter) {
    return fetchDataCount(Order.find(getRawJsonQuery(filter)));
}

async function getOrderById(id) {
    return Order.findById(id).populate('user', 'username email');
}

async function saveOrder(data) {
    return new Order(data).save();
}

// Updates only if `filter` still matches, so two requests can't both act on the same order.
async function updateOrderWhere(filter, data) {
    return Order.findOneAndUpdate(filter, { $set: { ...data, update_date: Date.now() } }, { new: true });
}

async function updateOrderById(id, data) {
    return Order.findByIdAndUpdate(id, { $set: { ...data, update_date: Date.now() } }, { new: true });
}


// ---- analytics ----
// Aggregated in Mongo so the dashboard never derives totals from a capped page.
async function getOrderStats(sinceMs) {
    const [totals] = await Order.aggregate([
        { $group: { _id: null, revenue: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
    ]);

    const byStatus = await Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const windowMatch = { create_date: { $gte: sinceMs } };

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

    // Units sold per product, across every order.
    const topProducts = await Order.aggregate([
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

    // Within the window: how people paid, and which store the money came from.
    const byPayment = await Order.aggregate([
        { $match: windowMatch },
        { $group: { _id: '$paymentMethod', count: { $sum: 1 } } },
    ]);
    const byStore = await Order.aggregate([
        { $match: { ...windowMatch, status: { $ne: ORDER_STATUS.CANCELLED } } },
        { $unwind: '$items' },
        { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'p' } },
        { $group: { _id: { $ifNull: [{ $first: '$p.audience' }, 'other'] }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { revenue: -1 } },
    ]);

    return {
        byPayment: byPayment.map((p) => ({ method: p._id, count: p.count })),
        byStore: byStore.map((s) => ({ store: s._id, revenue: s.revenue })),
        revenueAll: totals?.revenue || 0,
        ordersAll: totals?.count || 0,
        revenueWindow: windowTotals?.revenue || 0,
        ordersWindow: windowTotals?.count || 0,
        byStatus: byStatus.map((s) => ({ status: s._id, count: s.count })),
        daily: daily.map((d) => ({ date: d._id, revenue: d.revenue, count: d.count })),
        topProducts: topProducts.map((t) => ({ name: t._id, units: t.units, revenue: t.revenue })),
    };
}

module.exports = {
    getOrders,
    getOrdersCount,
    getOrderById,
    saveOrder,
    updateOrderById,
    updateOrderWhere,
    countByStatus,
    getOrderStats,
};
