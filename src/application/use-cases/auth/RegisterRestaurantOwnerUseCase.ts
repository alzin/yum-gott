import { RestaurantOwner } from '@/domain/entities/User';
import { IRestaurantOwnerRepository } from '@/domain/repositories/IRestaurantOwnerRepository';
import { IPasswordHasher } from '@/application/interface/IPasswordHasher';
import { EmailService } from '@/infrastructure/services/EmailService';
import { v4 as uuidv4 } from 'uuid';

export class RegisterRestaurantOwnerUseCase {
    constructor(
        private restaurantOwnerRepository: IRestaurantOwnerRepository,
        private passwordHasher: IPasswordHasher,
        private emailService: EmailService
    ) { }

    async execute(ownerData: Partial<RestaurantOwner>): Promise<RestaurantOwner> {
        // Generate verification token and expiration
        const verificationToken = uuidv4();
        const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Hash the password
        const hashedPassword = await this.passwordHasher.hash(ownerData.password!);

        // Create restaurant owner object with verification fields and is_email_verified set to false
        const owner: RestaurantOwner = {
            id: uuidv4(), // Generate a new UUID for the owner
            ...ownerData,
            password: hashedPassword,
            verification_token: verificationToken,
            verification_token_expires_at: verificationTokenExpiresAt,
            is_email_verified: false,
            is_active: false // Initially inactive until email is verified
        } as RestaurantOwner;

        // Create the restaurant owner in the database
        const createdOwner = await this.restaurantOwnerRepository.create(owner);

        // Send verification email
        await this.emailService.sendVerificationEmail(owner.email!, verificationToken);

        return createdOwner;
    }
} 