const { BaseFilter } = require('./basefilter');

// Query DTO for user lookups. Array fields enable $in multi-value filtering.
class UserFilter extends BaseFilter {
    constructor() {
        super();
        this.userIdArray = undefined;
        this.emailArray = undefined;
        this.usernameArray = undefined;
        this.roleArray = undefined;
        this.searchObj = undefined; // { search_text, search_columns }
    }
}

module.exports = { UserFilter };
