"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const AuthValidators_1 = require("../validators/AuthValidators");
const index_1 = require("../middleware/index");
const DIContainer_1 = require("../../infrastructure/di/DIContainer");
class AuthRouter {
    constructor(authController) {
        this.authController = authController;
        this.router = (0, express_1.Router)();
        this.upload = (0, multer_1.default)({
            storage: multer_1.default.memoryStorage(),
            fileFilter: (req, file, cb) => {
                const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
                if (!allowedTypes.includes(file.mimetype)) {
                    return cb(new Error('Only JPEG, PNG, and GIF images are allowed'));
                }
                cb(null, true);
            },
            limits: {
                fileSize: 5 * 1024 * 1024 // 5MB limit
            }
        });
        this.setupRoutes();
    }
    setupRoutes() {
        const authMiddleware = DIContainer_1.DIContainer.getInstance().authMiddleware;
        // Middleware to check if user is a restaurant owner
        const requireRestaurantOwner = (req, res, next) => {
            const authReq = req;
            if (!authReq.user || authReq.user.userType !== 'restaurant_owner') {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden: Only restaurant owners can access this endpoint'
                });
                return;
            }
            next();
        };
        // Get restaurant owner profile
        this.router.get('/profile/restaurant-owner', authMiddleware.authenticate, requireRestaurantOwner, (req, res) => this.authController.getRestaurantOwnerProfile(req, res));
        this.router.post('/register/customer', index_1.SanitizationMiddleware.sanitizeCustomerRegistration(), AuthValidators_1.AuthValidators.registerCustomer(), index_1.ValidationMiddleware.handleValidationErrors(), this.authController.registerCustomer);
        this.router.post('/register/restaurant-owner', index_1.SanitizationMiddleware.sanitizeRestaurantOwnerRegistration(), AuthValidators_1.AuthValidators.registerRestaurantOwner(), index_1.ValidationMiddleware.handleValidationErrors(), this.authController.registerRestaurantOwner);
        this.router.get('/verify', this.authController.verifyEmail);
        this.router.post('/login/customer', index_1.SanitizationMiddleware.sanitizeLoginRequest(), AuthValidators_1.AuthValidators.login(), index_1.ValidationMiddleware.handleValidationErrors(), this.authController.customerLogin);
        this.router.post('/login/restaurant-owner', index_1.SanitizationMiddleware.sanitizeLoginRequest(), AuthValidators_1.AuthValidators.login(), index_1.ValidationMiddleware.handleValidationErrors(), this.authController.restaurantOwnerLogin);
        this.router.post('/profile/image', (req, res, next) => {
            this.upload.single('profileImage')(req, res, (err) => {
                if (err instanceof multer_1.default.MulterError) {
                    return res.status(400).json({ success: false, message: err.message });
                }
                else if (err) {
                    return res.status(400).json({ success: false, message: err.message });
                }
                next();
            });
        }, (req, res, next) => {
            console.log('Before SanitizationMiddleware - req.body:', req.body);
            const file = req.file;
            console.log('Before SanitizationMiddleware - req.file:', file);
            if (!file) {
                res.status(400).json({
                    success: false,
                    message: 'Profile image is required'
                });
                return;
            }
            next();
        }, authMiddleware.authenticate, (req, res) => this.authController.uploadProfileImage(req, res));
        this.router.post('/location/restaurant', authMiddleware.authenticate, index_1.SanitizationMiddleware.sanitizeRestaurantLocationUpdate(), AuthValidators_1.AuthValidators.updateRestaurantLocation(), index_1.ValidationMiddleware.handleValidationErrors(), this.authController.updateRestaurantLocation);
    }
    getRouter() {
        return this.router;
    }
}
exports.AuthRouter = AuthRouter;
