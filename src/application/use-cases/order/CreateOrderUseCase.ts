import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { ICustomerRepository } from '@/domain/repositories/ICustomerRepository';
import { IProductRepository } from '@/domain/repositories/IProductRepository';
import { IProductOptionRepository } from '@/domain/repositories/IProductOptionRepository';
import { IProductOptionValueRepository } from '@/domain/repositories/IProductOptionValueRepository';
import { 
    Order, 
    CreateOrderDTO, 
    ProductWithOptionsAndValues,
    SelectedProductOptionValue 
} from '@/domain/entities/Order';
 

export class CreateOrderUseCase {
    constructor(
        private orderRepository: IOrderRepository,
        private customerRepository: ICustomerRepository,
        private productRepository: IProductRepository,
        private productOptionRepository: IProductOptionRepository,
        private productOptionValueRepository: IProductOptionValueRepository,
    ) { }

    async execute(createOrderDto: CreateOrderDTO): Promise<Order> {
        // 1-2. Get the customer and product in parallel
        const [customer, product] = await Promise.all([
            this.customerRepository.findById(createOrderDto.customerId),
            this.productRepository.findById(createOrderDto.productId),
        ]);
        if (!customer) throw new Error('Customer not found');
        if (!product) throw new Error('Product not found');

        // 3. Get product options and their values
        const options = await this.productOptionRepository.findByProductId(createOrderDto.productId);
        const optionsWithValues = await Promise.all(
            options.map(async (option) => {
                const values = await this.productOptionValueRepository.findByOptionId(option.id);
                return { option, values };
            })
        );

        // 4. Process selected options
        const processedSelectedOptions: SelectedProductOptionValue[] = [];
        
        if (createOrderDto.selectedOptions && createOrderDto.selectedOptions.length > 0) {
            if (optionsWithValues.length === 0) {
                throw new Error('This product has no options. Remove selectedOptions from your request or create product options first.');
            }

            // Build a quick lookup of options by id
            const optionMap = new Map(optionsWithValues.map(ov => [ov.option.id, ov]));

            // Validate and enrich in a single pass
            for (const selected of createOrderDto.selectedOptions) {
                const group = optionMap.get(selected.optionId);
                if (!group) {
                    throw new Error(`Invalid option ID: ${selected.optionId}`);
                }
                const value = group.values.find(v => v.id === selected.valueId);
                if (!value) {
                    throw new Error(`Invalid value ID: ${selected.valueId} for option: ${selected.optionId}`);
                }

                processedSelectedOptions.push({
                    optionId: selected.optionId,
                    optionName: group.option.name,
                    valueId: selected.valueId,
                    valueName: value.name,
                    additionalPrice: value.additionalPrice ? Number(value.additionalPrice) : 0,
                });
            }
        }

        // 5. Create the order with selected options
        const productWithOptions: ProductWithOptionsAndValues = {
            product,
            options: optionsWithValues,
            selectedOptions: processedSelectedOptions
        };

        const order: Omit<Order, 'id'> = {
            customerId: createOrderDto.customerId,
            product: productWithOptions,
            orderDate: new Date(),
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // 6. Save and return the order
        return this.orderRepository.create(order);
    }

    
}
