import { Router } from 'express';
import { LikeController } from '../controller/LikeController';
import { AuthenticatedRequest, SanitizationMiddleware, ValidationMiddleware } from '../middleware';
import { DIContainer } from '@/infrastructure/di/DIContainer';
import { body, param } from 'express-validator';

export class LikeRouter {
    private router: Router;
    private diContainer: DIContainer;

    constructor() {
        this.diContainer = DIContainer.getInstance();
        this.router = Router();
        this.setupRoutes();
    }

    private setupRoutes(): void {
        const authMiddleware = this.diContainer.authMiddleware;
        const controller = new LikeController(
            this.diContainer.resolve('toggleVideoLikeUseCase'),
            this.diContainer.resolve('getVideoLikesUseCase')
        );

        // Toggle like on a video (requires authentication)
        this.router.post(
            '/toggle',
            authMiddleware.authenticateUser,
            SanitizationMiddleware.allowedFields(['videoId']),
            body('videoId').isUUID().withMessage('Invalid video ID format'),
            ValidationMiddleware.handleValidationErrors(),
            (req: AuthenticatedRequest, res) => controller.toggleVideoLike(req, res)
        );

        // Get likes for a video (public endpoint)
        this.router.get(
            '/video/:videoId',
            param('videoId').isUUID().withMessage('Invalid video ID format'),
            ValidationMiddleware.handleValidationErrors(),
            (req, res) => controller.getVideoLikes(req, res)
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}
