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
    },
};

exports.updateUserRoleSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['role'],
    properties: {
        role: { enum: ['SUPERADMIN', 'ADMIN', 'USER'] },
    },
};
