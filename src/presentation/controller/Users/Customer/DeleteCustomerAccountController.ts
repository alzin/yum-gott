import { Request, Response } from 'express';
import { DeleteCustomerAccountUseCase } from "@/application/use-cases/auth";
import { AuthenticatedRequest } from '../../../middleware/AuthMiddleware';

export class DeleteCustomerAccountController {
    constructor(
        private deleteCustomerAccountUseCase: DeleteCustomerAccountUseCase,
    ) { }

    deleteCustomerAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const customerId = req.user?.userId;

            if (!customerId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            await this.deleteCustomerAccountUseCase.execute(customerId);

            res.status(200).json({
                success: true,
                message: 'Customer account deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    };
} 