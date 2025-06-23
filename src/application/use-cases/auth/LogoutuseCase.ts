import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { clearAuthCookies } from '@/shared/utils/cookieUtils';
import { Response } from 'express';

export interface LogoutRequest {
    refreshToken: string;
    userId: string;
    userType: 'customer' | 'restaurant_owner';
    accessToken: string;
}

export interface LogoutResponse {
    success: boolean;
    message: string;
} 

export class LogoutUseCase {
    constructor(private authRepository: IAuthRepository) { }

    async execute(request: LogoutRequest, res: Response): Promise<LogoutResponse> {
        try {
            await this.authRepository.invalidateRefreshToken(request.refreshToken);
            if (request.accessToken) {
                await this.authRepository.invalidateAccessToken(request.accessToken);
            }
            clearAuthCookies(res);

            return {
                success: true,
                message: 'Logout successful'
            };
        } catch (error) {
            throw new Error('Failed to logout: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }
}