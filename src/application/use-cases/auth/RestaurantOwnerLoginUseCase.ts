import { IRestaurantOwnerRepository } from "@/domain/repositories/IRestaurantOwnerRepository";
import { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { IPasswordHasher } from "@/application/interface/IPasswordHasher";
import { LoginResponse, LoginRequest } from "@/application/interface/ILoginUseCase";
import { JWTpayload } from "@/domain/entities/AuthToken";


export class RestaurantOwnerLoginUseCase {
    constructor(
        private restaurantOwnerRepository: IRestaurantOwnerRepository,
        private authRepository: IAuthRepository,
        private passwordHasher: IPasswordHasher
    ) { }

    async execute(request: LoginRequest): Promise<LoginResponse> {
        const restaurantOwner = await this.restaurantOwnerRepository.findByEmail(request.email);

        if (!restaurantOwner) {
            throw new Error('Invalid credentials');
        }

        if (!restaurantOwner.isActive) {
            throw new Error('Account is deactivated');
        }

        const isPasswordValid = await this.passwordHasher.compare(request.password, restaurantOwner.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        const jwtPayload: JWTpayload = {
            userId: restaurantOwner.id!,
            userType: 'restaurant_owner',
            email: request.email
        };

        const authToken = await this.authRepository.generateToken(jwtPayload);

        const { password, ...userWithoutPassword } = restaurantOwner;

        return {
            user: userWithoutPassword,
            authToken
        };
    }
}