import { Request, Response } from 'express';
import { DIContainer } from '@/infrastructure/di/DIContainer';

export class verifyEmail {
    verifyEmail = async (req: Request, res: Response): Promise<void> => {
        try {
            const { token } = req.query;
            if (!token || typeof token !== 'string') {
                res.status(400).json({
                    success: false,
                    message: 'Verification token is required'
                });
                return;
            }

            const diContainer = DIContainer.getInstance();
            const customerRepo = diContainer.customerRepository;
            const restaurantOwnerRepo = diContainer.restaurantOwnerRepository;

            try {
                await customerRepo.verifyEmail(token);
                res.status(200).json({
                    success: true,
                    message: 'Email verified successfully. You can now login.'
                });
            } catch (error) {
                await restaurantOwnerRepo.verifyEmail(token);
                res.status(200).json({
                    success: true,
                    message: 'Email verified successfully. You can now login.'
                });
            }
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Verification failed'
            });
        }
    };
}