// Base class for all query filter DTOs (pronnel basefilter analog).
class BaseFilter {
    constructor() {
        this.readFromCache = false;
        this.sortParams = undefined;
        this.paginationParams = undefined;
    }
}

module.exports = { BaseFilter };
