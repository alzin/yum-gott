export interface UpdateVideoPositionRequest {
    userId: string;
    lastVideoId: string;
}

export interface UpdateVideoPositionResponse {
    success: boolean;
    message: string;
}

export interface IUpdateVideoPositionUseCase {
    execute(request: UpdateVideoPositionRequest): Promise<UpdateVideoPositionResponse>;
} 