"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanitizationMiddleware = void 0;
class SanitizationMiddleware {
    static allowedFields(allowedFields) {
        return (req, res, next) => {
            const sanitizedBody = {};
            for (const field of allowedFields) {
                if (req.body.hasOwnProperty(field)) {
                    sanitizedBody[field] = req.body[field];
                }
            }
            req.body = sanitizedBody;
            next();
        };
    }
    static excludeFields(excludedFields) {
        return (req, res, next) => {
            for (const field of excludedFields) {
                delete req.body[field];
            }
            next();
        };
    }
    static sanitizeCustomerRegistration() {
        return SanitizationMiddleware.allowedFields([
            'name',
            'email',
            'mobileNumber',
            'password'
        ]);
    }
    static sanitizeRestaurantOwnerRegistration() {
        return SanitizationMiddleware.allowedFields([
            'restaurantName',
            'organizationNumber',
            'mobileNumber',
            'email',
            'password'
        ]);
    }
    static sanitizeLoginRequest() {
        return SanitizationMiddleware.allowedFields([
            'email',
            'password'
        ]);
    }
    static sanitizeProfileImageUpload() {
        return SanitizationMiddleware.allowedFields([
            'userType'
        ]);
    }
}
exports.SanitizationMiddleware = SanitizationMiddleware;
