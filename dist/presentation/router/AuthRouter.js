"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const AuthValidators_1 = require("../validators/AuthValidators");
const ValidationMiddleware_1 = require("../middleware/ValidationMiddleware");
const SanitizationMiddleware_1 = require("../middleware/SanitizationMiddleware");
const DIContainer_1 = require("../../infrastructure/di/DIContainer");
class AuthRouter {
    constructor(authController) {
        this.authController = authController;
        this.router = (0, express_1.Router)();
        this.upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
        this.setupRoutes();
    }
    setupRoutes() {
        const authMiddleware = DIContainer_1.DIContainer.getInstance().authMiddleware;
        this.router.post('/register/customer', SanitizationMiddleware_1.SanitizationMiddleware.sanitizeCustomerRegistration(), AuthValidators_1.AuthValidators.registerCustomer(), ValidationMiddleware_1.ValidationMiddleware.handleValidationErrors(), this.authController.registerCustomer);
        this.router.post('/register/restaurant-owner', SanitizationMiddleware_1.SanitizationMiddleware.sanitizeRestaurantOwnerRegistration(), AuthValidators_1.AuthValidators.registerRestaurantOwner(), ValidationMiddleware_1.ValidationMiddleware.handleValidationErrors(), this.authController.registerRestaurantOwner);
        this.router.get('/verify', this.authController.verifyEmail);
        this.router.post('/login', SanitizationMiddleware_1.SanitizationMiddleware.sanitizeLoginRequest(), AuthValidators_1.AuthValidators.login(), ValidationMiddleware_1.ValidationMiddleware.handleValidationErrors(), this.authController.login);
        this.router.post('/profile/image', authMiddleware.authenticate, this.upload.single('profileImage'), SanitizationMiddleware_1.SanitizationMiddleware.sanitizeProfileImageUpload(), this.authController.uploadProfileImage);
    }
    getRouter() {
        return this.router;
    }
}
exports.AuthRouter = AuthRouter;
