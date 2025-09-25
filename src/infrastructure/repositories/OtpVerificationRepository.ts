import { OtpVerificationRepository } from '../../domain/services/OtpVerificationRepository';

interface OtpRecord {
    code: string;
    expiresAt: Date;
}

export class InMemoryOtpVerificationRepository implements OtpVerificationRepository {
    private store: Map<string, OtpRecord> = new Map();

    async saveOtp(phone: string, code: string, expiresAt: Date): Promise<void> {
        this.store.set(phone, { code, expiresAt });
    }

    async getOtp(phone: string): Promise<OtpRecord | null> {
        const record = this.store.get(phone);
        if (!record) return null;
        return record;
    }

    async deleteOtp(phone: string): Promise<void> {
        this.store.delete(phone);
    }
}
