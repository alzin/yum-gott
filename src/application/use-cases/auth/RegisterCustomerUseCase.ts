import { Customer, AuthToken } from '@/domain/entities/index';
import { ICustomerRepository, IAuthRepository } from '@/domain/repositories/index';
import { IPasswordHasher } from '@/application/interface/IPasswordHasher';
import { EmailService } from '@/infrastructure/services/EmailService';
import { v4 as uuidv4 } from 'uuid';
import { CONFIG } from '@/main/Config';
import ms from 'ms';

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
        await this.checkExistingEmail(request.email);

        const hashedPassword = await this.passwordHasher.hash(request.password);
        const verificationToken = uuidv4();
        const tokenExpiresAt = new Date(Date.now() + ms(CONFIG.ACCESS_TOKEN_EXPIRATION as any));

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

        const createdCustomer = await this.customerRepository.create(customer);
        await this.emailService.sendVerificationEmail(request.email, verificationToken);

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
            throw new Error('يوجد مستخدم بالفعل بهذا البريد الإلكتروني');
        }
    }
}
