import { Server as HttpServer } from 'http';
type IOServer = any;
import { IRealtimeNotifier } from '@/application/interface/IRealtimeNotifier';
import { JWTpayload } from '@/domain/entities/AuthToken';
import { DIContainer } from '@/infrastructure/di/DIContainer';

export class SocketGateway implements IRealtimeNotifier {
    private io?: IOServer;

    attach(server: HttpServer): void {
        const { Server } = require('socket.io') as { Server: new (...args: any[]) => IOServer };
        this.io = new Server(server, {
            cors: {
                origin: true,
                credentials: true,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
                allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
            }
        });

        const authRepository = DIContainer.getInstance().authRepository;

        this.io.use(async (socket: any, next: any) => {
            try {
                const token = socket.handshake.auth?.token || socket.handshake.headers['authorization']?.toString().replace('Bearer ', '');
                if (!token) {
                    return next(new Error('Unauthorized'));
                }
                const payload: JWTpayload = await authRepository.verifyToken(token);
                (socket as any).user = payload;
                next();
            } catch (err) {
                next(new Error('Unauthorized'));
            }
        });

        this.io.on('connection', (socket: any) => {
            const user: JWTpayload | undefined = (socket as any).user;
            if (user?.userType === 'restaurant_owner') {
                const room = this.getOwnerRoom(user.userId);
                socket.join(room);
            } else if (user?.userType === 'customer') {
                const room = this.getCustomerRoom(user.userId);
                socket.join(room);
            }

            socket.on('subscribe:owner', (ownerId: string) => {
                const userPayload: JWTpayload | undefined = (socket as any).user;
                if (userPayload?.userType === 'restaurant_owner' && userPayload.userId === ownerId) {
                    socket.join(this.getOwnerRoom(ownerId));
                }
            });
        });
    }

    private getOwnerRoom(ownerId: string): string {
        return `owner:${ownerId}`;
    }

    async notifyOwnersOrderCreated(restaurantOwnerIds: string[], order: any): Promise<void> {
        if (!this.io) return;
        for (const ownerId of restaurantOwnerIds) {
            try {
                console.log('[realtime] Emitting order:created', {
                    ownerId,
                    orderId: order?.id,
                    customerId: order?.customerId,
                    at: new Date().toISOString()
                });
            } catch (_) { }
            this.io.to(this.getOwnerRoom(ownerId)).emit('order:created', {
                orderId: order.id,
                customerId: order.customerId,
                status: order.status,
                items: order.items
            });
        }
    }
    async notifyCustomerOrderStatusChanged(customerId: string, order: any): Promise<void> {
        if (!this.io) return;
        try {
            console.log('[realtime] Emitting order:status_changed', {
                customerId,
                orderId: order?.id,
                status: order?.status,
                at: new Date().toISOString()
            });
        } catch (_) { }
        this.io.to(this.getCustomerRoom(customerId)).emit('order:status_changed', {
            orderId: order.id,
            status: order.status
        });
    }
    private getCustomerRoom(customerId: string): string {
        return `customer:${customerId}`;
    }
}


