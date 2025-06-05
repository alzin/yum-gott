import { Customer } from '../entities/User';

export interface PendingUser {
    name?: string;
    restaurantName?: string;
    organizationNumber?: string;
    email: string;
    mobileNumber: string;
    password: string;
    userType: 'customer' | 'restaurant_owner';
    verificationToken: string;
    tokenExpiresAt: Date;
}

export interface ICustomerRepository {
    create(customer: Customer): Promise<Customer>;
    createPending(pendingUser: PendingUser): Promise<void>;
    verifyEmail(token: string): Promise<Customer>;
    findByMobileNumber(mobileNumber: string): Promise<Customer | null>;
    findById(id: string): Promise<Customer | null>;
    findByEmail(email: string): Promise<Customer | null>;
    update(id: string, customer: Partial<Customer>): Promise<Customer>;
    delete(id: string): Promise<void>;
    existsByMobileNumber(mobileNumber: string): Promise<boolean>;
    existsByEmail(email: string): Promise<boolean>;
    updateProfileImage(id :string , profileImage : string):Promise<Customer>
}