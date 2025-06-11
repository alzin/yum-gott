import { Customer } from '../entities/User';

export interface ICustomerRepository {
    create(customer: Customer): Promise<Customer>;
    verifyEmail(token: string): Promise<Customer>;
    findById(id: string): Promise<Customer | null>;
    findByEmail(email: string): Promise<Customer | null>;
    update(id: string, customer: Partial<Customer>): Promise<Customer>;
    delete(id: string): Promise<void>;
    existsByMobileNumber(mobileNumber: string): Promise<boolean>;
    existsByEmail(email: string): Promise<boolean>;
    updateProfileImage(id: string, profileImage: string): Promise<Customer>;
    deleteUnverifiedOlderThan(date: Date): Promise<number>;
}