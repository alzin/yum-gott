import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { Order } from '@/domain/entities/Order';

export class GetOrdersForCustomerUseCase {
    constructor(private orderRepository: IOrderRepository) { }

    async execute(customerId: string): Promise<Order[]> {
        return this.orderRepository.findByCustomerId(customerId);
    }
}
