const User = require('../models/user.model');
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
    const query = User.find(getRawJsonQuery(userFilter));
    modifyMongoQuery(query, columnsRequired, sortParams, paginationParams);
    return fetchData(query);
}

async function getUsersCount(userFilter) {
    return fetchDataCount(User.find(getRawJsonQuery(userFilter)));
}

async function getUserById(id) {
    return User.findById(id);
}

async function getUserByEmail(email) {
    return User.findOne({ email });
}

// Detects an existing user matching either email or username (register conflict check).
async function findExistingUser(email, username) {
    return User.findOne({ $or: [{ email }, { username }] });
}

async function saveUser(userData) {
    const user = new User(userData);
    return user.save();
}

async function updateUserById(id, data) {
    return User.findByIdAndUpdate(id, { $set: { ...data, update_date: Date.now() } }, { new: true });
}

async function deleteUserById(id) {
    return User.findByIdAndDelete(id);
}

// ---- wishlist (account-synced product refs on the user doc) ----

// Returns the caller's wishlist with each product populated, newest saves last.
async function getWishlist(userId) {
    const user = await User.findById(userId).populate({
        path: 'wishlist',
        populate: { path: 'category', select: 'name slug audience' },
    });
    return user ? user.wishlist : [];
}

// $addToSet keeps the save idempotent — hearting twice is a no-op.
async function addToWishlist(userId, productId) {
    return User.findByIdAndUpdate(
        userId,
        { $addToSet: { wishlist: productId }, $set: { update_date: Date.now() } },
        { new: true }
    );
}

async function removeFromWishlist(userId, productId) {
    return User.findByIdAndUpdate(
        userId,
        { $pull: { wishlist: productId }, $set: { update_date: Date.now() } },
        { new: true }
    );
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
