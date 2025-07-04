import { Request, Response } from "express";
import { UploadProfileImageUseCase } from "@/application/use-cases/auth";
import { AuthToken } from '@/domain/entities/AuthToken';
import { setAuthCookies } from '@/shared/utils/cookieUtils';


export class uploadProfileImage {
    constructor(
        private uploadProfileImageUseCase: UploadProfileImageUseCase

    ) { }


    uploadProfileImage = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('AuthController: Uploading profile image...');
            console.log('Request user:', (req as any).user);
            console.log('Request file:', req.file);

            const user = (req as any).user; // From AuthMiddleware
            if (!user) {
                console.log('AuthController: No user found in request');
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized: User not authenticated'
                });
                return;
            }

            const request = {
                file: req.file,
                userId: user.userId,
            };

            const result = await this.uploadProfileImageUseCase.execute(request, user.userType);

            res.status(200).json({
                success: true,
                message: 'Profile image uploaded successfully',
                data: { profileImageUrl: result.profileImageUrl }
            });
        } catch (error) {
            console.error('AuthController: Upload failed:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Image upload failed'
            });
        }
    };
    private setAuthCookies(res: Response, authToken: AuthToken): void {
        setAuthCookies(res, authToken);
    }
}