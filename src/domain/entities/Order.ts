export interface Order {
    id?: string;
    customerId: string; // references Customer.id
    productId: string; // references Product.id
    orderDate: Date;
    status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
    createdAt?: Date;
    updatedAt?: Date;
}
