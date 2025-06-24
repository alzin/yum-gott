import { Request, Response } from 'express';
import {
    CreateProductUseCase,
    GetProductUseCase,
    GetProductsByRestaurantUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase
} from '@/application/use-cases/product';
import { AuthenticatedRequest } from '@/presentation/middleware';
import { SizeOption } from '@/domain/entities/Product';

export class ProductController {
    constructor(
        private createProductUseCase: CreateProductUseCase,
        private getProductUseCase: GetProductUseCase,
        private getProductsByRestaurantUseCase: GetProductsByRestaurantUseCase,
        private updateProductUseCase: UpdateProductUseCase,
        private deleteProductUseCase: DeleteProductUseCase
    ) { }

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

            let sizeOptions: SizeOption[] | null = req.body.sizeOptions;
            if (typeof sizeOptions === 'string') {
                try {
                    sizeOptions = JSON.parse(sizeOptions);
                } catch (error) {
                    throw new Error('Invalid sizeOptions format: must be a valid JSON array');
                }
            }

            const request = {
                ...req.body,
                sizeOptions,
                image: req.file,
                restaurantOwnerId: user.userId
            };
            delete request.categoryId;
            delete request.category;

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

            const { id, restaurantOwnerId, createdAt, updatedAt, ...productWithoutId } = product;

            res.status(200).json({
                success: true,
                message: 'Get Product successfully',
                data: {
                    ...productWithoutId
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
            const productsWithCategoryName = products.map(product => {
                const { id, restaurantOwnerId, createdAt, updatedAt, ...rest } = product;
                return {
                    ...rest
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

            // Parse sizeOptions if it's a string (e.g., from multipart/form-data)
            let sizeOptions: SizeOption[] | null = req.body.sizeOptions;
            if (typeof sizeOptions === 'string') {
                try {
                    sizeOptions = JSON.parse(sizeOptions);
                } catch (error) {
                    throw new Error('Invalid sizeOptions format: must be a valid JSON array');
                }
            }

            const request = {
                ...req.body,
                productId: req.params.id,
                sizeOptions,
                image: req.file,
                restaurantOwnerId: user.userId,
            };
            delete request.categoryId;
            delete request.category;

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
                restaurantOwnerId: user.userId,
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