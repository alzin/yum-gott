import { randomUUID } from 'crypto';
import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { AuthToken, JWTpayload } from '@/domain/entities/AuthToken';

export interface GuestLoginRequest {
    deviceId?: string;
}

export interface GuestLoginResponse {
    authToken: AuthToken;
}

export class GuestLoginUseCase {
    constructor(private authRepository: IAuthRepository) { }

    async execute(request: GuestLoginRequest = {}): Promise<GuestLoginResponse> {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const guestId = request.deviceId && uuidRegex.test(request.deviceId)
            ? request.deviceId
            : randomUUID();

        const payload: JWTpayload = {
            userId: guestId,
            userType: 'guest',
        } as JWTpayload;

        const authToken = await this.authRepository.generateToken(payload);
        return { authToken };
    }
}


