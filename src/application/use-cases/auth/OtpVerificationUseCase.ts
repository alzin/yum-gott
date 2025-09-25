import { OtpService } from '../../../domain/services/OtpService';
import { OtpVerificationRepository } from '../../../domain/services/OtpVerificationRepository';

export class OtpVerificationUseCase {
    constructor(
        private otpService: OtpService,
        private otpRepo: OtpVerificationRepository
    ) { }

    async requestOtp(phone: string) {
        const code = this.generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min
        await this.otpRepo.saveOtp(phone, code, expiresAt);
        await this.otpService.sendOtp(phone, code);
        return { code, expiresAt };
    }

    async verifyOtp(phone: string, code: string) {
        const record = await this.otpRepo.getOtp(phone);
        if (!record || record.code !== code || record.expiresAt < new Date()) {
            throw new Error('Invalid or expired OTP');
        }
        await this.otpRepo.deleteOtp(phone);
        return true;
    }

    private generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
}
