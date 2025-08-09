import { Video, VideoStatus } from "@/domain/entities/Videos";
import { IVideoRepository } from "@/domain/repositories";

export interface GetCustomerAcceptedVideosResponse {
    videos: Video[];
}

export class GetCustomerAcceptedVideosUseCase {
    constructor(private videoRepository: IVideoRepository) { }

    async execute(): Promise<GetCustomerAcceptedVideosResponse> {
        const videos = await this.videoRepository.findAllAcceptedVideos();
        return { videos };
    }
} 