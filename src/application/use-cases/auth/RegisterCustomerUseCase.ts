import { Customer } from '@/domain/entities/User';
import { ICustomerRepository } from '@/domain/repositories/ICustomerRepository';
import { IPasswordHasher } from '@/application/interface/IPasswordHasher';
import { EmailService } from '@/infrastructure/services/EmailService';
import { v4 as uuidv4 } from 'uuid';

export interface RegisterCustomerRequest {
    name: string;
    email: string;
    mobileNumber: string;
    password: string;
}

export class RegisterCustomerUseCase {
    constructor(
        private customerRepository: ICustomerRepository,
        private passwordHasher: IPasswordHasher,
        private emailService: EmailService
    ) { }

    async execute(request: RegisterCustomerRequest): Promise<void> {
        
        await this.checkExistingUser(request);
        const hashedPassword = await this.passwordHasher.hash(request.password);
        const verificationToken = uuidv4();
        const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const customer: Customer = {
            name: request.name,
            email: request.email,
            mobileNumber: request.mobileNumber,
            password: hashedPassword,
            isActive: true,
            isEmailVerified: false,
            verificationToken: verificationToken,
            tokenExpiresAt: tokenExpiresAt,
            profileImageUrl: null
        };

        await this.customerRepository.create(customer);
        await this.emailService.sendVerificationEmail(request.email, verificationToken);
    }

    private async checkExistingEmail(email: string): Promise<void> {
        const emailExists = await this.customerRepository.existsByEmail(email);
        if (emailExists) {
            throw new Error('User already exists with this email');
        }
    }

    private async checkExistingUser(request: RegisterCustomerRequest): Promise<void> {
        await this.checkExistingEmail(request.email);
    }
}