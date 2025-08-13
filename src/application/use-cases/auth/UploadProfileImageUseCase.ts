import { IFileStorageService } from '@/application/interface/IFileStorageService';
import { ICustomerRepository, IRestaurantOwnerRepository } from '@/domain/repositories/index';

export interface UploadProfileImageRequest {
    file: Express.Multer.File | undefined;
    userId: string;
}

export interface UploadProfileImageResponse {
    profileImageUrl: string;
}

export class UploadProfileImageUseCase {
    constructor(
        private customerRepository: ICustomerRepository,
        private restaurantOwnerRepository: IRestaurantOwnerRepository,
        private fileStorageService: IFileStorageService
    ) { }

    async execute(request: UploadProfileImageRequest, userTypeFromToken: 'customer' | 'restaurant_owner'): Promise<UploadProfileImageResponse> {
        const { file, userId } = request;

        // Validate file
        if (!file) {
            throw new Error('No file uploaded');
        }

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

        let profileImageUrl: string;
        try {
            profileImageUrl = await this.fileStorageService.UploadImageProfile(file, userId, userTypeFromToken);
        } catch (error) {
            throw new Error('Failed to upload image to S3');
        }

        try {
            if (userTypeFromToken === 'customer') {
                await this.customerRepository.updateProfileImage(userId, profileImageUrl);
            } else {
                await this.restaurantOwnerRepository.updateProfileImage(userId, profileImageUrl);
            }
        } catch (error) {
            await this.fileStorageService.DeleteOldImage(profileImageUrl);
            throw new Error('Failed to update profile image in database');
        }
        return { profileImageUrl };
    }
}