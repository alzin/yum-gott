import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { AuthToken } from '@/domain/entities/AuthToken';

export interface RefreshTokenRequest {
    refreshToken: string;
    accessToken: string;
}

export interface RefreshTokenResponse {
    authToken: AuthToken;
}

export class RefreshTokenUseCase {
    constructor(private authRepository: IAuthRepository) { }

    async execute(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
        const { refreshToken, accessToken } = request;

        const newTokens = await this.authRepository.refreshToken(refreshToken, accessToken);

        return { authToken: newTokens };
    }
}