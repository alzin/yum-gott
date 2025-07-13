import { Router, Response } from 'express';
import { OpeningHoursController } from '../controller/OpeningHours/OpeningHoursController';
import { AuthenticatedRequest, SanitizationMiddleware, ValidationMiddleware } from '../middleware';
import { OpeningHoursValidators } from '../validators/OpeningHoursValidators';
import { DIContainer } from '@/infrastructure/di/DIContainer';

export class OpeningHoursRouter {
    private router: Router;
    private diContainer: DIContainer;

    constructor() {
        this.diContainer = DIContainer.getInstance();
        this.router = Router();
        this.setupRoutes();
    }

    private setupRoutes(): void {
        const authMiddleware = this.diContainer.authMiddleware;
        const controller = new OpeningHoursController(
            this.diContainer.resolve('createOpeningHoursUseCase'),
            this.diContainer.resolve('getOpeningHoursUseCase'),
            this.diContainer.resolve('deleteOpeningHoursUseCase'),
            this.diContainer.resolve('updateOpeningHoursUseCase')
        );

        this.router.post(
            '/',
            authMiddleware.authenticateUser,
            authMiddleware.requireRestaurantOwner,
            SanitizationMiddleware.allowedFields(['day', 'Working_hours', 'isClosed']),
            OpeningHoursValidators.createOpeningHours(),
            ValidationMiddleware.handleValidationErrors(),
            (req: AuthenticatedRequest, res: Response) => controller.createOpeningHours(req, res)
        );

        this.router.get(
            '/restaurant',
            authMiddleware.authenticateUser,
            authMiddleware.requireRestaurantOwner,
            (req: AuthenticatedRequest, res: Response) => controller.getOpeningHours(req, res)
        );

        this.router.delete(
            '/:id',
            authMiddleware.authenticateUser,
            authMiddleware.requireRestaurantOwner,
            (req: AuthenticatedRequest, res: Response) => controller.deleteOpeningHours(req, res)
        );

        this.router.put(
            '/:id',
            authMiddleware.authenticateUser,
            authMiddleware.requireRestaurantOwner,
            SanitizationMiddleware.allowedFields(['day', 'Working_hours', 'isClosed']),
            OpeningHoursValidators.updateOpeningHours(),
            ValidationMiddleware.handleValidationErrors(),
            (req: AuthenticatedRequest, res: Response) => controller.updateOpeningHours(req, res)
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}