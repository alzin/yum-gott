export interface OtpService {
    sendOtp(phone: string, code: string): Promise<void>;
}
