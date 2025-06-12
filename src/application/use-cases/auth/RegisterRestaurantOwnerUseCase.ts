import { RestaurantOwner } from '@/domain/entities/User';
import { IRestaurantOwnerRepository } from '@/domain/repositories/IRestaurantOwnerRepository';
import { IPasswordHasher } from '@/application/interface/IPasswordHasher';
import { EmailService } from '@/infrastructure/services/EmailService';
import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { v4 as uuidv4 } from 'uuid';
import { AuthToken } from '@/domain/entities/AuthToken';

export interface RegisterRestaurantOwnerRequest {
    restaurantName: string;
    organizationNumber: string;
    email: string;
    mobileNumber: string;
    password: string;
}

export class RegisterRestaurantOwnerUseCase {
    constructor(
        private restaurantOwnerRepository: IRestaurantOwnerRepository,
        private passwordHasher: IPasswordHasher,
        private emailService: EmailService,
        private authRepository: IAuthRepository
    ) { }

    async execute(request: RegisterRestaurantOwnerRequest): Promise<AuthToken> {
        console.log('RegisterRestaurantOwnerUseCase: Starting registration for', request.email);
        await this.checkExistingUser(request);

        const hashedPassword = await this.passwordHasher.hash(request.password);
        console.log('RegisterRestaurantOwnerUseCase: Password hashed');

        const verificationToken = uuidv4();
        const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const restaurantOwner: RestaurantOwner = {
            restaurantName: request.restaurantName,
            organizationNumber: request.organizationNumber,
            email: request.email,
            mobileNumber: request.mobileNumber,
            password: hashedPassword,
            isActive: true,
            isEmailVerified: false,
            verificationToken: verificationToken,
            tokenExpiresAt: tokenExpiresAt,
            profileImageUrl: null,
            address: null,
            latitude: null,
            longitude: null
        };

        console.log('RegisterRestaurantOwnerUseCase: Creating restaurant owner');
        const createdOwner = await this.restaurantOwnerRepository.create(restaurantOwner);
        await this.emailService.sendVerificationEmail(request.email, verificationToken);
        console.log('RegisterRestaurantOwnerUseCase: Verification email sent');
        
        // Generate tokens
        const tokens = await this.authRepository.generateToken({
            userId: createdOwner.id!,
            userType: 'restaurant_owner',
            email: createdOwner.email
        });
        
        return tokens;
    }

    private async checkExistingUser(request: RegisterRestaurantOwnerRequest): Promise<void> {


        console.log('RegisterRestaurantOwnerUseCase: Checking for existing email', request.email);
        const emailExists = await this.restaurantOwnerRepository.existsByEmail(request.email);
        if (emailExists) {
            throw new Error('User already exists with this email');
        }

    }
}
