import { Request, Response } from 'express';
import { RestaurantOwnerLoginUseCase } from '@/application/use-cases/auth';
import { AuthToken } from '@/domain/entities/AuthToken';
import { setAuthCookies } from '@/shared/utils/cookieUtils';

export class restaurantOwnerLogin {
    constructor(
        private restaurantOwnerLoginUseCase: RestaurantOwnerLoginUseCase
    ) { }

    restaurantOwnerLogin = async (req: Request, res: Response): Promise<void> => {
        try {
            const result = await this.restaurantOwnerLoginUseCase.execute(req.body);
            this.setAuthCookies(res, result.authToken);
            res.status(200).json({
                success: true,
                message: 'Restaurant owner login successful'
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                message: error instanceof Error ? error.message : 'Login failed'
            });
        }
    };

    private setAuthCookies(res: Response, authToken: AuthToken): void {
        setAuthCookies(res, authToken);
    }

}