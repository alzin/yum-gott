"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanitizationMiddleware = void 0;
const xss_1 = __importDefault(require("xss"));
class SanitizationMiddleware {
    static allowedFields(allowedFields) {
        return (req, res, next) => {
            const sanitizedBody = {};
            if (typeof req.body === 'object' && req.body !== null) {
                for (const field of allowedFields) {
                    if (field in req.body) {
                        sanitizedBody[field] = typeof req.body[field] === 'string' ? (0, xss_1.default)(req.body[field]) : req.body[field];
                    }
                }
            }
            req.body = sanitizedBody;
            next();
        };
    }
    static excludeFields(excludedFields) {
        return (req, res, next) => {
            if (typeof req.body === 'object' && req.body !== null) {
                for (const field of excludedFields) {
                    delete req.body[field];
                }
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
    static sanitizeRestaurantLocationUpdate() {
        return SanitizationMiddleware.allowedFields([
            'address',
            'latitude',
            'longitude'
        ]);
    }
}
exports.SanitizationMiddleware = SanitizationMiddleware;
