"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const DIContainer_1 = require("../../infrastructure/di/DIContainer");
const cookieUtils_1 = require("../../shared/utils/cookieUtils");
class AuthController {
    constructor(registerCustomerUseCase, registerRestaurantOwnerUseCase, customerLoginUseCase, restaurantOwnerLoginUseCase, uploadProfileImageUseCase, updateRestaurantLocationUseCase, getRestaurantOwnerProfileUseCase) {
        this.registerCustomerUseCase = registerCustomerUseCase;
        this.registerRestaurantOwnerUseCase = registerRestaurantOwnerUseCase;
        this.customerLoginUseCase = customerLoginUseCase;
        this.restaurantOwnerLoginUseCase = restaurantOwnerLoginUseCase;
        this.uploadProfileImageUseCase = uploadProfileImageUseCase;
        this.updateRestaurantLocationUseCase = updateRestaurantLocationUseCase;
        this.getRestaurantOwnerProfileUseCase = getRestaurantOwnerProfileUseCase;
        this.registerCustomer = async (req, res) => {
            try {
                const tokens = await this.registerCustomerUseCase.execute(req.body);
                this.setAuthCookies(res, tokens);
                res.status(201).json({
                    success: true,
                    message: 'Registration successful. Please check your email for verification link.'
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
                const tokens = await this.registerRestaurantOwnerUseCase.execute(req.body);
                this.setAuthCookies(res, tokens);
                res.status(201).json({
                    success: true,
                    message: 'Restaurant owner registration successful. Please check your email for verification link.',
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Registration failed'
                });
            }
        };
        this.verifyEmail = async (req, res) => {
            try {
                const { token } = req.query;
                if (!token || typeof token !== 'string') {
                    res.status(400).json({
                        success: false,
                        message: 'Verification token is required'
                    });
                    return;
                }
                const diContainer = DIContainer_1.DIContainer.getInstance();
                const customerRepo = diContainer.customerRepository;
                const restaurantOwnerRepo = diContainer.restaurantOwnerRepository;
                try {
                    const user = await customerRepo.verifyEmail(token);
                    res.status(200).json({
                        success: true,
                        message: 'Email verified successfully. You can now login.'
                    });
                }
                catch (customerError) {
                    const user = await restaurantOwnerRepo.verifyEmail(token);
                    res.status(200).json({
                        success: true,
                        message: 'Email verified successfully. You can now login.'
                    });
                }
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Verification failed'
                });
            }
        };
        this.customerLogin = async (req, res) => {
            try {
                const result = await this.customerLoginUseCase.execute(req.body);
                this.setAuthCookies(res, result.authToken);
                res.status(200).json({
                    success: true,
                    message: 'Customer login successful'
                });
            }
            catch (error) {
                res.status(401).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Login failed'
                });
            }
        };
        this.restaurantOwnerLogin = async (req, res) => {
            try {
                const result = await this.restaurantOwnerLoginUseCase.execute(req.body);
                this.setAuthCookies(res, result.authToken);
                res.status(200).json({
                    success: true,
                    message: 'Restaurant owner login successful'
                });
            }
            catch (error) {
                res.status(401).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Login failed'
                });
            }
        };
        this.logout = async (req, res) => {
            try {
                res.status(200).json({
                    success: true,
                    message: 'Logout successful'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Logout failed'
                });
            }
        };
        this.refreshToken = async (req, res) => {
            try {
                const refreshToken = req.cookies.refreshToken;
                if (!refreshToken) {
                    res.status(401).json({
                        success: false,
                        message: 'Refresh token not found'
                    });
                    return;
                }
                const authRepository = DIContainer_1.DIContainer.getInstance().authRepository;
                const newTokens = await authRepository.refreshToken(refreshToken);
                this.setAuthCookies(res, newTokens);
                res.status(200).json({
                    success: true,
                    message: 'Token refreshed successfully'
                });
            }
            catch (error) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid refresh token'
                });
            }
        };
        this.uploadProfileImage = async (req, res) => {
            try {
                console.log('AuthController: Uploading profile image...');
                console.log('Request user:', req.user);
                console.log('Request file:', req.file);
                const user = req.user; // From AuthMiddleware
                if (!user) {
                    console.log('AuthController: No user found in request');
                    res.status(401).json({
                        success: false,
                        message: 'Unauthorized: User not authenticated'
                    });
                    return;
                }
                const request = {
                    file: req.file,
                    userId: user.userId,
                };
                console.log('Processing upload request:', request);
                const result = await this.uploadProfileImageUseCase.execute(request, user.userType);
                console.log('Upload successful:', result);
                res.status(200).json({
                    success: true,
                    message: 'Profile image uploaded successfully',
                    data: { profileImageUrl: result.profileImageUrl }
                });
            }
            catch (error) {
                console.error('AuthController: Upload failed:', error);
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Image upload failed'
                });
            }
        };
        this.updateRestaurantLocation = async (req, res) => {
            try {
                const user = req.user; // From AuthMiddleware
                if (!user || user.userType !== 'restaurant_owner') {
                    res.status(403).json({
                        success: false,
                        message: 'Forbidden: Only restaurant owners can update location'
                    });
                    return;
                }
                const request = {
                    userId: user.userId,
                    address: req.body.address,
                    latitude: req.body.latitude,
                    longitude: req.body.longitude
                };
                const result = await this.updateRestaurantLocationUseCase.execute(request);
                res.status(200).json({
                    success: true,
                    message: 'Restaurant location updated successfully',
                    data: {
                        address: result.restaurantOwner.address,
                        latitude: result.restaurantOwner.latitude,
                        longitude: result.restaurantOwner.longitude
                    }
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Location update failed'
                });
            }
        };
        this.getRestaurantOwnerProfile = async (req, res) => {
            try {
                const user = req.user; // From AuthMiddleware
                if (!user || user.userType !== 'restaurant_owner') {
                    res.status(403).json({
                        success: false,
                        message: 'Forbidden: Only restaurant owners can access this endpoint'
                    });
                    return;
                }
                const result = await this.getRestaurantOwnerProfileUseCase.execute(user.userId);
                if (!result.success) {
                    res.status(404).json({
                        success: false,
                        message: result.message || 'Restaurant owner not found'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: result.data
                });
            }
            catch (error) {
                console.error('Error getting restaurant owner profile:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error while fetching restaurant owner profile'
                });
            }
        };
    }
    setAuthCookies(res, authToken) {
        (0, cookieUtils_1.setAuthCookies)(res, authToken);
    }
}
exports.AuthController = AuthController;
