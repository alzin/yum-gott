"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouter = void 0;
const express_1 = require("express");
const AuthValidators_1 = require("../validators/AuthValidators");
const ValidationMiddleware_1 = require("../middleware/ValidationMiddleware");
const SanitizationMiddleware_1 = require("../middleware/SanitizationMiddleware");
class AuthRouter {
    constructor(authController) {
        this.authController = authController;
        this.router = (0, express_1.Router)();
        this.setupRoutes();
    }
    setupRoutes() {
        // Customer registration
        this.router.post('/register/customer', SanitizationMiddleware_1.SanitizationMiddleware.sanitizeCustomerRegistration(), AuthValidators_1.AuthValidators.registerCustomer(), ValidationMiddleware_1.ValidationMiddleware.handleValidationErrors(), this.authController.registerCustomer);
        // Restaurant owner registration
        this.router.post('/register/restaurant-owner', SanitizationMiddleware_1.SanitizationMiddleware.sanitizeRestaurantOwnerRegistration(), AuthValidators_1.AuthValidators.registerRestaurantOwner(), ValidationMiddleware_1.ValidationMiddleware.handleValidationErrors(), this.authController.registerRestaurantOwner);
        // Email verification
        this.router.get('/verify', this.authController.verifyEmail);
        // Login - supports both email and mobile number
        this.router.post('/login', SanitizationMiddleware_1.SanitizationMiddleware.sanitizeLoginRequest(), AuthValidators_1.AuthValidators.login(), ValidationMiddleware_1.ValidationMiddleware.handleValidationErrors(), this.authController.login);
    }
    getRouter() {
        return this.router;
    }
}
exports.AuthRouter = AuthRouter;
