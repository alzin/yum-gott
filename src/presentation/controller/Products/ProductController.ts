import { Request, Response } from 'express';
import {
    CreateProductUseCase,
    GetProductUseCase,
    GetProductsByRestaurantUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase
} from '@/application/use-cases/product';
import { GetProductOptionsUseCase } from '@/application/use-cases/product-option';
import { AuthenticatedRequest } from '@/presentation/middleware';
import { SizeOption } from '@/domain/entities/Product';

export class ProductController {
    constructor(
        private createProductUseCase: CreateProductUseCase,
        private getProductUseCase: GetProductUseCase,
        private getProductsByRestaurantUseCase: GetProductsByRestaurantUseCase,
        private updateProductUseCase: UpdateProductUseCase,
        private deleteProductUseCase: DeleteProductUseCase,
        private getProductOptionsUseCase: GetProductOptionsUseCase
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

            let options = req.body.options;
            if (typeof options === 'string') {
                try {
                    options = JSON.parse(options);
                } catch (error) {
                    throw new Error('Invalid options format: must be a valid JSON array');
                }
            }

            const request = {
                ...req.body,
                sizeOptions,
                options,
                image: req.file,
                restaurantOwnerId: user.userId
            };
            // delete request.categoryId;
            // delete request.category;

            const product = await this.createProductUseCase.execute(request, user.userId);
            if (!product.id) throw new Error('Product ID is missing after creation');
            const productOptions = await this.getProductOptionsUseCase.execute(product.id as string, user.userId);
            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: {
                    ...product,
                    options: productOptions
                }
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
            const options = await this.getProductOptionsUseCase.execute(req.params.id, product.restaurantOwnerId);
            const { restaurantOwnerId, createdAt, updatedAt, ...productWithoutId } = product;
            res.status(200).json({
                success: true,
                message: 'Get Product successfully',
                data: {
                    ...productWithoutId,
                    options
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
            const productsWithOptions = await Promise.all(products.map(async product => {
                const { restaurantOwnerId, createdAt, updatedAt, ...rest } = product;
                const options = product.id ? await this.getProductOptionsUseCase.execute(product.id, user.userId) : [];
                return {
                    ...rest,
                    options
                };
            }));

            res.status(200).json({
                success: true,
                message: 'Get All Products successfully',
                data: productsWithOptions,
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

            // Parse productOption or options if it's a string (e.g., from multipart/form-data)
            let productOption = req.body.productOption || req.body.options;
            if (typeof productOption === 'string') {
                try {
                    productOption = JSON.parse(productOption);
                } catch (error) {
                    throw new Error('Invalid productOption/options format: must be a valid JSON array');
                }
            }

            const request = {
                ...req.body,
                productId: req.params.id,
                sizeOptions,
                productOption,
                image: req.file,
                restaurantOwnerId: user.userId,
            };
            delete request.categoryId;
            delete request.category;

            const product = await this.updateProductUseCase.execute(request);
            const productOptions = await this.getProductOptionsUseCase.execute(req.params.id, user.userId);

            res.status(200).json({
                success: true,
                message: 'Product updated successfully',
                data: {
                    ...product,
                    options: productOptions
                }
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