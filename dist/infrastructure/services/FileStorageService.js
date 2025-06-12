"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStorageService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const sharp_1 = __importDefault(require("sharp"));
class FileStorageService {
    constructor() {
        console.log('FileStorageService: Initializing with env', {
            region: process.env.AWS_REGION,
            bucket: process.env.AWS_S3_BUCKET_NAME,
            accessKey: process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Missing',
            secretKey: process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Missing',
        });
        this.s3Client = new client_s3_1.S3Client({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
        this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'yum-gott-profile-images';
    }
    async uploadFile(file, userId, userType) {
        // Standardize to JPG format
        const extension = 'jpg';
        let fileBuffer = file.buffer;
        // Convert image to JPG if it's not already
        if (file.mimetype !== 'image/jpeg') {
            try {
                fileBuffer = await (0, sharp_1.default)(file.buffer)
                    .jpeg({ quality: 80 })
                    .toBuffer();
                console.log('FileStorageService: Converted image to JPG', {
                    originalMimetype: file.mimetype,
                    userId,
                });
            }
            catch (error) {
                console.error('FileStorageService: Image conversion failed', {
                    errorName: error.name,
                    errorMessage: error.message,
                });
                throw new Error('Failed to convert image to JPG');
            }
        }
        // Use fixed S3 key: <userType>/<userId>.jpg
        const key = `${userType}/${userId}`;
        console.log('FileStorageService: Uploading file', {
            key,
            bucket: this.bucketName,
            mimetype: file.mimetype,
            size: fileBuffer.length,
        });
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: fileBuffer,
            ContentType: 'image/jpeg',
        });
        try {
            await this.s3Client.send(command);
            const fileUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
            console.log('FileStorageService: Successfully uploaded', { fileUrl });
            return fileUrl;
        }
        catch (error) {
            console.error('FileStorageService: Failed to upload', {
                errorName: error.name,
                errorMessage: error.message,
                errorStack: error.stack,
                key,
                bucket: this.bucketName,
            });
            throw new Error(`Failed to upload image to S3: ${error.message}`);
        }
    }
    async deleteFile(fileUrl) {
        // Extract key from URL
        const key = fileUrl.split(`https://${this.bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/`)[1];
        console.log('FileStorageService: Deleting file', { key, fileUrl });
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });
        try {
            await this.s3Client.send(command);
            console.log('FileStorageService: Successfully deleted', { key });
        }
        catch (error) {
            console.error('FileStorageService: Failed to delete', {
                errorName: error.name,
                errorMessage: error.message,
                errorStack: error.stack,
                key,
            });
            throw new Error(`Failed to delete file from S3: ${error.message}`);
        }
    }
}
exports.FileStorageService = FileStorageService;
