import { IVideoRepository } from "@/domain/repositories";
import { ICustomerRepository } from "@/domain/repositories";

export class DeleteVideoUseCase {
    constructor(
        private videoRepository: IVideoRepository,
        private customerRepository: ICustomerRepository
    ) { }

    async execute(id: string, userId: string): Promise<void> {
        const video = await this.videoRepository.findById(id);
        if (!video) throw new Error("Video not found");
        if (video.userId !== userId) throw new Error("Not authorized to delete this video");

        const customer = await this.customerRepository.findById(userId);
        if (!customer) throw new Error("Customer not found");

        await this.videoRepository.delete(id);
    }
}
