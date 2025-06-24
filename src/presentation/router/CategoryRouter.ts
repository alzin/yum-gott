import { Router, Request, Response } from 'express';
import { CategoryController } from '../controller/Categories/CategoryController';
import { AuthenticatedRequest, SanitizationMiddleware, ValidationMiddleware } from '../middleware';
import { CategoryValidators } from '../validators/CategoryValidators';
import { DIContainer } from '@/infrastructure/di/DIContainer';

export class CategoryRouter {
    private router: Router;
    private diContainer: DIContainer;

    constructor() {
        this.diContainer = DIContainer.getInstance();
        this.router = Router();
        this.setupRoutes();
    }

    private setupRoutes(): void {
        const authMiddleware = this.diContainer.authMiddleware;
        const controller = new CategoryController(
            this.diContainer.resolve('createCategoryUseCase'),
            this.diContainer.resolve('getCategoriesByRestaurantUseCase')
        );

        this.router.post(
            '/',
            authMiddleware.authenticate,
            authMiddleware.requireRestaurantOwner,
            SanitizationMiddleware.allowedFields(['name']),
            CategoryValidators.createCategory(),
            ValidationMiddleware.handleValidationErrors(),
            (req: AuthenticatedRequest, res: Response) => controller.createCategory(req, res)
        );

        this.router.get(
            '/restaurant',
            authMiddleware.authenticate,
            authMiddleware.requireRestaurantOwner,
            (req: AuthenticatedRequest, res: Response) => controller.getCategoriesByRestaurant(req, res)
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}