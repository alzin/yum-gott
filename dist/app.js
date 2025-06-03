"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const DIContainer_1 = require("./infrastructure/di/DIContainer");
const AuthRouter_1 = require("./presentation/router/AuthRouter");
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.diContainer = DIContainer_1.DIContainer.getInstance();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }
    setupMiddleware() {
        // Security middleware
        this.app.use((0, helmet_1.default)());
        // CORS configuration
        this.app.use((0, cors_1.default)({
            origin: process.env.CORS_ORIGIN || '*',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));
        // Logging
        this.app.use((0, morgan_1.default)('combined'));
        // Body parsing
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    }
    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        });
        // API routes
        const authRouter = new AuthRouter_1.AuthRouter(this.diContainer.authController);
        this.app.use('/api/auth', authRouter.getRouter());
        // 404 handler - must be after all other routes
        this.app.use((req, res) => {
            res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        });
    }
    setupErrorHandling() {
        // Global error handler
        this.app.use((error, req, res, next) => {
            console.error('Global Error Handler:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                ...(process.env.NODE_ENV === 'development' && { error: error.message })
            });
        });
    }
    getApp() {
        return this.app;
    }
    async start(port = 3000) {
        try {
            this.app.listen(port, () => {
                console.log(`🚀 Server is running on port ${port}`);
                console.log(`📱 Health check: http://localhost:${port}/health`);
                console.log(`🔐 Auth API: http://localhost:${port}/api/auth`);
            });
        }
        catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }
}
exports.App = App;
