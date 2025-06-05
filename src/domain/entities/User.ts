
export interface BaseUser {
    id?: string;
    mobileNumber: string;
    password: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    profileImageUrl?: string | null;
}

export interface Customer extends BaseUser {
    name: string;
    email: string;
}

export interface RestaurantOwner extends BaseUser {
    restaurantName: string;
    organizationNumber: string;
    email: string;
}
