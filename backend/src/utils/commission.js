// Commission is charged on item revenue only (not tax/shipping, which the platform
// retains). sellerAmount is what Route transfers to the seller's linked account;
// the platform keeps commission + tax + shipping.
function round2(n) {
    return Math.round(n * 100) / 100;
}

// commissionRate is a percentage (0–100).
function computeSplit(itemsPrice, commissionRate = 0) {
    const rate = Math.min(Math.max(Number(commissionRate) || 0, 0), 100);
    const commissionAmount = round2((itemsPrice * rate) / 100);
    const sellerAmount = round2(itemsPrice - commissionAmount);
    return { commissionAmount, sellerAmount };
}

module.exports = { round2, computeSplit };
