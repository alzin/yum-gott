import { ICustomerRepository } from '@/domain/repositories/ICustomerRepository';
import { Customer } from '@/domain/entities/User';

export interface UpdateCustomerProfileRequest {
    name?: string;
    email?: string;
    mobileNumber?: string;
    about?: string;
    gender?: string;
    profileImageUrl?: string;
}

export class UpdateCustomerProfileUseCase {
    constructor(private customerRepository: ICustomerRepository) { }

    async execute(id: string, profile: UpdateCustomerProfileRequest): Promise<Customer> {
        return this.customerRepository.updateCustomerProfile(id, profile);
    }
}
