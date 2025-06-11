"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUseCase = void 0;
class LoginUseCase {
    constructor(customerRepository, restaurantOwnerRepository, authRepository, passwordHasher) {
        this.customerRepository = customerRepository;
        this.restaurantOwnerRepository = restaurantOwnerRepository;
        this.authRepository = authRepository;
        this.passwordHasher = passwordHasher;
    }
    async execute(request) {
        // Try to find user in both tables
        const customer = await this.customerRepository.findByEmail(request.email);
        const restaurantOwner = await this.restaurantOwnerRepository.findByEmail(request.email);
        let user = customer || restaurantOwner;
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
        const jwtPayload = {
            userId: user.id,
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
exports.LoginUseCase = LoginUseCase;
