// src/infrastructure/services/FileStorageService.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import { IFileStorageService } from '@/application/interface/IFileStorageService';

export class FileStorageService implements IFileStorageService {
    private s3: S3Client;
    private bucketName: string;

    constructor() {
        this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'yum-gott-profile-images';
        
        // Validate environment variables
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION) {
            console.error('FileStorageService: Missing AWS configuration');
            throw new Error('AWS credentials or region not configured properly');
        }

        this.s3 = new S3Client({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
        console.log('FileStorageService: Initialized with bucket', this.bucketName);
    }

    async uploadFile(file: Express.Multer.File, userId: string, userType: 'customer' | 'restaurant_owner'): Promise<string> {
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${userType}/${userId}-${Date.now()}.${fileExtension}`;
        
        const params = {
            Bucket: this.bucketName,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: ObjectCannedACL.public_read
        };

        try {
            await this.s3.send(new PutObjectCommand(params));
            const fileUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileName}`;
            console.log('FileStorageService: File uploaded successfully', { fileName, fileUrl });
            return fileUrl;
        } catch (error) {
            console.error('FileStorageService: Error uploading to S3', {
                error: error instanceof Error ? error.message : error,
                fileName,
                userId,
                userType
            });
            throw new Error('Failed to upload image to S3');
        }
    }

    async deleteFile(fileUrl: string): Promise<void> {
        const key = fileUrl.split('.com/')[1];
        const params = {
            Bucket: this.bucketName,
            Key: key
        };

        try {
            await this.s3.send(new DeleteObjectCommand(params));
            console.log('FileStorageService: File deleted successfully', { fileUrl, key });
        } catch (error) {
            console.error('FileStorageService: Error deleting from S3', {
                error: error instanceof Error ? error.message : error,
                fileUrl,
                key
            });
            throw new Error('Failed to delete image from S3');
        }
    }
}