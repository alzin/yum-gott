import { Request, Response } from 'express';
import { AuthToken } from '@/domain/entities/AuthToken';
import { setAuthCookies } from '@/shared/utils/cookieUtils';
import { CustomerLoginUseCase } from '@/application/use-cases/auth';
export class customerLogin {
    constructor(
        private customerLoginUseCase: CustomerLoginUseCase
    ) { }
    customerLogin = async (req: Request, res: Response): Promise<void> => {
        try {
            const result = await this.customerLoginUseCase.execute(req.body);
            this.setAuthCookies(res, result.authToken);
            res.status(200).json({
                success: true,
                message: 'Customer login successful'
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