// import { RestaurantOwner } from '@/domain/entities/User';
import { IRestaurantOwnerRepository } from '@/domain/repositories/IRestaurantOwnerRepository';
import { PendingUser } from '@/domain/repositories/ICustomerRepository';
import { IPasswordHasher } from '@/application/interface/IPasswordHasher';
import { EmailService } from '@/infrastructure/services/EmailService';
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
        private emailService: EmailService
    ) {}

    async execute(request: RegisterRestaurantOwnerRequest): Promise<void> {
        console.log('RegisterRestaurantOwnerUseCase: Starting registration for', request.email);
        await this.checkExistingUser(request);
        
        const hashedPassword = await this.passwordHasher.hash(request.password);
        console.log('RegisterRestaurantOwnerUseCase: Password hashed');
        
        const verificationToken = uuidv4();
        const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        const pendingUser: PendingUser = {
            restaurantName: request.restaurantName,
            organizationNumber: request.organizationNumber,
            email: request.email,
            mobileNumber: request.mobileNumber,
            password: hashedPassword,
            userType: 'restaurant_owner', // Explicitly use literal type
            verificationToken,
            tokenExpiresAt
        };
        
        console.log('RegisterRestaurantOwnerUseCase: Creating pending user');
        await this.restaurantOwnerRepository.createPending(pendingUser);
        await this.emailService.sendVerificationEmail(request.email, verificationToken);
        console.log('RegisterRestaurantOwnerUseCase: Verification email sent');
    }

    private async checkExistingUser(request: RegisterRestaurantOwnerRequest): Promise<void> {
        console.log('RegisterRestaurantOwnerUseCase: Checking for existing user with mobile', request.mobileNumber);
        const existingUser = await this.restaurantOwnerRepository.findByMobileNumber(request.mobileNumber);
        if (existingUser) {
            throw new Error('User already exists with this mobile number');
        }
        
        console.log('RegisterRestaurantOwnerUseCase: Checking for existing email', request.email);
        const emailExists = await this.restaurantOwnerRepository.existsByEmail(request.email);
        if (emailExists) {
            throw new Error('User already exists with this email');
        }
        
        console.log('RegisterRestaurantOwnerUseCase: Checking for existing org number', request.organizationNumber);
        const orgNumberExists = await this.restaurantOwnerRepository.existsByOrganizationNumber(request.organizationNumber);
        if (orgNumberExists) {
            throw new Error('Restaurant with this organization number already exists');
        }
    }
}