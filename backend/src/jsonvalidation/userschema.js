const def = require('./schemaDefinitions');

exports.registerSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['username', 'email', 'password'],
    properties: {
        username: { type: 'string', minLength: 2, maxLength: 40 },
        email: def.email,
        password: { type: 'string', minLength: 6, maxLength: 128 },
    },
};

exports.loginSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['email', 'password'],
    properties: {
        email: def.email,
        password: def.nonEmptyString,
    },
};

exports.editProfileSchema = {
    type: 'object',
    additionalProperties: false,
    minProperties: 1,
    properties: {
        username: { type: 'string', minLength: 2, maxLength: 40 },
        profileImage: def.trimString,
        bio: { type: 'string', maxLength: 200 },
        profession: def.trimString,
        phone: def.trimString,
        // saved delivery addresses; the first one is the default
        addresses: {
            type: 'array',
            maxItems: 5,
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['fullName', 'phone', 'line1', 'city', 'state', 'postalCode'],
                properties: {
                    label: { type: 'string', maxLength: 30 },
                    fullName: { type: 'string', minLength: 1, maxLength: 80 },
                    phone: { type: 'string', pattern: '^[6-9][0-9]{9}$' },
                    line1: { type: 'string', minLength: 1, maxLength: 160 },
                    line2: { type: 'string', maxLength: 160 },
                    city: { type: 'string', minLength: 1, maxLength: 60 },
                    state: { type: 'string', minLength: 1, maxLength: 60 },
                    postalCode: { type: 'string', pattern: '^[1-9][0-9]{5}$' },
                },
            },
        },
    },
};

exports.changePasswordSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['currentPassword', 'newPassword'],
    properties: {
        currentPassword: def.nonEmptyString,
        newPassword: { type: 'string', minLength: 8, maxLength: 128 },
    },
};

exports.newsletterSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['email'],
    properties: { email: { ...def.email, maxLength: 254 } },
};

exports.updateUserRoleSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['role'],
    properties: {
        role: { enum: ['SUPERADMIN', 'ADMIN', 'USER'] },
    },
};
