import { Video, VideoStatus } from "@/domain/entities/Videos";
import { IVideoRepository, PaginationParams, PaginatedVideosResult } from "@/domain/repositories";

export interface GetAcceptedVideosRequest {
    limit?: number;
    cursor?: string;
}

export interface GetAcceptedVideosResponse {
    videos: Video[];
    nextCursor?: string;
    hasMore: boolean;
}

export class GetAcceptedVideosUseCase {
    constructor(private videoRepository: IVideoRepository) { }

    async execute(request: GetAcceptedVideosRequest = {}): Promise<GetAcceptedVideosResponse> {
        const pagination: PaginationParams = {
            limit: request.limit,
            cursor: request.cursor
        };

        const result = await this.videoRepository.findByStatusVideoPaginated(VideoStatus.ACCEPTED, pagination);

        return {
            videos: result.videos,
            nextCursor: result.nextCursor,
            hasMore: result.hasMore
        };
    }
}