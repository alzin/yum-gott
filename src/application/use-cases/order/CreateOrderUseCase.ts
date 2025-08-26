import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { ICustomerRepository } from '@/domain/repositories/ICustomerRepository';
import { IProductRepository } from '@/domain/repositories/IProductRepository';
import { Order } from '@/domain/entities/Order';
import { DatabaseConnection } from '@/infrastructure/database/DataBaseConnection';

export class CreateOrderUseCase {
    constructor(
        private orderRepository: IOrderRepository,
        private customerRepository: ICustomerRepository,
        private productRepository: IProductRepository,
        private db: DatabaseConnection
    ) { }

    async execute(input: { customerId: string; productId: string }): Promise<Order> {
        const customer = await this.customerRepository.findById(input.customerId);
        if (!customer) throw new Error('Customer not found');

        const product = await this.productRepository.findById(input.productId);
        if (!product) throw new Error('Product not found');

        const order: Order = {
            id: this.db.generateUUID(),
            customerId: input.customerId,
            productId: input.productId,
            orderDate: new Date(),
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return this.orderRepository.create(order);
    }
}
