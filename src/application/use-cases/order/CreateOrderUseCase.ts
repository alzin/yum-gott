import { IOrderRepository, ICustomerRepository, IProductRepository, IProductOptionRepository, IProductOptionValueRepository } from '@/domain/repositories';
import { Order, CreateOrderDTO, ProductWithOptionsAndValues, SelectedProductOptionValue, } from '@/domain/entities/Order';
import { IRealtimeNotifier } from '@/application/interface/IRealtimeNotifier';

export class CreateOrderUseCase {
    constructor(
        private orderRepository: IOrderRepository,
        private customerRepository: ICustomerRepository,
        private productRepository: IProductRepository,
        private productOptionRepository: IProductOptionRepository,
        private productOptionValueRepository: IProductOptionValueRepository,
        private notifier?: IRealtimeNotifier,
    ) { }

    async execute(createOrderDto: CreateOrderDTO): Promise<Order> {
        if (!createOrderDto.productIds || createOrderDto.productIds.length === 0) {
            throw new Error('productIds must contain at least one productId');
        }

        // 1. Get the customer
        const customer = await this.customerRepository.findById(createOrderDto.customerId);
        if (!customer) throw new Error('Customer not found');

        // 2. Interpret arrays as aligned triplets and group by product
        if ((createOrderDto.optionIds && !createOrderDto.valueIds) || (!createOrderDto.optionIds && createOrderDto.valueIds)) {
            throw new Error('optionIds and valueIds must be provided together');
        }

        const tripletCount = Math.max(
            createOrderDto.productIds.length,
            createOrderDto.optionIds?.length || 0,
            createOrderDto.valueIds?.length || 0
        );

        const groupedSelections = new Map<string, Array<{ optionId?: string; valueId?: string }>>();
        for (let i = 0; i < tripletCount; i++) {
            const productId = createOrderDto.productIds[i];
            if (!productId) continue;
            const optionId = createOrderDto.optionIds ? createOrderDto.optionIds[i] : undefined;
            const valueId = createOrderDto.valueIds ? createOrderDto.valueIds[i] : undefined;
            const arr = groupedSelections.get(productId) || [];
            arr.push({ optionId, valueId });
            groupedSelections.set(productId, arr);
        }

        const items: ProductWithOptionsAndValues[] = await Promise.all(Array.from(groupedSelections.entries()).map(async ([productId, selections]) => {
            const product = await this.productRepository.findById(productId);
            if (!product) {
                throw new Error(`Product not found: ${productId}`);
            }
            const options = await this.productOptionRepository.findByProductId(productId);
            const optionsWithValues = await Promise.all(
                options.map(async (option) => {
                    const values = await this.productOptionValueRepository.findByOptionId(option.id);
                    return { option, values };
                })
            );

            const processedSelectedOptions: SelectedProductOptionValue[] = [];
            if (selections && selections.length > 0) {
                if (optionsWithValues.length === 0) {
                    throw new Error('This product has no options. Remove selected options from your request.');
                }
                const optionMap = new Map(optionsWithValues.map(ov => [ov.option.id, ov]));
                for (const { optionId, valueId } of selections) {
                    if (!optionId || !valueId) continue;
                    const group = optionMap.get(optionId);
                    if (!group) {
                        throw new Error(`Invalid option ID: ${optionId}`);
                    }
                    const value = group.values.find(v => v.id === valueId);
                    if (!value) {
                        throw new Error(`Invalid value ID: ${valueId} for option: ${optionId}`);
                    }
                    processedSelectedOptions.push({
                        optionId,
                        optionName: group.option.name,
                        valueId,
                        valueName: value.name,
                        additionalPrice: value.additionalPrice ? Number(value.additionalPrice) : 0,
                    });
                }
            }

            const productWithOptions: ProductWithOptionsAndValues = {
                product,
                options: optionsWithValues,
                selectedOptions: processedSelectedOptions
            };
            return { ...productWithOptions } as ProductWithOptionsAndValues;
        }));

        const order: Omit<Order, 'id'> = {
            customerId: createOrderDto.customerId,
            items,
            orderDate: new Date(),
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const created = await this.orderRepository.create(order as any);

        try {
            const ownerIds = Array.from(new Set(items.map(i => i.product.restaurantOwnerId)));
            await this.notifier?.notifyOwnersOrderCreated(ownerIds, created);
        } catch (e) {
            console.error('Failed to notify owners about order creation', e);
        }

        return created;
    }


}
