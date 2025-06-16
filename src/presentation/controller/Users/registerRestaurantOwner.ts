import { Request, Response } from 'express';
import { AuthToken } from '@/domain/entities/AuthToken';
import { setAuthCookies } from '@/shared/utils/cookieUtils';
import { RegisterRestaurantOwnerUseCase } from '@/application/use-cases/auth';
export class registerRestaurantOwner {
    constructor(
        private registerRestaurantOwnerUseCase: RegisterRestaurantOwnerUseCase,

    ) { }


    registerRestaurantOwner = async (req: Request, res: Response): Promise<void> => {
        try {
            const tokens = await this.registerRestaurantOwnerUseCase.execute(req.body);
            this.setAuthCookies(res, tokens);
            res.status(201).json({
                success: true,
                message: 'Restaurant owner registration successful. Please check your email for verification link.',

            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Registration failed'
            });
        }
    };
    private setAuthCookies(res: Response, authToken: AuthToken): void {
        setAuthCookies(res, authToken);
    }
}