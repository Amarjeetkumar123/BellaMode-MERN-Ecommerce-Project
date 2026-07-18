const { BaseFilter } = require('./basefilter');

class BlogFilter extends BaseFilter {
    constructor() {
        super();
        this.blogIdArray = undefined;
        this.slugArray = undefined;
        this.isPublished = undefined;
        this.searchObj = undefined;
    }
}

module.exports = { BlogFilter };
