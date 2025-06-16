import { Request, Response } from "express";
import { GetRestaurantOwnerProfileUseCase } from "@/application/use-cases/auth";
export class getRestaurantOwnerProfile {
    constructor(
        private getRestaurantOwnerProfileUseCase: GetRestaurantOwnerProfileUseCase
    ) { }

    getRestaurantOwnerProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = (req as any).user; // From AuthMiddleware
            if (!user || user.userType !== 'restaurant_owner') {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden: Only restaurant owners can access this endpoint'
                });
                return;
            }

            const result = await this.getRestaurantOwnerProfileUseCase.execute(user.userId);

            if (!result.success) {
                res.status(404).json({
                    success: false,
                    message: result.message || 'Restaurant owner not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: result.data
            });
        } catch (error) {
            console.error('Error getting restaurant owner profile:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error while fetching restaurant owner profile'
            });
        }
    };


}