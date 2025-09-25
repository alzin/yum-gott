export interface OtpVerificationRepository {
    saveOtp(phone: string, code: string, expiresAt: Date): Promise<void>;
    getOtp(phone: string): Promise<{ code: string, expiresAt: Date } | null>;
    deleteOtp(phone: string): Promise<void>;
}
