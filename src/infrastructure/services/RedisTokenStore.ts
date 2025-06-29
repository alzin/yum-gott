import { ITokenStore } from '@/application/interface/ITokenStore';
import { createClient, RedisClientType } from 'redis';

export class RedisTokenStore implements ITokenStore {
    private client: RedisClientType;

    constructor() {
        this.client = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
        });

        // Test connection to Redis
        this.client.connect()
            .then(() => {
                console.log('✅ Successfully connected to Redis at:', process.env.REDIS_URL || 'redis://localhost:6379');
            })
            .catch((error) => {
                console.error('❌ Failed to connect to Redis:', error.message);
                console.error('Please check your REDIS_URL configuration or ensure Redis is running.');
            });
    }

    async setToken(jti: string, userId: string, expiresInSeconds?: number): Promise<void> {
        console.log('🔐 Storing JTI in Redis:', jti, 'for user:', userId);
        if (expiresInSeconds) {
            await this.client.set(jti, userId, { EX: expiresInSeconds });
        } else {
            await this.client.set(jti, userId);
        }
        console.log('✅ JTI stored successfully in Redis');
    }

    async hasToken(jti: string): Promise<boolean> {
        console.log('🔍 Checking JTI in Redis:', jti);
        const exists = await this.client.exists(jti);
        console.log('📊 JTI exists in Redis:', exists === 1);
        return exists === 1;
    }

    async deleteToken(jti: string): Promise<void> {
        console.log('🗑️ Deleting JTI from Redis:', jti);
        await this.client.del(jti);
        console.log('✅ JTI deleted successfully from Redis');
    }
} 