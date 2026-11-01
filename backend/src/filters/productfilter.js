const { BaseFilter } = require('./basefilter');

class ProductFilter extends BaseFilter {
    constructor() {
        super();
        this.productIdArray = undefined;
        this.slugArray = undefined;
        this.audienceArray = undefined;
        this.categoryArray = undefined;
        this.colorArray = undefined;
        this.sizeArray = undefined;
        this.brandArray = undefined;
        this.priceRange = undefined; // { from, to }
        this.isTrending = undefined;
        this.isFeatured = undefined;
        this.onSale = undefined; // oldPrice > price
        this.isActive = undefined;
        this.searchObj = undefined; // { search_text, search_columns }
    }
}

module.exports = { ProductFilter };
