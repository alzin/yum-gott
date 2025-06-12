"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthValidators = exports.fileUpload = void 0;
const express_validator_1 = require("express-validator");
const multer_1 = __importDefault(require("multer"));
exports.fileUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only JPEG, PNG, and GIF images are allowed'));
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 // Allow only one file
    }
});
class AuthValidators {
    static registerCustomer() {
        return [
            (0, express_validator_1.body)('name')
                .trim()
                .notEmpty()
                .withMessage('Name is required')
                .isLength({ min: 2, max: 100 })
                .withMessage('Name must be between 2 and 100 characters')
                .matches(/^[a-zA-Z\s]+$/)
                .withMessage('Name can only contain letters and spaces'),
            (0, express_validator_1.body)('email')
                .trim()
                .notEmpty()
                .withMessage('Email is required')
                .isEmail()
                .withMessage('Invalid email format')
                .normalizeEmail()
                .isLength({ max: 255 })
                .withMessage('Email must not exceed 255 characters')
                .custom((value) => {
                const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                const parts = value.split('@');
                if (parts.length !== 2 || !domainRegex.test(parts[1])) {
                    throw new Error('Invalid email domain (e.g., no repeated .com)');
                }
                if (parts[1].includes('.com.com') || parts[1].match(/(\.\w+)\1/)) {
                    throw new Error('Email domain contains repeated extensions');
                }
                return true;
            }),
            (0, express_validator_1.body)('mobileNumber')
                .trim()
                .notEmpty()
                .withMessage('Mobile number is required')
                .matches(/^[0-9]{10,15}$/)
                .withMessage('Mobile number must be 10-15 digits'),
            (0, express_validator_1.body)('password')
                .notEmpty()
                .withMessage('Password is required')
                .isLength({ min: 6, max: 100 })
                .withMessage('Password must be between 6 and 100 characters')
                .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
                .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
        ];
    }
    static registerRestaurantOwner() {
        return [
            (0, express_validator_1.body)('restaurantName')
                .trim()
                .notEmpty()
                .withMessage('Restaurant name is required')
                .isLength({ min: 2, max: 255 })
                .withMessage('Restaurant name must be between 2 and 255 characters'),
            (0, express_validator_1.body)('organizationNumber')
                .trim()
                .notEmpty()
                .withMessage('Organization number is required')
                .isLength({ min: 5, max: 50 })
                .withMessage('Organization number must be between 5 and 50 characters')
                .matches(/^[A-Z0-9]+$/)
                .withMessage('Organization number must contain only uppercase letters and numbers'),
            (0, express_validator_1.body)('email')
                .trim()
                .notEmpty()
                .withMessage('Email is required')
                .isEmail()
                .withMessage('Invalid email format')
                .normalizeEmail()
                .isLength({ max: 255 })
                .withMessage('Email must not exceed 255 characters')
                .custom((value) => {
                const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                const parts = value.split('@');
                if (parts.length !== 2 || !domainRegex.test(parts[1])) {
                    throw new Error('Invalid email domain (e.g., no repeated .com)');
                }
                if (parts[1].includes('.com.com') || parts[1].match(/(\.\w+)\1/)) {
                    throw new Error('Email domain contains repeated extensions');
                }
                return true;
            }),
            (0, express_validator_1.body)('mobileNumber')
                .trim()
                .notEmpty()
                .withMessage('Mobile number is required')
                .matches(/^[0-9]{10,15}$/)
                .withMessage('Mobile number must be 10-15 digits'),
            (0, express_validator_1.body)('password')
                .notEmpty()
                .withMessage('Password is required')
                .isLength({ min: 6, max: 100 })
                .withMessage('Password must be between 6 and 100 characters')
                .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
                .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
        ];
    }
    static login() {
        return [
            (0, express_validator_1.body)('email')
                .optional()
                .trim()
                .isEmail()
                .withMessage('Invalid email format')
                .normalizeEmail()
                .isLength({ max: 255 })
                .withMessage('Email must not exceed 255 characters')
                .custom((value) => {
                if (!value)
                    return true;
                const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                const parts = value.split('@');
                if (parts.length !== 2 || !domainRegex.test(parts[1])) {
                    throw new Error('Invalid email domain (e.g., no repeated .com)');
                }
                if (parts[1].includes('.com.com') || parts[1].match(/(\.\w+)\1/)) {
                    throw new Error('Email domain contains repeated extensions');
                }
                return true;
            }),
            (0, express_validator_1.body)('mobileNumber')
                .optional()
                .trim()
                .matches(/^[0-9]{10,15}$/)
                .withMessage('Mobile number must be 10-15 digits'),
            (0, express_validator_1.body)('password')
                .notEmpty()
                .withMessage('Password is required')
                .isLength({ min: 6 })
                .withMessage('Password must be at least 6 characters'),
            (0, express_validator_1.body)().custom((value) => {
                if (!value.email && !value.mobileNumber) {
                    throw new Error('Email or mobile number is required');
                }
                return true;
            })
        ];
    }
    static updateRestaurantLocation() {
        return [
            (0, express_validator_1.body)('address')
                .trim()
                .notEmpty()
                .withMessage('Address is required')
                .isLength({ max: 255 })
                .withMessage('Address must not exceed 255 characters'),
            (0, express_validator_1.body)('latitude')
                .notEmpty()
                .withMessage('Latitude is required')
                .isFloat({ min: -90, max: 90 })
                .withMessage('Latitude must be a number between -90 and 90')
                .toFloat(),
            (0, express_validator_1.body)('longitude')
                .notEmpty()
                .withMessage('Longitude is required')
                .isFloat({ min: -180, max: 180 })
                .withMessage('Longitude must be a number between -180 and 180')
                .toFloat()
        ];
    }
}
exports.AuthValidators = AuthValidators;
