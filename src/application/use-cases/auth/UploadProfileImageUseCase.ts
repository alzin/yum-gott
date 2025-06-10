import { IFileStorageService } from '@/application/interface/IFileStorageService';
import { ICustomerRepository , IRestaurantOwnerRepository} from '@/domain/repositories/index';

export interface UploadProfileImageRequest {
    file: Express.Multer.File | undefined;
    userId: string;
    // Removed userType: 'customer' | 'restaurant_owner'; // Now derived from token
}

export interface UploadProfileImageResponse {
    profileImageUrl: string;
}

export class UploadProfileImageUseCase {
    constructor(
        private customerRepository: ICustomerRepository,
        private restaurantOwnerRepository: IRestaurantOwnerRepository,
        private fileStorageService: IFileStorageService
    ) {}

    async execute(request: UploadProfileImageRequest, userTypeFromToken: 'customer' | 'restaurant_owner'): Promise<UploadProfileImageResponse> {
        const { file, userId } = request;

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

        // Fetch existing user to check for old profile image
        let oldProfileImageUrl: string | null | undefined;
        if (userTypeFromToken === 'customer') {
            const customer = await this.customerRepository.findById(userId);
            if (!customer) throw new Error('Customer not found');
            oldProfileImageUrl = customer.profileImageUrl;
        } else {
            const owner = await this.restaurantOwnerRepository.findById(userId);
            if (!owner) throw new Error('Restaurant owner not found');
            oldProfileImageUrl = owner.profileImageUrl;
        }

        // Upload new image to S3
        let profileImageUrl: string;
        try {
            profileImageUrl = await this.fileStorageService.uploadFile(file, userId, userTypeFromToken);
        } catch (error) {
            console.error('UploadProfileImageUseCase: Failed to upload image to S3', error);
            throw new Error('Failed to upload image to S3');
        }

        // Update database
        try {
            if (userTypeFromToken === 'customer') {
                await this.customerRepository.updateProfileImage(userId, profileImageUrl);
            } else {
                await this.restaurantOwnerRepository.updateProfileImage(userId, profileImageUrl);
            }
        } catch (error) {
            // Rollback: Delete the uploaded file from S3 if database update fails
            await this.fileStorageService.deleteFile(profileImageUrl);
            console.error('UploadProfileImageUseCase: Failed to update database, rolled back S3 upload', error);
            throw new Error('Failed to update profile image in database');
        }
        return { profileImageUrl };
    }
}