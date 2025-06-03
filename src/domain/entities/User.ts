export enum UserType {
    CUSTOMER = "customer",
    RESTAURANT_OWNER = "restaurant_owner"
}

export interface BaseUser {
    id?: string;
    email: string; 
    mobileNumber: string;
    password: string;
    userType: UserType;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date; 
}

export interface Customer extends BaseUser {
    name: string;
    userType: UserType.CUSTOMER;
}

export interface restaurantOwner extends BaseUser {
    restaurantName: string;
    organizationNumber: string;
    email:string;
    userType: UserType.RESTAURANT_OWNER;
}

export type User = Customer | restaurantOwner;