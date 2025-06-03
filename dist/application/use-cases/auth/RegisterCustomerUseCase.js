"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterCustomerUseCase = void 0;
const User_1 = require("@/domain/entities/User");
class RegisterCustomerUseCase {
    constructor(userRepository, passwordHasher) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
    }
    async execute(request) {
        // Validation is now handled at the presentation layer
        await this.checkExistingUser(request);
        const hashedPassword = await this.passwordHasher.hash(request.password);
        const customer = this.createCustomer(request, hashedPassword);
        return await this.userRepository.create(customer);
    }
    async checkExistingUser(request) {
        const existingUser = await this.userRepository.findByMobileNumber(request.mobileNumber);
        if (existingUser) {
            throw new Error('User already exists with this mobile number');
        }
        const emailExists = await this.userRepository.existsByEmail(request.email);
        if (emailExists) {
            throw new Error('User already exists with this email');
        }
    }
    createCustomer(request, hashedPassword) {
        return {
            name: request.name,
            email: request.email,
            mobileNumber: request.mobileNumber,
            password: hashedPassword,
            userType: User_1.UserType.CUSTOMER,
            isActive: true
        };
    }
}
exports.RegisterCustomerUseCase = RegisterCustomerUseCase;
