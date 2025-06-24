export enum SizeName {
    Small = 'Small',
    Medium = 'Medium',
    Large = 'Large'
}

export interface SizeOption {
    name: SizeName;
    additionalPrice: number;
}

export interface Product {
    id?: string;
    categoryName: string;
    productName: string;
    description: string;
    price: number;
    discount?: number;
    sizeOptions?: SizeOption[] | null;
    imageUrl?: string | null;
    restaurantOwnerId: string;
    createdAt?: Date;
    updatedAt?: Date;
}