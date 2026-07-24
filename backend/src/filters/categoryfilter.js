const { BaseFilter } = require('./basefilter');

class CategoryFilter extends BaseFilter {
    constructor() {
        super();
        this.categoryIdArray = undefined;
        this.storeArray = undefined;
        this.slugArray = undefined;
        this.audienceArray = undefined;
        this.parentArray = undefined;
        this.isActive = undefined;
        this.searchObj = undefined;
    }
}

module.exports = { CategoryFilter };
