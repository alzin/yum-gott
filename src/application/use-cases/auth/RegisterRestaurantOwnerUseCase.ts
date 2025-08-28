import { RestaurantOwner, AuthToken } from '@/domain/entities/index';
import { IRestaurantOwnerRepository, IAuthRepository } from '@/domain/repositories/index';
import { IPasswordHasher } from '@/application/interface/IPasswordHasher';
// import { EmailService } from '@/infrastructure/services/EmailService';
import { v4 as uuidv4 } from 'uuid';
import { CONFIG } from '@/main/Config'
import ms from 'ms';
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
        // private emailService: EmailService,
        private authRepository: IAuthRepository
    ) { }

    async execute(request: RegisterRestaurantOwnerRequest): Promise<AuthToken> {
        await this.checkExistingByEmail(request);
        await this.checkExistingByOrganizationNumber(request);

        const hashedPassword = await this.passwordHasher.hash(request.password);

        const verificationToken = uuidv4();
        const tokenExpiresAt = new Date(Date.now() + ms(CONFIG.ACCESS_TOKEN_EXPIRATION as any));

        const restaurantOwner: RestaurantOwner = {
            restaurantName: request.restaurantName,
            organizationNumber: request.organizationNumber,
            email: request.email,
            mobileNumber: request.mobileNumber,
            password: hashedPassword,
            isActive: false,
            isEmailVerified: false,
            verificationToken: verificationToken,
            tokenExpiresAt: tokenExpiresAt,
            profileImageUrl: null,
            address: null,
            latitude: null,
            longitude: null
        };

        const createdOwner = await this.restaurantOwnerRepository.create(restaurantOwner);
        // await this.emailService.sendVerificationEmail(request.email, verificationToken);

        const tokens = await this.authRepository.generateToken({
            userId: createdOwner.id!,
            userType: 'restaurant_owner',
            email: createdOwner.email
        });

        return tokens;
    }

    private async checkExistingByEmail(request: RegisterRestaurantOwnerRequest): Promise<void> {
        const emailExists = await this.restaurantOwnerRepository.existsByEmail(request.email);
        if (emailExists) {
            throw new Error('يوجد مستخدم بالفعل بهذا البريد الإلكتروني');
        }

    }
    private async checkExistingByOrganizationNumber(request: RegisterRestaurantOwnerRequest): Promise<void> {
        const OrganizationNumberExists = await this.restaurantOwnerRepository.existsByOrganizationNumber(request.organizationNumber);
        if (OrganizationNumberExists) {
            throw new Error('يوجد مستخدم بالفعل بهذا الرقم التعريفي للمؤسسة');
        }

    }
}
