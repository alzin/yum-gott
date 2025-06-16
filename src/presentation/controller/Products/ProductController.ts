import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/index';
import { CreateProductUseCase, GetProductUseCase, GetProductsByRestaurantUseCase, UpdateProductUseCase, DeleteProductUseCase } from '@/application/use-cases/product';

export class ProductController {
    constructor(
        private createProductUseCase: CreateProductUseCase,
        private getProductUseCase: GetProductUseCase,
        private getProductsByRestaurantUseCase: GetProductsByRestaurantUseCase,
        private updateProductUseCase: UpdateProductUseCase,
        private deleteProductUseCase: DeleteProductUseCase
    ) {}

    async createProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
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
                restaurantOwnerId: user.userId, // Derived from token
            };

            const product = await this.createProductUseCase.execute(request);
            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: product,
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
            res.status(200).json({
                success: true,
                data: product,
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
            res.status(200).json({
                success: true,
                data: products,
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
                data: product,
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