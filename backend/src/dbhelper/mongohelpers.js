// Low-level Mongo query builders shared by every DAO.

function convertToJsonArray(obj) {
    if (obj instanceof Array) return obj;
    if (obj == null) return [];
    return [obj];
}

function jsonArrayToSelectString(jsonArray) {
    return jsonArray.join(' ');
}

function escapeRegExp(string) {
    return String(string).replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
}

/**
 * Builds a Mongo `find` filter from a plain filterJson.
 * @param filterJson              the raw values, e.g. { category:['dress'], price:{from,to}, search_params:{search_text} }
 * @param inColumnNamesArray      columns matched with $in (equality / multi-value)
 * @param rangeColumnNamesArray   columns matched with $gte/$lte using { from, to }
 * @param arrayColumnNamesObjectArray  [{ arrayField: 'nestedKey' }] → $elemMatch
 * @param allowedSearchColumns    columns eligible for case-insensitive $regex OR search
 */
function createMongoAndFilterForColumns(
    filterJson,
    inColumnNamesArray,
    rangeColumnNamesArray,
    arrayColumnNamesObjectArray,
    allowedSearchColumns
) {
    const mongoFilterJson = {};

    if (inColumnNamesArray) {
        inColumnNamesArray.forEach(function (columnName) {
            if (filterJson[columnName] != null) {
                mongoFilterJson[columnName] = { $in: convertToJsonArray(filterJson[columnName]) };
            }
        });
    }

    if (rangeColumnNamesArray) {
        rangeColumnNamesArray.forEach(function (columnName) {
            if (filterJson[columnName]) {
                const rangeFilterJson = {};
                if (filterJson[columnName].from != null) rangeFilterJson.$gte = filterJson[columnName].from;
                if (filterJson[columnName].to != null) rangeFilterJson.$lte = filterJson[columnName].to;
                if (Object.keys(rangeFilterJson).length) mongoFilterJson[columnName] = rangeFilterJson;
            }
        });
    }

    if (arrayColumnNamesObjectArray) {
        arrayColumnNamesObjectArray.forEach(function (arrayColumnNameObject) {
            const arrayKeys = Object.keys(arrayColumnNameObject);
            if (arrayKeys.length === 0) return;
            const arrayColumnName = arrayKeys[0];
            const objectColumnNameInArray = arrayColumnNameObject[arrayColumnName];
            if (filterJson[arrayColumnName] && filterJson[arrayColumnName][objectColumnNameInArray]) {
                if (!mongoFilterJson[arrayColumnName]) mongoFilterJson[arrayColumnName] = { $elemMatch: {} };
                mongoFilterJson[arrayColumnName].$elemMatch[objectColumnNameInArray] = {
                    $in: convertToJsonArray(filterJson[arrayColumnName][objectColumnNameInArray]),
                };
            }
        });
    }

    if (
        allowedSearchColumns &&
        filterJson.search_params &&
        filterJson.search_params.search_text
    ) {
        let givenSearchColumns = allowedSearchColumns;
        if (filterJson.search_params.search_columns && filterJson.search_params.search_columns.length > 0) {
            givenSearchColumns = filterJson.search_params.search_columns;
        }
        const filteredSearchColumns = givenSearchColumns.filter((value) => allowedSearchColumns.includes(value));
        const searchJsonArray = filteredSearchColumns.map(function (columnName) {
            return {
                [columnName]: { $regex: escapeRegExp(filterJson.search_params.search_text), $options: 'i' },
            };
        });
        if (searchJsonArray.length) mongoFilterJson.$or = searchJsonArray;
    }

    return mongoFilterJson;
}

// Applies column selection, sort and pagination onto a mongoose Query object.
function modifyMongoQuery(mongoQuery, columnsRequired, sortParams, paginationParams) {
    if (columnsRequired) {
        mongoQuery.select(jsonArrayToSelectString(columnsRequired));
    }
    if (sortParams) {
        mongoQuery.collation({ locale: 'en_US', strength: 2 }).sort(sortParams);
    }
    if (paginationParams) {
        if (paginationParams.start_from) {
            mongoQuery.skip(paginationParams.start_from);
        }
        if (paginationParams.page_size) {
            mongoQuery.limit(paginationParams.page_size);
            if (paginationParams.page_number) {
                const pageNumber = paginationParams.page_number < 1 ? 1 : paginationParams.page_number;
                mongoQuery.skip(paginationParams.page_size * (pageNumber - 1));
            }
        }
    }
}

async function fetchData(mongoQuery) {
    return mongoQuery.exec();
}

async function fetchDataCount(mongoQuery) {
    return mongoQuery.countDocuments().exec();
}

module.exports = {
    convertToJsonArray,
    jsonArrayToSelectString,
    escapeRegExp,
    createMongoAndFilterForColumns,
    modifyMongoQuery,
    fetchData,
    fetchDataCount,
};
