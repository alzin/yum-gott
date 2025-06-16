export enum SizeOption {
    SMALL = 'small',
    MEDIUM = 'Medium',
    LARGE = 'Large'
}
export interface Products {
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