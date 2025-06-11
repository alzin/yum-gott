import { Customer } from '@/domain/entities/User';
import { ICustomerRepository, IAuthRepository } from '@/domain/repositories/index';
import { IPasswordHasher } from '@/application/interface/IPasswordHasher';
import { EmailService } from '@/infrastructure/services/EmailService';
import { JWTpayload, AuthToken } from '@/domain/entities/AuthToken';
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
        private authRepository: IAuthRepository,
        private passwordHasher: IPasswordHasher,
        private emailService: EmailService
    ) { }

    async execute(request: RegisterCustomerRequest): Promise<{
        user: Omit<Customer, 'password'>;
        authToken: AuthToken;
    }> {

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
        const jwtPayload: JWTpayload = {
            userId: customer.id!,
            userType: 'customer',
            email: request.email
        };

        const authToken = await this.authRepository.generateToken(jwtPayload);

        const { password, ...userWithoutPassword } = customer;

        return {
            user: userWithoutPassword,
            authToken
        };

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