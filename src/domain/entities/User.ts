export interface BaseUser {
    id?: string;
    mobileNumber: string;
    password: string;
    isActive: boolean;
    isEmailVerified: boolean;
    verificationToken?: string | null;
    tokenExpiresAt?: Date | null;
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