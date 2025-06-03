"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
class AuthMiddleware {
    constructor(authRepository) {
        this.authRepository = authRepository;
        this.authenticate = async (req, res, next) => {
            try {
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    res.status(401).json({
                        success: false,
                        message: 'Access token required'
                    });
                    return;
                }
                const token = authHeader.substring(7);
                const payload = await this.authRepository.verifyToken(token);
                req.user = payload;
                next();
            }
            catch (error) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid or expired token'
                });
            }
        };
    }
}
exports.AuthMiddleware = AuthMiddleware;
