"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantOwnerLoginUseCase = void 0;
class RestaurantOwnerLoginUseCase {
    constructor(restaurantOwnerRepository, authRepository, passwordHasher) {
        this.restaurantOwnerRepository = restaurantOwnerRepository;
        this.authRepository = authRepository;
        this.passwordHasher = passwordHasher;
    }
    async execute(request) {
        const restaurantOwner = await this.restaurantOwnerRepository.findByEmail(request.email);
        if (!restaurantOwner) {
            throw new Error('Invalid credentials');
        }
        if (!restaurantOwner.isActive) {
            throw new Error('Account is deactivated');
        }
        if (!restaurantOwner.isEmailVerified) {
            throw new Error('Please verify your email before logging in. Check your email for the verification link.');
        }
        const isPasswordValid = await this.passwordHasher.compare(request.password, restaurantOwner.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }
        const jwtPayload = {
            userId: restaurantOwner.id,
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
exports.RestaurantOwnerLoginUseCase = RestaurantOwnerLoginUseCase;
