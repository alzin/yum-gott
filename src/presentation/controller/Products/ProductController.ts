import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/index';
import { CreateProductUseCase, GetProductUseCase, GetProductsByRestaurantUseCase, UpdateProductUseCase, DeleteProductUseCase } from '@/application/use-cases/product';
import { DIContainer } from '@/infrastructure/di/DIContainer';

export class ProductController {
    constructor(
        private createProductUseCase: CreateProductUseCase,
        private getProductUseCase: GetProductUseCase,
        private getProductsByRestaurantUseCase: GetProductsByRestaurantUseCase,
        private updateProductUseCase: UpdateProductUseCase,
        private deleteProductUseCase: DeleteProductUseCase
    ) { }

    async createProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
        console.log('BODY:', req.body);
        try {
            const user = req.user;
            if (!user || user.userType !== 'restaurant_owner') {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden: Only restaurant owners can create products',
                });
                return;
            }

            const request = {
                ...req.body,
                image: req.file,
                restaurantOwnerId: user.userId
            };

            const product = await this.createProductUseCase.execute(request, user.userId);
            res.status(201).json({
                success: true,
                message: 'Product created successfully',
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to create product',
            });
        }
    }
    async getProduct(req: Request, res: Response): Promise<void> {
        try {
            const product = await this.getProductUseCase.execute(req.params.id);

            if (!product) throw new Error('Product not found');

            const diContainer = DIContainer.getInstance();
            const categoryRepository = diContainer.resolve('ICategoryRepository') as import('@/infrastructure/repositories/CategoryRepository').CategoryRepository;
            const category = await categoryRepository.findById(product.categoryId);

            const { id, restaurantOwnerId, createdAt, updatedAt,categoryId, ...productWithoutId } = product;

            res.status(200).json({
                success: true,
                message: 'Get Product successfully',
                data: {
                    ...productWithoutId,
                    categoryName: category ? category.name : null
                },
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error instanceof Error ? error.message : 'Product not found',
            });
        }
    }


    async getProductsByRestaurant(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user || user.userType !== 'restaurant_owner') {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden: Only restaurant owners can view their products',
                });
                return;
            }

            const products = await this.getProductsByRestaurantUseCase.execute(user.userId);
            const diContainer = DIContainer.getInstance();
            const categoryRepository = diContainer.resolve('ICategoryRepository') as import('@/infrastructure/repositories/CategoryRepository').CategoryRepository;

            const categories = await categoryRepository.findByRestaurantOwnerId(user.userId);
            const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));

            const productsWithCategoryName = products.map(product => {
                const { id, restaurantOwnerId, createdAt, updatedAt,categoryId, ...rest } = product;
                return {
                    ...rest,
                    categoryName: categoryMap.get(product.categoryId) || null
                };
            });

            res.status(200).json({
                success: true,
                message: 'Get All Products successfully',
                data: productsWithCategoryName,
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch products',
            });
        }
    }

    async updateProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user || user.userType !== 'restaurant_owner') {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden: Only restaurant owners can update products',
                });
                return;
            }

            const request = {
                ...req.body,
                productId: req.params.id,
                image: req.file,
                restaurantOwnerId: user.userId, // Derived from token
            };

            const product = await this.updateProductUseCase.execute(request);
            res.status(200).json({
                success: true,
                message: 'Product updated successfully',
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to update product',
            });
        }
    }

    async deleteProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user || user.userType !== 'restaurant_owner') {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden: Only restaurant owners can delete products',
                });
                return;
            }

            const request = {
                productId: req.params.id,
                restaurantOwnerId: user.userId, // Derived from token
            };

            await this.deleteProductUseCase.execute(request);
            res.status(200).json({
                success: true,
                message: 'Product deleted successfully',
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to delete product',
            });
        }
    }
}