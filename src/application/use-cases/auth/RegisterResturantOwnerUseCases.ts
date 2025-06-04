import { RestaurantOwner } from '@/domain/entities/User';
import { IRestaurantOwnerRepository } from '@/domain/repositories/IRestaurantOwnerRepository';
import { IPasswordHasher } from '@/application/interface/IPasswordHasher';

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
        private passwordHasher: IPasswordHasher
    ) {}

    async execute(request: RegisterRestaurantOwnerRequest): Promise<RestaurantOwner> {
        console.log('RegisterRestaurantOwnerUseCase: Starting registration for', request.email);
        await this.checkExistingUser(request);
        
        const hashedPassword = await this.passwordHasher.hash(request.password);
        console.log('RegisterRestaurantOwnerUseCase: Password hashed');
        
        const restaurantOwner: RestaurantOwner = {
            restaurantName: request.restaurantName,
            organizationNumber: request.organizationNumber,
            email: request.email,
            mobileNumber: request.mobileNumber,
            password: hashedPassword,
            isActive: true
        };
        
        console.log('RegisterRestaurantOwnerUseCase: Calling restaurantOwnerRepository.create');
        const createdOwner = await this.restaurantOwnerRepository.create(restaurantOwner);
        console.log('RegisterRestaurantOwnerUseCase: Restaurant owner created with ID', createdOwner.id);
        
        return createdOwner;
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