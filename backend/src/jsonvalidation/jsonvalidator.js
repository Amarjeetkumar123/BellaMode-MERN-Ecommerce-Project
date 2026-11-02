// Central AJV validator registry (pronnel jsonvalidator analog).
// Each exported middleware validates req.body against a schema and uses the custom
// next(isSuccess, code, body) contract so it composes with and/or middleware.
const Ajv = require('ajv');
const addKeywords = require('ajv-keywords');

const userschema = require('./userschema');
const categoryschema = require('./categoryschema');
const productschema = require('./productschema');
const uploadschema = require('./uploadschema');
const reviewschema = require('./reviewschema');
const orderschema = require('./orderschema');
const paymentschema = require('./paymentschema');
const settingschema = require('./settingschema');
const bannerschema = require('./bannerschema');
const blogschema = require('./blogschema');
const supportschema = require('./supportschema');

const ajv = new Ajv({ allErrors: true, coerceTypes: false });
addKeywords(ajv);

// Builds a readable message from AJV errors (which field, what rule).
function buildErrorMessage(errors) {
    if (!errors || !errors.length) return 'Invalid request body.';
    return errors
        .map((err) => {
            if (err.keyword === 'additionalProperties') {
                return `unexpected field '${err.params.additionalProperty}'`;
            }
            const field = (err.instancePath || '').replace(/^\//, '').replace(/\//g, '.');
            return field ? `${field} ${err.message}` : err.message;
        })
        .join('; ');
}

// Compiled validators are cached by schema object reference.
const validatorCache = new Map();
function getValidator(schema) {
    let validate = validatorCache.get(schema);
    if (!validate) {
        validate = ajv.compile(schema);
        validatorCache.set(schema, validate);
    }
    return validate;
}

function validateUsingAjvBySchema(schema, req, res, next) {
    try {
        const validate = getValidator(schema);
        const body = req.body || {};
        if (validate(body)) {
            return next(true);
        }
        return next(false, 400, { success: false, message: buildErrorMessage(validate.errors) });
    } catch (e) {
        return next(false, 400, { success: false, message: e.message });
    }
}

// Wraps a schema into a named validation middleware.
function makeValidator(schema) {
    return (req, res, next) => validateUsingAjvBySchema(schema, req, res, next);
}

module.exports = {
    validateUsingAjvBySchema,
    makeValidator,
    // ---- user ----
    validateRegisterSchema: makeValidator(userschema.registerSchema),
    validateLoginSchema: makeValidator(userschema.loginSchema),
    validateEditProfileSchema: makeValidator(userschema.editProfileSchema),
    validateUpdateUserRoleSchema: makeValidator(userschema.updateUserRoleSchema),
    validateChangePasswordSchema: makeValidator(userschema.changePasswordSchema),
    validateNewsletterSchema: makeValidator(userschema.newsletterSchema),
    // ---- category ----
    validateCreateCategorySchema: makeValidator(categoryschema.createCategorySchema),
    validateUpdateCategorySchema: makeValidator(categoryschema.updateCategorySchema),
    // ---- product ----
    validateCreateProductSchema: makeValidator(productschema.createProductSchema),
    validateUpdateProductSchema: makeValidator(productschema.updateProductSchema),
    // ---- upload ----
    validateUploadByUrlSchema: makeValidator(uploadschema.uploadByUrlSchema),
    // ---- review ----
    validateCreateReviewSchema: makeValidator(reviewschema.createReviewSchema),
    // ---- order ----
    validateCreateOrderSchema: makeValidator(orderschema.createOrderSchema),
    validateUpdateOrderStatusSchema: makeValidator(orderschema.updateOrderStatusSchema),
    validateCancelOrderSchema: makeValidator(orderschema.cancelOrderSchema),
    // ---- payment ----
    validateCreatePaymentOrderSchema: makeValidator(paymentschema.createPaymentOrderSchema),
    validateVerifyPaymentSchema: makeValidator(paymentschema.verifyPaymentSchema),
    // ---- setting ----
    validateUpdateSettingSchema: makeValidator(settingschema.updateSettingSchema),
    // ---- banner ----
    validateCreateBannerSchema: makeValidator(bannerschema.createBannerSchema),
    validateUpdateBannerSchema: makeValidator(bannerschema.updateBannerSchema),
    // ---- blog ----
    validateCreateBlogSchema: makeValidator(blogschema.createBlogSchema),
    validateUpdateBlogSchema: makeValidator(blogschema.updateBlogSchema),
    // ---- support ----
    validateCreateSupportSchema: makeValidator(supportschema.createSupportSchema),
    validateUpdateSupportSchema: makeValidator(supportschema.updateSupportSchema),
};
