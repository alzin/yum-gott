import { Request, Response } from 'express';
import { ChangePasswordUseCase } from '@/application/use-cases/auth/ChangePasswordUseCase';
import { AuthenticatedRequest } from '@/presentation/middleware/AuthMiddleware';

export class ChangePasswordController {
    constructor(private changePasswordUseCase: ChangePasswordUseCase) { }

    changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            if (user.userType === 'guest') {
                res.status(403).json({ success: false, message: 'Guests cannot change password' });
                return;
            }

            const { oldPassword, newPassword } = req.body as { oldPassword: string; newPassword: string };

            const result = await this.changePasswordUseCase.execute(
                { userId: user.userId, oldPassword, newPassword },
                user.userType
            );

            res.status(200).json({ success: result.success, message: 'Password changed successfully' });
        } catch (error) {
            res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Failed to change password' });
        }
    };
}
