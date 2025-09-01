import { IRestaurantOwnerRepository, IAuthRepository } from "@/domain/repositories/index";
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
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }

        // if (!restaurantOwner.isEmailVerified) {
        //     throw new Error('Please verify your email before logging in. Check your email for the verification link.');
        // }

        const isPasswordValid = await this.passwordHasher.compare(request.password, restaurantOwner.password);
        if (!isPasswordValid) {
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
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