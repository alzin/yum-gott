"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
class AuthController {
    constructor(registerCustomerUseCase, registerRestaurantOwnerUseCase, loginUseCase) {
        this.registerCustomerUseCase = registerCustomerUseCase;
        this.registerRestaurantOwnerUseCase = registerRestaurantOwnerUseCase;
        this.loginUseCase = loginUseCase;
        this.registerCustomer = async (req, res) => {
            try {
                const customer = await this.registerCustomerUseCase.execute(req.body);
                // Remove password from response
                const { password, ...customerResponse } = customer;
                res.status(201).json({
                    success: true,
                    message: 'Customer registered successfully',
                    data: customerResponse
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Registration failed'
                });
            }
        };
        this.registerRestaurantOwner = async (req, res) => {
            try {
                const owner = await this.registerRestaurantOwnerUseCase.execute(req.body);
                // Remove password from response
                const { password, ...ownerResponse } = owner;
                res.status(201).json({
                    success: true,
                    message: 'Restaurant owner registered successfully',
                    data: ownerResponse
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Registration failed'
                });
            }
        };
        this.login = async (req, res) => {
            try {
                const result = await this.loginUseCase.execute(req.body);
                res.status(200).json({
                    success: true,
                    message: 'Login successful',
                    data: result
                });
            }
            catch (error) {
                res.status(401).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Login failed'
                });
            }
        };
    }
}
exports.AuthController = AuthController;
