const User = require('../models/user.model');
const { LoggerClass } = require('../exception/LoggerClass');
const {
    createMongoAndFilterForColumns,
    modifyMongoQuery,
    fetchData,
    fetchDataCount,
} = require('./mongohelpers');

const FILTER_COLUMNS = ['_id', 'email', 'username', 'role'];
const RANGE_COLUMNS = [];
const ARRAY_COLUMNS = [];
const SEARCH_COLUMNS = ['username', 'email'];

// Maps a UserFilter DTO into the flat filterJson mongohelpers expects.
function getRawJsonQuery(userFilter = {}) {
    const filterJson = {};
    if (userFilter.userIdArray) filterJson._id = userFilter.userIdArray;
    if (userFilter.emailArray) filterJson.email = userFilter.emailArray;
    if (userFilter.usernameArray) filterJson.username = userFilter.usernameArray;
    if (userFilter.roleArray) filterJson.role = userFilter.roleArray;
    if (userFilter.searchObj) filterJson.search_params = userFilter.searchObj;
    return createMongoAndFilterForColumns(filterJson, FILTER_COLUMNS, RANGE_COLUMNS, ARRAY_COLUMNS, SEARCH_COLUMNS);
}

async function getUsers(userFilter, columnsRequired, sortParams, paginationParams) {
    const loggerClass = new LoggerClass('getUsers::', arguments);
    const query = User.find(getRawJsonQuery(userFilter));
    modifyMongoQuery(query, columnsRequired, sortParams, paginationParams);
    const users = await fetchData(query);
    loggerClass.writeDebugLogs(users);
    return users;
}

async function getUsersCount(userFilter) {
    const loggerClass = new LoggerClass('getUsersCount::', arguments);
    const count = await fetchDataCount(User.find(getRawJsonQuery(userFilter)));
    loggerClass.writeDebugLogs(count);
    return count;
}

async function getUserById(id) {
    const loggerClass = new LoggerClass('getUserById::', arguments);
    const user = await User.findById(id);
    loggerClass.writeDebugLogs(user);
    return user;
}

async function getUserByEmail(email) {
    const loggerClass = new LoggerClass('getUserByEmail::', arguments);
    const user = await User.findOne({ email });
    loggerClass.writeDebugLogs(user);
    return user;
}

// Detects an existing user matching either email or username (register conflict check).
async function findExistingUser(email, username) {
    const loggerClass = new LoggerClass('findExistingUser::', arguments);
    const user = await User.findOne({ $or: [{ email }, { username }] });
    loggerClass.writeDebugLogs(user);
    return user;
}

async function saveUser(userData) {
    const loggerClass = new LoggerClass('saveUser::', arguments);
    const user = await new User(userData).save();
    loggerClass.writeDebugLogs(user);
    return user;
}

async function updateUserById(id, data) {
    const loggerClass = new LoggerClass('updateUserById::', arguments);
    const user = await User.findByIdAndUpdate(id, { $set: { ...data, update_date: Date.now() } }, { new: true });
    loggerClass.writeDebugLogs(user);
    return user;
}

async function deleteUserById(id) {
    const loggerClass = new LoggerClass('deleteUserById::', arguments);
    const user = await User.findByIdAndDelete(id);
    loggerClass.writeDebugLogs(user);
    return user;
}

// ---- wishlist (account-synced product refs on the user doc) ----

// Returns the caller's wishlist with each product populated, newest saves last.
async function getWishlist(userId) {
    const loggerClass = new LoggerClass('getWishlist::', arguments);
    const user = await User.findById(userId).populate({
        path: 'wishlist',
        populate: { path: 'category', select: 'name slug audience' },
    });
    const wishlist = user ? user.wishlist : [];
    loggerClass.writeDebugLogs(wishlist);
    return wishlist;
}

// $addToSet keeps the save idempotent — hearting twice is a no-op.
async function addToWishlist(userId, productId) {
    const loggerClass = new LoggerClass('addToWishlist::', arguments);
    const user = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { wishlist: productId }, $set: { update_date: Date.now() } },
        { new: true }
    );
    loggerClass.writeDebugLogs(user);
    return user;
}

async function removeFromWishlist(userId, productId) {
    const loggerClass = new LoggerClass('removeFromWishlist::', arguments);
    const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { wishlist: productId }, $set: { update_date: Date.now() } },
        { new: true }
    );
    loggerClass.writeDebugLogs(user);
    return user;
}

module.exports = {
    getUsers,
    getUsersCount,
    getUserById,
    getUserByEmail,
    findExistingUser,
    saveUser,
    updateUserById,
    deleteUserById,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
};
