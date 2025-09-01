import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { Order } from '@/domain/entities/Order';

export class GetOrderByIdUseCase {
    constructor(private orderRepository: IOrderRepository) { }

    async execute(orderId: string): Promise<Order | null> {
        return this.orderRepository.findById(orderId);
    }
}
