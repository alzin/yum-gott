"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterRestaurantOwnerUseCase = void 0;
const User_1 = require("@/domain/entities/User");
class RegisterRestaurantOwnerUseCase {
    constructor(userRepository, passwordHasher) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
    }
    async execute(request) {
        // Validation is now handled at the presentation layer
        await this.checkExistingUser(request);
        const hashedPassword = await this.passwordHasher.hash(request.password);
        const restaurantOwner = this.createRestaurantOwner(request, hashedPassword);
        return await this.userRepository.create(restaurantOwner);
    }
    async checkExistingUser(request) {
        const existingUser = await this.userRepository.findByMobileNumber(request.mobileNumber);
        if (existingUser) {
            throw new Error('User already exists with this mobile number');
        }
        // Check if email already exists
        const emailExists = await this.userRepository.existsByEmail(request.email);
        if (emailExists) {
            throw new Error('User already exists with this email');
        }
        const orgNumberExists = await this.userRepository.existsByOrganizationNumber(request.organizationNumber);
        if (orgNumberExists) {
            throw new Error('Restaurant with this organization number already exists');
        }
    }
    createRestaurantOwner(request, hashedPassword) {
        return {
            restaurantName: request.restaurantName,
            organizationNumber: request.organizationNumber,
            email: request.email, // Include email in restaurant owner creation
            mobileNumber: request.mobileNumber,
            password: hashedPassword,
            userType: User_1.UserType.RESTAURANT_OWNER,
            isActive: true
        };
    }
}
exports.RegisterRestaurantOwnerUseCase = RegisterRestaurantOwnerUseCase;
