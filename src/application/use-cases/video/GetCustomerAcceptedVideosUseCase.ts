import { Video, VideoStatus } from "@/domain/entities/Videos";
import { IVideoRepository } from "@/domain/repositories";

export interface GetCustomerAcceptedVideosRequest {
    customerId: string;
}

export interface GetCustomerAcceptedVideosResponse {
    videos: Video[];
}

export class GetCustomerAcceptedVideosUseCase {
    constructor(private videoRepository: IVideoRepository) { }

    async execute(request: GetCustomerAcceptedVideosRequest): Promise<GetCustomerAcceptedVideosResponse> {
        const videos = await this.videoRepository.findByCustomerIdAndStatus(
            request.customerId,
            VideoStatus.ACCEPTED
        );

        return {
            videos
        };
    }
} 