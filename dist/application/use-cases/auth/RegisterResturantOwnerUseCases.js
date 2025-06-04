"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterRestaurantOwnerUseCase = void 0;
const uuid_1 = require("uuid");
class RegisterRestaurantOwnerUseCase {
    constructor(restaurantOwnerRepository, passwordHasher, emailService) {
        this.restaurantOwnerRepository = restaurantOwnerRepository;
        this.passwordHasher = passwordHasher;
        this.emailService = emailService;
    }
    async execute(request) {
        console.log('RegisterRestaurantOwnerUseCase: Starting registration for', request.email);
        await this.checkExistingUser(request);
        const hashedPassword = await this.passwordHasher.hash(request.password);
        console.log('RegisterRestaurantOwnerUseCase: Password hashed');
        const verificationToken = (0, uuid_1.v4)();
        const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        const pendingUser = {
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
    async checkExistingUser(request) {
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
exports.RegisterRestaurantOwnerUseCase = RegisterRestaurantOwnerUseCase;
