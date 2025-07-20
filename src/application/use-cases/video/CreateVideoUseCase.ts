import { v4 as uuidv4 } from 'uuid';
import { Video, VideoStatus, Network } from '@/domain/entities/Videos';
import { IVideoRepository, ICustomerRepository } from '@/domain/repositories';
import { IFileStorageService } from '@/application/interface/IFileStorageService';

export interface CreateVideoRequest {
    publicId: string;
    secureUrl: string;
    restaurantName: string;
    phoneNumber: string;
    network: Network;
    invoiceImage: Express.Multer.File;
}

export interface CreateVideoResponse {
    video: Video;
}

export class CreateVideoUseCase {
    constructor(
        private videoRepository: IVideoRepository,
        private customerRepository: ICustomerRepository,
        private fileStorageService: IFileStorageService
    ) { }

    async execute(request: CreateVideoRequest, userId: string): Promise<CreateVideoResponse> {
        const { publicId, secureUrl,restaurantName, phoneNumber, network, invoiceImage } = request;

        // Validate customer exists
        const customer = await this.customerRepository.findById(userId);
        if (!customer) {
            throw new Error('Customer not found');
        }

        // Validate phone number format
        // if (!/^[0-9]{10,15}$/.test(phoneNumber)) {
        //     throw new Error('Invalid phone number format');
        // }

        // Validate network
        if (!Object.values(Network).includes(network)) {
            throw new Error('Invalid network. Must be MTN or Syriatel');
        }

        // Upload invoice image to S3
        let invoiceImageUrl: string;
        try {
            invoiceImageUrl = await this.fileStorageService.UploadProductImage(
                invoiceImage,
                uuidv4(),
                'invoiceImage'
            );
        } catch (error) {
            throw new Error('Failed to upload invoice image to S3');
        }

        const video: Video = {
            id: uuidv4(),
            userId,
            publicId,
            secureUrl,
            restaurantName,
            phoneNumber,
            network,
            invoiceImage: invoiceImageUrl,
            statusVideo: VideoStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const createdVideo = await this.videoRepository.create(video);
        return { video: createdVideo };
    }
}