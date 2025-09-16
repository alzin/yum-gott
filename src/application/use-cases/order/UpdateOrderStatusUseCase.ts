import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { Order } from '@/domain/entities/Order';

type OrderStatus = Order['status'];

export class UpdateOrderStatusUseCase {
    constructor(private orderRepository: IOrderRepository) { }

    private isTransitionAllowed(current: OrderStatus, next: OrderStatus): boolean {
        const allowed: Record<OrderStatus, OrderStatus[]> = {
            pending: ['paid', 'cancelled'],
            paid: ['shipped', 'cancelled'],
            shipped: ['completed'],
            completed: [],
            cancelled: []
        };
        return allowed[current].includes(next);
    }

    private extractOwnerIds(order: Order): string[] {
        return Array.from(new Set(order.items.map(i => i.product.restaurantOwnerId)));
    }

    async execute(params: { orderId: string; ownerId: string; nextStatus: OrderStatus; }): Promise<Order> {
        const { orderId, ownerId, nextStatus } = params;

        const order = await this.orderRepository.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        const ownerIds = this.extractOwnerIds(order);
        if (!ownerIds.includes(ownerId)) {
            throw new Error('Forbidden: You do not own this order');
        }

        if (order.status === nextStatus) {
            return order;
        }

        if (!this.isTransitionAllowed(order.status, nextStatus)) {
            throw new Error(`Invalid transition from ${order.status} to ${nextStatus}`);
        }

        const updated = await this.orderRepository.update(orderId, { status: nextStatus });
        return updated;
    }
}

