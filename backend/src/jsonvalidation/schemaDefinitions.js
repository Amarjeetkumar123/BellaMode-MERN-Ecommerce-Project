// Reusable JSON-Schema fragments shared across entity schemas (pronnel schemaDefinitions analog).

const nonEmptyString = { type: 'string', minLength: 1 };
const trimString = { type: 'string' };
const email = { type: 'string', pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' };
// 24-char hex Mongo ObjectId
const objectId = { type: 'string', pattern: '^[a-fA-F0-9]{24}$' };
const positiveNumber = { type: 'number', minimum: 0 };
const boolean = { type: 'boolean' };
const stringArray = { type: 'array', items: { type: 'string' } };

const pagination = {
    type: 'object',
    additionalProperties: false,
    properties: {
        page_size: { type: 'integer', minimum: 1 },
        page_number: { type: 'integer', minimum: 1 },
    },
};

const sorting = {
    type: 'object',
    additionalProperties: false,
    properties: {
        sort_by: { type: 'string' },
        sort_order: { enum: ['ASC', 'DSC', 'asc', 'desc'] },
    },
};

const searchParams = {
    type: 'object',
    additionalProperties: false,
    properties: {
        search_text: trimString,
        search_columns: stringArray,
    },
};

const range = {
    type: 'object',
    additionalProperties: false,
    properties: {
        from: { type: 'number' },
        to: { type: 'number' },
    },
};

module.exports = {
    nonEmptyString,
    trimString,
    email,
    objectId,
    positiveNumber,
    boolean,
    stringArray,
    pagination,
    sorting,
    searchParams,
    range,
};
