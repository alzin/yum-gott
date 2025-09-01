import { Request, Response } from 'express';
import { UpdateCustomerProfileUseCase } from '@/application/use-cases/auth';

export class EditCustomerProfileController {
    constructor(private updateCustomerProfileUseCase: UpdateCustomerProfileUseCase) { }

    editProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = (req as any).user;
            if (!user || user.userType !== 'customer') {
                res.status(403).json({ success: false, message: 'Forbidden: Only customers can edit their profile' });
                return;
            }
            const updated = await this.updateCustomerProfileUseCase.execute(user.userId, req.body);
            res.status(200).json({ success: true, data: updated });
        } catch (error) {
            res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Profile update failed' });
        }
    }
}
