import { restaurantOwner, UserType } from '@/domain/entities/User';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { IPasswordHasher } from '@/application/interface/IPasswordHasher';

export interface RegisterRestaurantOwnerRequest {
  restaurantName: string;
  email: string; 
  organizationNumber: string;
  mobileNumber: string;
  password: string;
}

export class RegisterRestaurantOwnerUseCase {
  constructor(
    private userRepository: IUserRepository,
    private passwordHasher: IPasswordHasher
  ) { }

  async execute(request: RegisterRestaurantOwnerRequest): Promise<restaurantOwner> {
    // Validation is handled at the presentation layer
    await this.checkExistingUser(request);

    const hashedPassword = await this.passwordHasher.hash(request.password);
    const restaurantOwner = this.createRestaurantOwner(request, hashedPassword);

    return await this.userRepository.create(restaurantOwner);
  }

  private async checkExistingUser(request: RegisterRestaurantOwnerRequest): Promise<void> {
    const existingUserByMobile = await this.userRepository.findByMobileNumber(request.mobileNumber);
    if (existingUserByMobile) {
      throw new Error('User already exists with this mobile number');
    }
    const emailExists = await this.userRepository.existsByEmail(request.email);
    if (emailExists) {
      throw new Error('User already exists with this email');
    }
    const orgNumberExists = await this.userRepository.existsByOrganizationNumber(request.organizationNumber);
    if (orgNumberExists) {
      throw new Error('Restaurant with this organization number already exists');
    }
  }

  private createRestaurantOwner(request: RegisterRestaurantOwnerRequest, hashedPassword: string): restaurantOwner {
    return {
      restaurantName: request.restaurantName,
      email: request.email, 
      organizationNumber: request.organizationNumber,
      mobileNumber: request.mobileNumber,
      password: hashedPassword,
      userType: UserType.RESTAURANT_OWNER,
      isActive: true
    };
  }
}