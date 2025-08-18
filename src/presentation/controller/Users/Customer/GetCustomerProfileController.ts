import { Request, Response } from "express";
import { GetCustomerProfileUseCase } from "@/application/use-cases/auth/index";
export class getCustomerProfile {
    constructor(
        private getCustomerProfileUseCase: GetCustomerProfileUseCase
    ) { }

    getCustomerProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = (req as any).user;
            if (!user || user.userType !== 'customer') {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden: Only customers can access this endpoint'
                });
                return;
            }
            const result = await this.getCustomerProfileUseCase.execute(user.userId);
            if (!result.success) {
                res.status(404).json({
                    success: false,
                    message: result.message || 'Customer not found'
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: { userId: user.userId, ...result.data }
            });
        } catch (error) {
            console.error('Error getting customer profile:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error while fetching customer profile'
            });
        }
    }
}