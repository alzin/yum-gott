"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStorageService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
class FileStorageService {
    constructor() {
        this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'yum-gott-profile-images';
        this.s3 = new client_s3_1.S3Client({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
            }
        });
    }
    async uploadFile(file, userId, userType) {
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${userType}/${userId}-${Date.now()}.${fileExtension}`;
        const params = {
            Bucket: this.bucketName,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: client_s3_1.ObjectCannedACL.public_read // From previous fix
        };
        try {
            await this.s3.send(new client_s3_1.PutObjectCommand(params));
            const fileUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileName}`;
            return fileUrl;
        }
        catch (error) {
            console.error('Error uploading to S3:', error);
            throw new Error('Failed to upload image to S3');
        }
    }
    async deleteFile(fileUrl) {
        const key = fileUrl.split('.com/')[1];
        const params = {
            Bucket: this.bucketName,
            Key: key
        };
        try {
            await this.s3.send(new client_s3_1.DeleteObjectCommand(params));
        }
        catch (error) {
            console.error('Error deleting from S3:', error);
            throw new Error('Failed to delete image from S3');
        }
    }
}
exports.FileStorageService = FileStorageService;
