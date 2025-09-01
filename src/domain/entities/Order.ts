import { Product } from "./Product";
import { ProductOption } from "./ProductOption";
import { ProductOptionValue } from "./ProductOptionValue";

export interface ProductWithOptionsAndValues {
    product: Product;
    options: Array<{
        option: ProductOption;
        values: ProductOptionValue[];
    }>;
}

export interface Order {
    id?: string;
    customerId: string; // references Customer.id
    product: ProductWithOptionsAndValues; // embedded product details
    orderDate: Date;
    status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
    createdAt?: Date;
    updatedAt?: Date;
}
