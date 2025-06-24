import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/presentation/middleware';
import { CreateProductOptionUseCase, CreateProductOptionValueUseCase, GetProductOptionsUseCase, DeleteProductOptionUseCase, DeleteProductOptionValueUseCase } from '@/application/use-cases/product-option';

export class ProductOptionController {
    constructor(
        private createProductOptionUseCase: CreateProductOptionUseCase,
        private createProductOptionValueUseCase: CreateProductOptionValueUseCase,
        private getProductOptionsUseCase: GetProductOptionsUseCase,
        private deleteProductOptionUseCase: DeleteProductOptionUseCase,
        private deleteProductOptionValueUseCase: DeleteProductOptionValueUseCase
    ) { }

    async createProductOption(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user || user.userType !== 'restaurant_owner') {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden: Only restaurant owners can create product options'
                });
                return;
            }

            const request = {
                productId: req.params.productId,
                name: req.body.name
            };

            const option = await this.createProductOptionUseCase.execute(request, user.userId);
            res.status(201).json({
                success: true,
                message: 'Product option created successfully',
                data: option
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to create product option'
            });
        }
    }

    async createProductOptionValue(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user || user.userType !== 'restaurant_owner') {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden: Only restaurant owners can create product option values'
                });
                return;
            }

            const request = {
                optionId: req.params.optionId,
                name: req.body.name,
                additionalPrice: req.body.additionalPrice
            };

            const value = await this.createProductOptionValueUseCase.execute(request, user.userId);
            res.status(201).json({
                success: true,
                message: 'Product option value created successfully',
                data: value
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to create product option value'
            });
        }
    }

    async getProductOptions(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user || user.userType !== 'restaurant_owner') {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden: Only restaurant owners can view product options'
                });
                return;
            }

            const options = await this.getProductOptionsUseCase.execute(req.params.productId, user.userId);
            const filteredOptions = options.map(option => ({
                name: option.name,
                values: option.values.map(value => ({
                    name: value.name,
                    additionalPrice: value.additionalPrice
                }))
            }));
            res.status(200).json({
                success: true,
                message: 'Product options retrieved successfully',
                data: filteredOptions
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve product options'
            });
        }
    }

    async deleteProductOption(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user || user.userType !== 'restaurant_owner') {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden: Only restaurant owners can delete product options'
                });
                return;
            }

            const request = { optionId: req.params.optionId };
            await this.deleteProductOptionUseCase.execute(request, user.userId);
            res.status(200).json({
                success: true,
                message: 'Product option deleted successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to delete product option'
            });
        }
    }

    async deleteProductOptionValue(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user || user.userType !== 'restaurant_owner') {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden: Only restaurant owners can delete product option values'
                });
                return;
            }

            const request = { valueId: req.params.valueId };
            await this.deleteProductOptionValueUseCase.execute(request, user.userId);
            res.status(200).json({
                success: true,
                message: 'Product option value deleted successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to delete product option value'
            });
        }
    }
}