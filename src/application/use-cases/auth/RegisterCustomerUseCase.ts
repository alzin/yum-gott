import { Customer } from '@/domain/entities/User';
import { ICustomerRepository } from '@/domain/repositories/ICustomerRepository';
import { IPasswordHasher } from '@/application/interface/IPasswordHasher';

export interface RegisterCustomerRequest {
    name: string;
    email: string;
    mobileNumber: string;
    password: string;
}

export class RegisterCustomerUseCase {
    constructor(
        private customerRepository: ICustomerRepository,
        private passwordHasher: IPasswordHasher
    ) {}

    async execute(request: RegisterCustomerRequest): Promise<Customer> {
        await this.checkExistingUser(request);
        const hashedPassword = await this.passwordHasher.hash(request.password);
        const customer: Customer = {
            name: request.name,
            email: request.email,
            mobileNumber: request.mobileNumber,
            password: hashedPassword,
            isActive: true
        };
        return await this.customerRepository.create(customer);
    }

    private async checkExistingUser(request: RegisterCustomerRequest): Promise<void> {
        const existingUser = await this.customerRepository.findByMobileNumber(request.mobileNumber);
        if (existingUser) {
            throw new Error('User already exists with this mobile number');
        }
        const emailExists = await this.customerRepository.existsByEmail(request.email);
        if (emailExists) {
            throw new Error('User already exists with this email');
        }
    }
}