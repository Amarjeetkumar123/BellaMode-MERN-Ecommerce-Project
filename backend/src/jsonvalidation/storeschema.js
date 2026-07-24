const def = require('./schemaDefinitions');

// Store name/slug/subdomain shape. Slug & subdomain are lowercase alphanumeric+hyphen.
const slugPattern = '^[a-z0-9]+(?:-[a-z0-9]+)*$';

// Fields a seller may set on their own store (status/commissionRate/owner are excluded
// by omission — additionalProperties:false rejects them).
const editableProps = {
    name: { type: 'string', minLength: 1, maxLength: 60 },
    slug: { type: 'string', pattern: slugPattern, minLength: 2, maxLength: 40 },
    subdomain: { type: 'string', pattern: slugPattern, minLength: 2, maxLength: 40 },
    // Razorpay Route linked-account id (acc_…); empty string clears it.
    razorpayAccountId: { type: 'string', pattern: '^(acc_[A-Za-z0-9]+)?$', maxLength: 40 },
};

exports.createStoreSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['name'],
    properties: editableProps,
};

exports.updateStoreSchema = {
    type: 'object',
    additionalProperties: false,
    minProperties: 1,
    properties: editableProps,
};

exports.updateStoreStatusSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['status'],
    properties: {
        status: { enum: ['pending', 'approved', 'suspended'] },
        commissionRate: { type: 'number', minimum: 0, maximum: 100 },
    },
};

// Reserved names that can't be used as a store slug/subdomain (they collide with
// platform routes once subdomains go live).
exports.RESERVED_SLUGS = ['www', 'api', 'admin', 'app', 'assets', 'static', 'mail', 'shop', 'store'];
