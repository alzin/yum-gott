import { OtpService } from '../../domain/services/OtpService';
import { UniClient } from 'uni-sdk';

export class UnimtxSmsService implements OtpService {
    private client: any;

    constructor() {
        const accessKeyId = process.env.UNIMTX_ACCESS_KEY_ID || '';
        const accessKeySecret = process.env.UNIMTX_ACCESS_KEY_SECRET || '';
        
        if (!accessKeyId || !accessKeySecret) {
            console.error('[UnimtxSmsService] Missing ACCESS_KEY_ID or ACCESS_KEY_SECRET. Please check your environment variables.');
            throw new Error('Unimtx ACCESS_KEY_ID and ACCESS_KEY_SECRET must be provided');
        }
        this.client = new UniClient({
            accessKeyId,
            accessKeySecret,
            
        });
    }

    async sendOtp(phone: string, code: string): Promise<void> {
        console.log(`[UnimtxSmsService] Sending OTP to ${phone} with code ${code}`);
        try {
            const ret = await this.client.messages.send({
                to: phone,
                signature: 'yumGott', 
                templateId: '0fceb992',
                templateData: {
                    code: code
                }
            });
            console.log('[UnimtxSmsService] Unimtx SDK response:', ret);
            if (!ret || ret.code !== '0') {
                console.error('[UnimtxSmsService] Unimtx SDK error:', ret);
                throw new Error(`Unimtx SDK error: ${ret?.message || 'Unknown error'}`);
            }
        } catch (error: any) {
            console.error(`[UnimtxSmsService] Failed to send OTP to ${phone}:`, error.response?.data || error.message);
            throw error;
        }
    }
}
