import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { ICustomerRepository } from '@/domain/repositories/ICustomerRepository';
import { IProductRepository } from '@/domain/repositories/IProductRepository';
import { IProductOptionRepository } from '@/domain/repositories/IProductOptionRepository';
import { IProductOptionValueRepository } from '@/domain/repositories/IProductOptionValueRepository';
import { Order, ProductWithOptionsAndValues } from '@/domain/entities/Order';
import { Product } from '@/domain/entities/Product';
import { ProductOption } from '@/domain/entities/ProductOption';
import { ProductOptionValue } from '@/domain/entities/ProductOptionValue';

export class CreateOrderUseCase {
    constructor(
        private orderRepository: IOrderRepository,
        private customerRepository: ICustomerRepository,
        private productRepository: IProductRepository,
        private productOptionRepository: IProductOptionRepository,
        private productOptionValueRepository: IProductOptionValueRepository,
    ) { }

    async execute(input: { customerId: string; productId: string }): Promise<Order> {
        const customer = await this.customerRepository.findById(input.customerId);
        if (!customer) throw new Error('Customer not found');

        const product = await this.productRepository.findById(input.productId);
        if (!product) throw new Error('Product not found');

        // Fetch product options and their values
        const options = await this.productOptionRepository.findByProductId(input.productId);
        const optionsWithValues = await Promise.all(options.map(async (option: ProductOption) => {
            const values = await this.productOptionValueRepository.findByOptionId(option.id);
            return { option, values };
        }));

        const productWithOptionsAndValues: ProductWithOptionsAndValues = {
            product,
            options: optionsWithValues
        };

        const order: Order = {
            customerId: input.customerId,
            product: productWithOptionsAndValues,
            orderDate: new Date(),
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return this.orderRepository.create(order);
    }
}
