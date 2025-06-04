"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterCustomerUseCase = void 0;
const uuid_1 = require("uuid");
class RegisterCustomerUseCase {
    constructor(customerRepository, passwordHasher, emailService) {
        this.customerRepository = customerRepository;
        this.passwordHasher = passwordHasher;
        this.emailService = emailService;
    }
    async execute(request) {
        await this.checkExistingUser(request);
        const hashedPassword = await this.passwordHasher.hash(request.password);
        const verificationToken = (0, uuid_1.v4)();
        const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        const pendingUser = {
            name: request.name,
            email: request.email,
            mobileNumber: request.mobileNumber,
            password: hashedPassword,
            userType: 'customer', // Explicitly use literal type
            verificationToken: verificationToken,
            tokenExpiresAt: tokenExpiresAt
        };
        await this.customerRepository.createPending(pendingUser);
        await this.emailService.sendVerificationEmail(request.email, verificationToken);
    }
    async checkExistingEmail(email) {
        const emailExists = await this.customerRepository.existsByEmail(email);
        if (emailExists) {
            throw new Error('User already exists with this email');
        }
    }
    async checkExistingUser(request) {
        const existingUser = await this.customerRepository.findByMobileNumber(request.mobileNumber);
        if (existingUser) {
            throw new Error('User already exists with this mobile number');
        }
        await this.checkExistingEmail(request.email);
    }
}
exports.RegisterCustomerUseCase = RegisterCustomerUseCase;
