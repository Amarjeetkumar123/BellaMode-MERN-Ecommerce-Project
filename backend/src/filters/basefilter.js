// Base class for all query filter DTOs.
class BaseFilter {
    constructor() {
        this.readFromCache = false;
        this.sortParams = undefined;
        this.paginationParams = undefined;
    }
}

module.exports = { BaseFilter };
