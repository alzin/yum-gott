import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { AuthToken } from '@/domain/entities/AuthToken';

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    authToken: AuthToken;
}

// This use case now uses Redis-based refresh token rotation via AuthRepository
export class RefreshTokenUseCase {
    constructor(private authRepository: IAuthRepository) { }

    async execute(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
        const { refreshToken } = request;
        const newTokens = await this.authRepository.rotateRefreshToken(refreshToken);
        return { authToken: newTokens };
    }
}