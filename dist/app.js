"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const morgan_1 = __importDefault(require("morgan"));
const DIContainer_1 = require("./infrastructure/di/DIContainer");
const AuthRouter_1 = require("./presentation/router/AuthRouter");
const path_1 = __importDefault(require("path"));
class App {
    constructor() {
        const swaggerDocument = yamljs_1.default.load(path_1.default.join(__dirname, "./docs/swagger.yaml"));
        this.app = (0, express_1.default)();
        this.publicPath = path_1.default.join(__dirname, 'public');
        this.app.use(express_1.default.static(this.publicPath));
        this.app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
        this.diContainer = DIContainer_1.DIContainer.getInstance();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }
    setupMiddleware() {
        this.app.use((0, helmet_1.default)());
        this.app.use((0, cors_1.default)({
            origin: function (origin, callback) {
                const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000', 'https://yum-gott.onrender.com', "http://127.0.0.1:5500"];
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                }
                else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
            exposedHeaders: ['Set-Cookie'],
        }));
        this.app.use((0, morgan_1.default)('combined'));
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    }
    setupRoutes() {
        this.app.get('/index', (req, res) => {
            res.sendFile(path_1.default.join(this.publicPath, 'index.html'));
        });
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        });
        const authRouter = new AuthRouter_1.AuthRouter(this.diContainer.authController);
        this.app.use('/api/auth', authRouter.getRouter());
        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        });
    }
    setupErrorHandling() {
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
