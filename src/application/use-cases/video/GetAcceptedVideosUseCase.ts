import { Video , VideoStatus } from "@/domain/entities/Videos";
import { IVideoRepository } from "@/domain/repositories";

export class GetAcceptedVideosUseCase {
    constructor(private videoRepository: IVideoRepository) { }
    async execute():Promise<Video[]>{
        return await this.videoRepository.findByStatusVideo(VideoStatus.ACCEPTED);
    }
}