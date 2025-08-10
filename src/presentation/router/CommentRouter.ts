import { Router } from 'express';
import { CommentController } from '../controller/CommentController';
import { AuthenticatedRequest, SanitizationMiddleware, ValidationMiddleware } from '../middleware';
import { DIContainer } from '@/infrastructure/di/DIContainer';
import { CommentValidators } from '../validators/CommentValidators';

export class CommentRouter {
    private router: Router;
    private diContainer: DIContainer;

    constructor() {
        this.diContainer = DIContainer.getInstance();
        this.router = Router();
        this.setupRoutes();
    }

    private setupRoutes(): void {
        const authMiddleware = this.diContainer.authMiddleware;
        const controller = new CommentController(
            this.diContainer.resolve('createCommentUseCase'),
            this.diContainer.resolve('getVideoCommentsUseCase'),
            this.diContainer.resolve('deleteCommentUseCase')
        );

        // Create a new comment (requires authentication)
        this.router.post(
            '/',
            authMiddleware.authenticateUser,
            SanitizationMiddleware.allowedFields(['videoId', 'content']),
            ...CommentValidators.createComment(),
            ValidationMiddleware.handleValidationErrors(),
            (req: AuthenticatedRequest, res) => controller.createComment(req, res)
        );

        // Get all comments for a video (public endpoint)
        this.router.get(
            '/video/:videoId',
            ...CommentValidators.videoIdParam(),
            ValidationMiddleware.handleValidationErrors(),
            (req, res) => controller.getVideoComments(req, res)
        );

        // Delete a comment (requires authentication and ownership)
        this.router.delete(
            '/:id',
            authMiddleware.authenticateUser,
            ...CommentValidators.commentIdParam(),
            ValidationMiddleware.handleValidationErrors(),
            (req: AuthenticatedRequest, res) => controller.deleteComment(req, res)
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}
