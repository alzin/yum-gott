import { Order } from '@/domain/entities/Order';

export interface IRealtimeNotifier {
    attach?(server: any): void;
    notifyOwnersOrderCreated(restaurantOwnerIds: string[], order: Order): Promise<void>;
    notifyCustomerOrderStatusChanged(customerId: string, order: Order): Promise<void>;
}

