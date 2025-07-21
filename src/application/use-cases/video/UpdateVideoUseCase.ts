import { v4 as uuidv4 } from 'uuid';
import { Video, VideoStatus, Network } from "@/domain/entities/Videos";
import { IVideoRepository, ICustomerRepository } from "@/domain/repositories";
import { IFileStorageService } from "@/application/interface/IFileStorageService";

export interface UpdateVideoRequest {
    id: string;
    publicId: string;
    secureUrl: string;
    restaurantName: string;
    phoneNumber: string;
    network: Network;
    invoiceImage?: Express.Multer.File;
}

export interface UpdateVideoResponse {
    video: Video;
}

export class UpdateVideoUseCase {
    constructor(
        private videoRepository: IVideoRepository,
        private customerRepository: ICustomerRepository,
        private fileStorageService: IFileStorageService
    ) { }

    async execute(request: UpdateVideoRequest, userId: string): Promise<UpdateVideoResponse> {
        const { id, publicId, secureUrl, restaurantName, phoneNumber, network, invoiceImage } = request;

        const existingVideo = await this.videoRepository.findById(id);
        if (!existingVideo) {
            throw new Error('Video not found');
        }

        if (existingVideo.userId !== userId) {
            throw new Error('You are not authorized to update this video');
        }

        const customer = await this.customerRepository.findById(userId);
        if (!customer) {
            throw new Error('Customer not found');
        }

        if (!Object.values(Network).includes(network)) {
            throw new Error('Invalid network. Must be MTN or Syriatel');
        }

        let invoiceImageUrl: string;
        if (invoiceImage) {
            try {
                invoiceImageUrl = await this.fileStorageService.UploadProductImage(
                    invoiceImage,
                    uuidv4(),
                    'invoiceImage'
                );
            } catch (error) {
                throw new Error('Failed to upload invoice image to S3');
            }
        } else {
            invoiceImageUrl = existingVideo.invoiceImage;
        }

        const updatedVideo: Video = {
            id: existingVideo.id,
            userId,
            publicId,
            secureUrl,
            restaurantName,
            phoneNumber,
            network,
            invoiceImage: invoiceImageUrl,
            statusVideo: VideoStatus.PENDING,
            createdAt: existingVideo.createdAt,
            updatedAt: new Date()
        };

        const result = await this.videoRepository.update(id, updatedVideo);
        return { video: result };
    }
}