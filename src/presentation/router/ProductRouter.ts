import { Router, Request, Response } from 'express';
import { ProductController, ProductOptionController } from '../controller/Products/index';
import { AuthenticatedRequest, SanitizationMiddleware, ValidationMiddleware } from '../middleware';
import { ProductValidators } from '../validators/ProductValidators';
import { ProductOptionValidators } from '../validators/ProductOptionValidators';
import { DIContainer } from '@/infrastructure/di/DIContainer';
import multer from 'multer';

export class ProductRouter {
    private router: Router;
    private upload: multer.Multer;
    private diContainer: DIContainer;

    constructor() {
        const storage = multer.memoryStorage();
        this.upload = multer({
            storage: storage,
            limits: { fileSize: 5 * 1024 * 1024 },
            fileFilter: (req, file, cb) => {
                const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
                if (!allowedTypes.includes(file.mimetype)) {
                    return cb(new Error('Only JPEG, PNG, and GIF images are allowed'));
                }
                cb(null, true);
            }
        });
        this.diContainer = DIContainer.getInstance();
        this.router = Router();
        this.setupRoutes();
    }

    private setupRoutes(): void {
        const authMiddleware = this.diContainer.authMiddleware;
        const controller = new ProductController(
            this.diContainer.resolve('createProductUseCase'),
            this.diContainer.resolve('getProductUseCase'),
            this.diContainer.resolve('getProductsByRestaurantUseCase'),
            this.diContainer.resolve('updateProductUseCase'),
            this.diContainer.resolve('deleteProductUseCase')

        );
        const productOptionController = new ProductOptionController(
            this.diContainer.resolve('createProductOptionUseCase'),
            this.diContainer.resolve('createProductOptionValueUseCase'),
            this.diContainer.resolve('getProductOptionsUseCase'),
            this.diContainer.resolve('deleteProductOptionUseCase'),
            this.diContainer.resolve('deleteProductOptionValueUseCase')
        );

        this.router.post(
            '/',
            authMiddleware.authenticate,
            authMiddleware.requireRestaurantOwner,
            this.upload.single('image'),
            SanitizationMiddleware.allowedFields([
                'categoryId',
                'productName',
                'description',
                'price',
                'discount',
                'addSize',
                'image'
            ]),
            ProductValidators.createProduct(),
            ValidationMiddleware.handleValidationErrors(),
            (req: AuthenticatedRequest, res: Response) => controller.createProduct(req, res)
        );

        this.router.get(
            '/restaurant',
            authMiddleware.authenticate,
            authMiddleware.requireRestaurantOwner,
            (req: AuthenticatedRequest, res: Response) => controller.getProductsByRestaurant(req, res)
        );

        this.router.get(
            '/:id',
            ProductValidators.productId(),
            ValidationMiddleware.handleValidationErrors(),
            (req: Request, res: Response) => controller.getProduct(req, res)
        );

        this.router.put(
            '/:id',
            authMiddleware.authenticate,
            authMiddleware.requireRestaurantOwner,
            this.upload.single('image'),
            SanitizationMiddleware.allowedFields([
                'categoryId',
                'productName',
                'description',
                'price',
                'discount',
                'addSize',
                'image'
            ]),
            ProductValidators.updateProduct(),
            ProductValidators.productId(),
            ValidationMiddleware.handleValidationErrors(),
            (req: AuthenticatedRequest, res: Response) => controller.updateProduct(req, res)
        );

        this.router.delete(
            '/:id',
            authMiddleware.authenticate,
            authMiddleware.requireRestaurantOwner,
            ProductValidators.productId(),
            ValidationMiddleware.handleValidationErrors(),
            (req: AuthenticatedRequest, res: Response) => controller.deleteProduct(req, res)
        );



        this.router.post(
            '/:productId/options',
            authMiddleware.authenticate,
            authMiddleware.requireRestaurantOwner,
            SanitizationMiddleware.allowedFields(['name']),
            ProductValidators.productIdParam(),
            ProductOptionValidators.createProductOption(),
            ValidationMiddleware.handleValidationErrors(),
            (req: AuthenticatedRequest, res: Response) => productOptionController.createProductOption(req, res)
        );

        this.router.post(
            '/options/:optionId/values',
            authMiddleware.authenticate,
            authMiddleware.requireRestaurantOwner,
            SanitizationMiddleware.allowedFields(['name', 'additionalPrice']),
            ProductOptionValidators.createProductOptionValue(),
            ValidationMiddleware.handleValidationErrors(),
            (req: AuthenticatedRequest, res: Response) => productOptionController.createProductOptionValue(req, res)
        );

        this.router.get(
            '/:productId/options',
            authMiddleware.authenticate,
            authMiddleware.requireRestaurantOwner,
            ProductValidators.productIdParam(),
            ValidationMiddleware.handleValidationErrors(),
            (req: AuthenticatedRequest, res: Response) => productOptionController.getProductOptions(req, res)
        );

        this.router.delete(
            '/options/:optionId',
            authMiddleware.authenticate,
            authMiddleware.requireRestaurantOwner,
            ProductOptionValidators.optionId(),
            ValidationMiddleware.handleValidationErrors(),
            (req: AuthenticatedRequest, res: Response) => productOptionController.deleteProductOption(req, res)
        );

        this.router.delete(
            '/option-values/:valueId',
            authMiddleware.authenticate,
            authMiddleware.requireRestaurantOwner,
            ProductOptionValidators.valueId(),
            ValidationMiddleware.handleValidationErrors(),
            (req: AuthenticatedRequest, res: Response) => productOptionController.deleteProductOptionValue(req, res)
        );
    }



    public getRouter(): Router {
        return this.router;
    }
}