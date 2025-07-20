import { Video } from '@/domain/entities/Videos';
import { IVideoRepository, ICustomerRepository } from '@/domain/repositories';

export interface GetVideosByCustomerRequest {
    customerId: string;
}

export class GetVideosByCustomerUseCase {
    constructor(
        private videoRepository: IVideoRepository,
        private customerRepository: ICustomerRepository
    ) { }

    async execute(request: GetVideosByCustomerRequest): Promise<Video[]> {
        const { customerId } = request;

        // Verify customer exists
        const customer = await this.customerRepository.findById(customerId);
        if (!customer) {
            throw new Error('Customer not found');
        }

        return await this.videoRepository.findByCustomerId(customerId);
    }
}