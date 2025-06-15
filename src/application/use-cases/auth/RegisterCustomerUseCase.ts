import { Customer } from '@/domain/entities/User';
import { ICustomerRepository } from '@/domain/repositories/ICustomerRepository';
import { IPasswordHasher } from '@/application/interface/IPasswordHasher';
import { EmailService } from '@/infrastructure/services/EmailService';
import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { v4 as uuidv4 } from 'uuid';
import { AuthToken } from '@/domain/entities/AuthToken';

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
        private emailService: EmailService,
        private authRepository: IAuthRepository
    ) { }

    async execute(request: RegisterCustomerRequest): Promise<AuthToken> {
        
        await this.checkExistingUser(request);
        const hashedPassword = await this.passwordHasher.hash(request.password);
        const verificationToken = uuidv4();
        const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const customer: Customer = {
            name: request.name,
            email: request.email,
            mobileNumber: request.mobileNumber,
            password: hashedPassword,
            isActive: false,
            isEmailVerified: false,
            verificationToken: verificationToken,
            tokenExpiresAt: tokenExpiresAt,
            profileImageUrl: null
        };

        const createdCustomer = await this.customerRepository.create(customer);
        await this.emailService.sendVerificationEmail(request.email, verificationToken);
        
        // Generate tokens
        const tokens = await this.authRepository.generateToken({
            userId: createdCustomer.id!,
            userType: 'customer',
            email: createdCustomer.email
        });
        
        return tokens;
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