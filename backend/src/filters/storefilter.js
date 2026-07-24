const { BaseFilter } = require('./basefilter');

// Query DTO for store lookups. Array fields enable $in multi-value filtering.
class StoreFilter extends BaseFilter {
    constructor() {
        super();
        this.storeIdArray = undefined;
        this.ownerArray = undefined;
        this.slugArray = undefined;
        this.statusArray = undefined;
        this.searchObj = undefined; // { search_text, search_columns }
    }
}

module.exports = { StoreFilter };
