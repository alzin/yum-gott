import { Product } from "./Product";
import { ProductOption } from "./ProductOption";
import { ProductOptionValue } from "./ProductOptionValue";

export interface SelectedOptionValue {
    optionId: string;
    valueId: string;
}

export interface SelectedProductOptionValue {
    optionId: string;
    optionName: string;
    valueId: string;
    valueName: string;
    additionalPrice?: number;
}

export interface ProductWithOptionsAndValues {
    product: Product;
    options: Array<{
        option: ProductOption;
        values: ProductOptionValue[];
    }>;
    selectedOptions: SelectedProductOptionValue[];
}

export interface Order {
    id?: string;
    customerId: string;
    items: ProductWithOptionsAndValues[];
    orderDate: Date;
    status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateOrderDTO {
    productIds: string[];
    optionIds?: string[];
    valueIds?: string[];
    customerId: string;
}
