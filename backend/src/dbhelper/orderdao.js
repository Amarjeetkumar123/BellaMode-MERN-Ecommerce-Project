const Order = require('../models/order.model');
const {
    createMongoAndFilterForColumns,
    modifyMongoQuery,
    fetchData,
    fetchDataCount,
} = require('./mongohelpers');

const FILTER_COLUMNS = ['_id', 'user', 'status', 'paymentStatus'];

function getRawJsonQuery(filter = {}) {
    const filterJson = {};
    if (filter.orderIdArray) filterJson._id = filter.orderIdArray;
    if (filter.userArray) filterJson.user = filter.userArray;
    if (filter.statusArray) filterJson.status = filter.statusArray;
    if (filter.paymentStatusArray) filterJson.paymentStatus = filter.paymentStatusArray;
    return createMongoAndFilterForColumns(filterJson, FILTER_COLUMNS, [], [], []);
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

async function updateOrderById(id, data) {
    return Order.findByIdAndUpdate(id, { $set: { ...data, update_date: Date.now() } }, { new: true });
}

module.exports = {
    getOrders,
    getOrdersCount,
    getOrderById,
    saveOrder,
    updateOrderById,
};
