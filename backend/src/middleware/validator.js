/**
 * Validation Middleware
 * Middleware to validate request data using validators
 */

const { validationErrorResponse } = require('../utils/response');
const { ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Create validation middleware
 * @param {Function} validatorFn - Validator function to use
 * @param {String} source - Where to get data from ('body', 'query', 'params')
 * @returns {Function} Express middleware
 */
const validate = (validatorFn, source = 'body') => {
    return (req, res, next) => {
        try {
            // Get data from specified source
            const data = req[source];

            // Run validator
            const validated = validatorFn(data);

            // Attach validated data to request
            req.validated = validated;

            next();
        } catch (error) {
            if (error instanceof ValidationError) {
                logger.warn('Validation failed', {
                    path: req.path,
                    errors: error.errors
                });
                return validationErrorResponse(res, error.errors, error.message);
            }

            // Pass other errors to error handler
            next(error);
        }
    };
};

/**
 * Validate request body
 * @param {Function} validatorFn - Validator function
 */
const validateBody = (validatorFn) => validate(validatorFn, 'body');

/**
 * Validate query parameters
 * @param {Function} validatorFn - Validator function
 */
const validateQuery = (validatorFn) => validate(validatorFn, 'query');

/**
 * Validate route parameters
 * @param {Function} validatorFn - Validator function
 */
const validateParams = (validatorFn) => validate(validatorFn, 'params');

module.exports = {
    validate,
    validateBody,
    validateQuery,
    validateParams
};
