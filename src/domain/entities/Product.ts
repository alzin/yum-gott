export enum SizeOption {
    Small = 'Small',
    Medium = 'Medium',
    Large = 'Large'
}

export interface Product {
    id?: string;
    categoryId: string; 
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