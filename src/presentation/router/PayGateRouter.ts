import { Router } from 'express';
import { DIContainer } from '@/infrastructure/di/DIContainer';
import { PayGateController } from '@/presentation/controller/PayGateController';

export class PayGateRouter {
    private router: Router;
    private di: DIContainer;

    constructor() {
        this.di = DIContainer.getInstance();
        this.router = Router();
        this.setupRoutes();
    }

    private setupRoutes(): void {
        const controller = new PayGateController(
            this.di.resolve('getActivePayGatesUseCase')
        );

        // Public endpoint: list active pay gates as array
        this.router.get('/', (req, res) => controller.listActive(req, res));
    }

    public getRouter(): Router {
        return this.router;
    }
}


