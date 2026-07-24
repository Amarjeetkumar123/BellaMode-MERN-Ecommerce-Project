const payoutDao = require('../dbhelper/payoutdao');
const { asyncHandler, sendSuccess, buildPagination } = require('../utils/commonUtils');

// GET /api/stores/:storeId/payouts — the seller's earnings: a summary plus the
// paginated list of per-order payouts. Scoped to req.storeId by loadOwnedStore.
exports.listPayouts = asyncHandler(async (req, res) => {
    const pagination = buildPagination(req.query);
    const filter = { storeArray: [req.storeId] };
    if (req.query.status) filter.statusArray = [req.query.status];

    const [payouts, total, summary] = await Promise.all([
        payoutDao.getPayouts(filter, undefined, { create_date: -1 }, pagination, { path: 'order', select: 'items totalPrice create_date' }),
        payoutDao.getPayoutsCount(filter),
        payoutDao.getStoreEarnings(req.storeId),
    ]);

    return sendSuccess(res, 200, 'OK', {
        payouts,
        summary,
        total,
        totalPages: Math.ceil(total / pagination.page_size),
    });
});
