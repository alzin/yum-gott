import { Request, Response } from 'express';
import { RegisterCustomerUseCase } from "@/application/use-cases/auth";
import { setAuthCookies } from '@/shared/utils/cookieUtils';
import { AuthToken } from '@/domain/entities/AuthToken';

export class registerCustomer {
    constructor(
        private registerCustomerUseCase: RegisterCustomerUseCase,
    ) { }

    registerCustomer = async (req: Request, res: Response): Promise<void> => {
        try {
            const tokens = await this.registerCustomerUseCase.execute(req.body);
            this.setAuthCookies(res, tokens);
            res.status(201).json({
                success: true,
                message: 'Registration successful. Please check your email for verification link.'
                // message: 'Registration successful.'
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