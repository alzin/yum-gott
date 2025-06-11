import { RestaurantOwner } from '@/domain/entities/User';
import { IRestaurantOwnerRepository , IAuthRepository} from '@/domain/repositories/index';
import { IPasswordHasher } from '@/application/interface/IPasswordHasher';
import { EmailService } from '@/infrastructure/services/EmailService';
import { JWTpayload, AuthToken } from '@/domain/entities/AuthToken';
import { v4 as uuidv4 } from 'uuid';

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
        private authRepository: IAuthRepository,
        private emailService: EmailService
    ) { }

    async execute(request: RegisterRestaurantOwnerRequest): Promise<{
        user: Omit<RestaurantOwner, 'password'>;
        authToken: AuthToken;
    }> {
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
        await this.restaurantOwnerRepository.create(restaurantOwner);
        await this.emailService.sendVerificationEmail(request.email, verificationToken);
        console.log('RegisterRestaurantOwnerUseCase: Verification email sent');
         const jwtPayload: JWTpayload = {
            userId: restaurantOwner.id!,
            userType: 'customer',
            email: request.email
        };

        const authToken = await this.authRepository.generateToken(jwtPayload);

        const { password, ...userWithoutPassword } = restaurantOwner;

        return {
            user: userWithoutPassword,
            authToken
        };
    }

    private async checkExistingUser(request: RegisterRestaurantOwnerRequest): Promise<void> {


        console.log('RegisterRestaurantOwnerUseCase: Checking for existing email', request.email);
        const emailExists = await this.restaurantOwnerRepository.existsByEmail(request.email);
        if (emailExists) {
            throw new Error('User already exists with this email');
        }

    }
}
