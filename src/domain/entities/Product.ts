export enum SizeOption {
    SMALL = 'Small',
    MEDIUM = 'Medium',
    LARGE = 'Large'
}
export interface Product {
    id?: string;
    category: string;
    productName: string;
    description: string;
    price: number;
    discount?: number;
    addSize?: SizeOption;
    imageUrl?: string | null;
    restaurantOwnerId: string;
    createdAt?: Date;
    updatedAt?: Date;
}