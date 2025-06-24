import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/presentation/middleware';
import { CreateCategoryUseCase, GetCategoriesByRestaurantUseCase } from '@/application/use-cases/category';

export class CategoryController {
    constructor(
        private createCategoryUseCase: CreateCategoryUseCase,
        private getCategoriesByRestaurantUseCase: GetCategoriesByRestaurantUseCase
    ) {}

    async createCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user || user.userType !== 'restaurant_owner') {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden: Only restaurant owners can create categories',
                });
                return;
            }

            const request = { name: req.body.name };
            const category = await this.createCategoryUseCase.execute(request, user.userId);
            
            res.status(201).json({
                success: true,
                message: 'Category created successfully',
                data: { name: category.name }
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to create category',
            });
        }
    }

    async getCategoriesByRestaurant(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user || user.userType !== 'restaurant_owner') {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden: Only restaurant owners can view their categories',
                });
                return;
            }

            const categories = await this.getCategoriesByRestaurantUseCase.execute(user.userId);
            const filteredCategories = categories.map(({  name }) => ({  name }));

            res.status(200).json({
                success: true,
                message: 'Categories retrieved successfully',
                data: filteredCategories
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch categories',
            });
        }
    }
}