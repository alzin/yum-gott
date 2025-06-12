"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerLoginUseCase = void 0;
class CustomerLoginUseCase {
    constructor(customerRepository, authRepository, passwordHasher) {
        this.customerRepository = customerRepository;
        this.authRepository = authRepository;
        this.passwordHasher = passwordHasher;
    }
    async execute(request) {
        const customer = await this.customerRepository.findByEmail(request.email);
        if (!customer) {
            throw new Error('Invalid credentials');
        }
        if (!customer.isActive) {
            throw new Error('Account is deactivated');
        }
        if (!customer.isEmailVerified) {
            throw new Error('Please verify your email before logging in. Check your email for the verification link.');
        }
        const isPasswordValid = await this.passwordHasher.compare(request.password, customer.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }
        const jwtPayload = {
            userId: customer.id,
            userType: 'customer',
            email: request.email
        };
        const authToken = await this.authRepository.generateToken(jwtPayload);
        const { password, ...userWithoutPassword } = customer;
        return {
            user: userWithoutPassword,
            authToken
        };
    }
}
exports.CustomerLoginUseCase = CustomerLoginUseCase;
