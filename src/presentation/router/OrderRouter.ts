import { Router, Request, Response } from 'express';
import { OrderController } from '../controller/Orders/OrderController';
import { DIContainer } from '@/infrastructure/di/DIContainer';

export class OrderRouter {
    private router: Router;
    private diContainer: DIContainer;

    constructor() {
        this.router = Router();
        this.diContainer = DIContainer.getInstance();
        this.setupRoutes();
    }

    private setupRoutes(): void {
        const authMiddleware = this.diContainer.authMiddleware;
        const controller = new OrderController();

        this.router.post(
            '/',
            authMiddleware.authenticateUser,
            authMiddleware.requireCustomer,
            (req: Request, res: Response) => controller.createOrder(req, res)
        );

        this.router.get(
            '/',
            authMiddleware.authenticateUser,
            authMiddleware.requireCustomer,
            (req: Request, res: Response) => controller.getOrdersForCustomer(req, res)
        );

        this.router.get(
            '/:orderId',
            authMiddleware.authenticateUser,
            authMiddleware.requireCustomer,
            (req: Request, res: Response) => controller.getOrderById(req, res)
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}
