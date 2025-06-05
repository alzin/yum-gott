"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadProfileImageUseCase = void 0;
class UploadProfileImageUseCase {
    constructor(customerRepository, restaurantOwnerRepository, fileStorageService) {
        this.customerRepository = customerRepository;
        this.restaurantOwnerRepository = restaurantOwnerRepository;
        this.fileStorageService = fileStorageService;
    }
    async execute(request) {
        const { file, userId, userType } = request;
        // Validate file
        if (!file) {
            throw new Error('No file uploaded');
        }
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.mimetype)) {
            throw new Error('Only JPEG, PNG, and GIF images are allowed');
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            throw new Error('File size must not exceed 5MB');
        }
        // Upload to S3
        const profileImageUrl = await this.fileStorageService.uploadFile(file, userId, userType);
        // Update database based on user type
        if (userType === 'customer') {
            const customer = await this.customerRepository.findById(userId);
            if (!customer)
                throw new Error('Customer not found');
            await this.customerRepository.updateProfileImage(userId, profileImageUrl);
        }
        else {
            const owner = await this.restaurantOwnerRepository.findById(userId);
            if (!owner)
                throw new Error('Restaurant owner not found');
            await this.restaurantOwnerRepository.updateProfileImage(userId, profileImageUrl);
        }
        return { profileImageUrl };
    }
}
exports.UploadProfileImageUseCase = UploadProfileImageUseCase;
