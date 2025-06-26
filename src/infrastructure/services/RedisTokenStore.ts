import { ITokenStore } from '@/application/interface/ITokenStore';
import { createClient, RedisClientType } from 'redis';

export class RedisTokenStore implements ITokenStore {
    private client: RedisClientType;

    constructor() {
        this.client = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
        });
        this.client.connect().catch(console.error);
    }

    async setToken(jti: string, userId: string, expiresInSeconds?: number): Promise<void> {
        if (expiresInSeconds) {
            await this.client.set(jti, userId, { EX: expiresInSeconds });
        } else {
            await this.client.set(jti, userId);
        }
    }

    async hasToken(jti: string): Promise<boolean> {
        const exists = await this.client.exists(jti);
        return exists === 1;
    }

    async deleteToken(jti: string): Promise<void> {
        await this.client.del(jti);
    }
} 