const { BaseFilter } = require('./basefilter');

class ReviewFilter extends BaseFilter {
    constructor() {
        super();
        this.reviewIdArray = undefined;
        this.productArray = undefined;
        this.userArray = undefined;
    }
}

module.exports = { ReviewFilter };
