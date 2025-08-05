import { Request, Response } from 'express';
import { DeleteRestaurantOwnerAccountUseCase } from "@/application/use-cases/auth";
import { AuthenticatedRequest } from '../../../middleware/AuthMiddleware';

export class DeleteRestaurantOwnerAccountController {
    constructor(
        private deleteRestaurantOwnerAccountUseCase: DeleteRestaurantOwnerAccountUseCase,
    ) { }

    deleteRestaurantOwnerAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const restaurantOwnerId = req.user?.userId;

            if (!restaurantOwnerId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            await this.deleteRestaurantOwnerAccountUseCase.execute(restaurantOwnerId);

            res.status(200).json({
                success: true,
                message: 'Restaurant owner account deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    };
} 