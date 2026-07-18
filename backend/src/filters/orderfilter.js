const { BaseFilter } = require('./basefilter');

class OrderFilter extends BaseFilter {
    constructor() {
        super();
        this.orderIdArray = undefined;
        this.userArray = undefined;
        this.statusArray = undefined;
        this.paymentStatusArray = undefined;
    }
}

module.exports = { OrderFilter };
