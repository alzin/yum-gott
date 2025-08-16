import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { IFileStorageService } from '@/application/interface/IFileStorageService';
import sharp from 'sharp';

export class FileStorageService implements IFileStorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'testbucketyumgott';
  }

  private extractKeyFromS3Url(url: string): { key: string; isValid: boolean } {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname;

      if (!hostname.includes(this.bucketName)) {
        return { key: '', isValid: false };
      }

      const key = parsedUrl.pathname.replace(/^\//, '').split('?')[0];
      if (!key) return { key: '', isValid: false };

      return { key, isValid: true };
    } catch {
      return { key: '', isValid: false };
    }
  }

  private async convertToJPGIfNeeded(file: Express.Multer.File): Promise<Buffer> {
    if (file.mimetype === 'image/jpeg') {
      return file.buffer;
    }

    try {
      return await sharp(file.buffer)
        .jpeg({ quality: 80, progressive: true })
        .toBuffer();
    } catch {
      throw new Error('Failed to convert image to JPEG');
    }
  }

  async UploadImageProfile(
    file: Express.Multer.File,
    userId: string,
    userType: 'customer' | 'restaurant_owner'
  ): Promise<string> {
    const fileBuffer = await this.convertToJPGIfNeeded(file);
    const key = `${userType}/${userId}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: 'image/jpeg',
    });

    try {
      await this.s3Client.send(command);
      return `https://${this.bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    } catch (error: any) {
      throw new Error(`Failed to upload image to S3: ${error.message}`);
    }
  }

  async UploadProductImage(
    file: Express.Multer.File,
    id: string,
    type: 'restaurant_owner' | 'product',
    existingUrl?: string
  ): Promise<string> {
    const fileBuffer = await this.convertToJPGIfNeeded(file);

    let key = `${type}/${id}`;
    if (existingUrl) {
      const { key: existingKey, isValid } = this.extractKeyFromS3Url(existingUrl);
      if (!isValid) {
        throw new Error('Invalid existing S3 URL format');
      }
      key = existingKey;
    }

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: 'image/jpeg',
    });

    try {
      await this.s3Client.send(command);
      return `https://${this.bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    } catch (error: any) {
      throw new Error(`Failed to upload product image to S3: ${error.message}`);
    }
  }

  async DeleteOldImage(fileUrl: string): Promise<void> {
    const { key, isValid } = this.extractKeyFromS3Url(fileUrl);
    if (!isValid) {
      throw new Error('Invalid S3 URL format');
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
    } catch (error: any) {
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }
}
