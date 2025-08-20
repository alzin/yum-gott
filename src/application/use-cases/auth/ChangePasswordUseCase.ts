import { ICustomerRepository, IRestaurantOwnerRepository } from '@/domain/repositories';
import { IPasswordHasher } from '@/application/interface/IPasswordHasher';

export interface ChangePasswordRequest {
    userId: string;
    oldPassword: string;
    newPassword: string;
}

export interface ChangePasswordResponse {
    success: boolean;
}

export class ChangePasswordUseCase {
    constructor(
        private customerRepository: ICustomerRepository,
        private restaurantOwnerRepository: IRestaurantOwnerRepository,
        private passwordHasher: IPasswordHasher
    ) { }

    async execute(
        request: ChangePasswordRequest,
        userTypeFromToken: 'customer' | 'restaurant_owner'
    ): Promise<ChangePasswordResponse> {
        const { userId, oldPassword, newPassword } = request;

        if (!userId) {
            throw new Error('User not found');
        }

        if (oldPassword === newPassword) {
            throw new Error('New password must be different from old password');
        }

        // Load user based on type
        const user =
            userTypeFromToken === 'customer'
                ? await this.customerRepository.findById(userId)
                : await this.restaurantOwnerRepository.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        const isOldPasswordValid = await this.passwordHasher.compare(
            oldPassword,
            user.password
        );

        if (!isOldPasswordValid) {
            throw new Error('Old password is incorrect');
        }

        const hashedNewPassword = await this.passwordHasher.hash(newPassword);

        if (userTypeFromToken === 'customer') {
            await this.customerRepository.update(userId, { password: hashedNewPassword });
        } else {
            await this.restaurantOwnerRepository.update(userId, { password: hashedNewPassword });
        }

        return { success: true };
    }
}


