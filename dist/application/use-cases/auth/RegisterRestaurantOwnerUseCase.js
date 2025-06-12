"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterRestaurantOwnerUseCase = void 0;
const uuid_1 = require("uuid");
class RegisterRestaurantOwnerUseCase {
    constructor(restaurantOwnerRepository, passwordHasher, emailService, authRepository) {
        this.restaurantOwnerRepository = restaurantOwnerRepository;
        this.passwordHasher = passwordHasher;
        this.emailService = emailService;
        this.authRepository = authRepository;
    }
    async execute(request) {
        console.log('RegisterRestaurantOwnerUseCase: Starting registration for', request.email);
        await this.checkExistingUser(request);
        const hashedPassword = await this.passwordHasher.hash(request.password);
        console.log('RegisterRestaurantOwnerUseCase: Password hashed');
        const verificationToken = (0, uuid_1.v4)();
        const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        const restaurantOwner = {
            restaurantName: request.restaurantName,
            organizationNumber: request.organizationNumber,
            email: request.email,
            mobileNumber: request.mobileNumber,
            password: hashedPassword,
            isActive: true,
            isEmailVerified: false,
            verificationToken: verificationToken,
            tokenExpiresAt: tokenExpiresAt,
            profileImageUrl: null,
            address: null,
            latitude: null,
            longitude: null
        };
        console.log('RegisterRestaurantOwnerUseCase: Creating restaurant owner');
        const createdOwner = await this.restaurantOwnerRepository.create(restaurantOwner);
        await this.emailService.sendVerificationEmail(request.email, verificationToken);
        console.log('RegisterRestaurantOwnerUseCase: Verification email sent');
        // Generate tokens
        const tokens = await this.authRepository.generateToken({
            userId: createdOwner.id,
            userType: 'restaurant_owner',
            email: createdOwner.email
        });
        return tokens;
    }
    async checkExistingUser(request) {
        console.log('RegisterRestaurantOwnerUseCase: Checking for existing email', request.email);
        const emailExists = await this.restaurantOwnerRepository.existsByEmail(request.email);
        if (emailExists) {
            throw new Error('User already exists with this email');
        }
    }
}
exports.RegisterRestaurantOwnerUseCase = RegisterRestaurantOwnerUseCase;
