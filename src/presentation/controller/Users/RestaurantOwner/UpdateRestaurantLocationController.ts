import { Request, Response } from "express";
import { UpdateRestaurantLocationUseCase } from "@/application/use-cases/auth";
import { AuthToken } from "@/domain/entities/AuthToken";
import { setAuthCookies } from "@/shared/utils/cookieUtils";
export class updateRestaurantLocation {
    constructor(
        private updateRestaurantLocationUseCase: UpdateRestaurantLocationUseCase
    ) { }
    updateRestaurantLocation = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = (req as any).user; // From AuthMiddleware
            if (!user || user.userType !== 'restaurant_owner') {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden: Only restaurant owners can update location'
                });
                return;
            }

            const request = {
                userId: user.userId,
                address: req.body.address,
                latitude: req.body.latitude,
                longitude: req.body.longitude
            };

            const result = await this.updateRestaurantLocationUseCase.execute(request);

            res.status(200).json({
                success: true,
                message: 'Restaurant location updated successfully',
                data: {
                    address: result.restaurantOwner.address,
                    latitude: result.restaurantOwner.latitude,
                    longitude: result.restaurantOwner.longitude
                }
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Location update failed'
            });
        }
    };
    private setAuthCookies(res: Response, authToken: AuthToken): void {
        setAuthCookies(res, authToken);
    }
}