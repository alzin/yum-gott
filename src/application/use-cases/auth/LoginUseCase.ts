import { Customer, RestaurantOwner } from "@/domain/entities/User";
import { IPasswordHasher } from "@/application/interface/IPasswordHasher";
import { AuthToken, JWTpayload } from "@/domain/entities/AuthToken";
import { ICustomerRepository } from "@/domain/repositories/ICustomerRepository";
import { IRestaurantOwnerRepository } from "@/domain/repositories/IRestaurantOwnerRepository";
import { IAuthRepository } from "@/domain/repositories/IAuthRepository";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: Omit<Customer, 'password'> | Omit<RestaurantOwner, 'password'>;
    authToken: AuthToken;
}

export class LoginUseCase {
    constructor(
        private customerRepository: ICustomerRepository,
        private restaurantOwnerRepository: IRestaurantOwnerRepository,
        private authRepository: IAuthRepository,
        private passwordHasher: IPasswordHasher
    ) {}

    async execute(request: LoginRequest): Promise<LoginResponse> {
        // Try to find user in both tables
        const customer = await this.customerRepository.findByEmail(request.email);
        const restaurantOwner = await this.restaurantOwnerRepository.findByEmail(request.email);
        
        let user: Customer | RestaurantOwner | null = customer || restaurantOwner;
        
        if (!user) {
            throw new Error("Invalid credentials");
        }

        if (!user.isActive) {
            throw new Error("Account is deactivated");
        }

        if (!user.isEmailVerified) {
            throw new Error("Email not verified. Please verify your email before logging in.");
        }

        // Check password
        const isPasswordValid = await this.passwordHasher.compare(request.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        // Generate Token
        const jwtPayload: JWTpayload = {
            userId: user.id!,
            userType: customer ? 'customer' : 'restaurant_owner',
            email: request.email
        };

        const authToken = await this.authRepository.generateToken(jwtPayload);
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        
        return {
            user: userWithoutPassword,
            authToken
        };
    }
}