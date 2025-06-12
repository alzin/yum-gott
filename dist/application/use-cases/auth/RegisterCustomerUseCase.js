"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterCustomerUseCase = void 0;
const uuid_1 = require("uuid");
class RegisterCustomerUseCase {
    constructor(customerRepository, passwordHasher, emailService, authRepository) {
        this.customerRepository = customerRepository;
        this.passwordHasher = passwordHasher;
        this.emailService = emailService;
        this.authRepository = authRepository;
    }
    async execute(request) {
        await this.checkExistingUser(request);
        const hashedPassword = await this.passwordHasher.hash(request.password);
        const verificationToken = (0, uuid_1.v4)();
        const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        const customer = {
            name: request.name,
            email: request.email,
            mobileNumber: request.mobileNumber,
            password: hashedPassword,
            isActive: true,
            isEmailVerified: false,
            verificationToken: verificationToken,
            tokenExpiresAt: tokenExpiresAt,
            profileImageUrl: null
        };
        const createdCustomer = await this.customerRepository.create(customer);
        await this.emailService.sendVerificationEmail(request.email, verificationToken);
        // Generate tokens
        const tokens = await this.authRepository.generateToken({
            userId: createdCustomer.id,
            userType: 'customer',
            email: createdCustomer.email
        });
        return tokens;
    }
    async checkExistingEmail(email) {
        const emailExists = await this.customerRepository.existsByEmail(email);
        if (emailExists) {
            throw new Error('User already exists with this email');
        }
    }
    async checkExistingUser(request) {
        await this.checkExistingEmail(request.email);
    }
}
exports.RegisterCustomerUseCase = RegisterCustomerUseCase;
