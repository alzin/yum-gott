import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { IFileStorageService } from '@/application/interface/IFileStorageService';
import sharp from 'sharp';

export class FileStorageService implements IFileStorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    console.log('FileStorageService: Initializing with env', {
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      accessKey: process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Missing',
      secretKey: process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Missing',
    });
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'yum-gott-profile-images';
  }

  private parseS3Url(url: string): { key: string; isValid: boolean } {
    try {
      const parsedUrl = new URL(url);

      // Check if the hostname contains our bucket name
      const hostname = parsedUrl.hostname;
      const expectedHostname = `${this.bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`;

      if (!hostname.includes(this.bucketName)) {
        console.error('FileStorageService: Invalid S3 URL - bucket name mismatch', {
          url,
          expectedBucket: this.bucketName,
          hostname
        });
        return { key: '', isValid: false };
      }

      // Remove leading slash and any query parameters
      const key = parsedUrl.pathname.replace(/^\//, '').split('?')[0];

      if (!key) {
        console.error('FileStorageService: Invalid S3 URL - no key found', { url });
        return { key: '', isValid: false };
      }

      return { key, isValid: true };
    } catch (error) {
      console.error('FileStorageService: Failed to parse S3 URL', {
        url,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return { key: '', isValid: false };
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    userType: 'customer' | 'restaurant_owner'
  ): Promise<string> {
    // Standardize to JPG format
    const extension = 'jpg';
    let fileBuffer = file.buffer;

    // Convert image to JPG if it's not already
    if (file.mimetype !== 'image/jpeg') {
      try {
        fileBuffer = await sharp(file.buffer)
          .jpeg({ quality: 80 })
          .toBuffer();
        console.log('FileStorageService: Converted image to JPG', {
          originalMimetype: file.mimetype,
          userId,
        });
      } catch (error: any) {
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

    const command = new PutObjectCommand({
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
    } catch (error: any) {
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

  async deleteFile(fileUrl: string): Promise<void> {
    const { key, isValid } = this.parseS3Url(fileUrl);

    if (!isValid) {
      throw new Error('Invalid S3 URL format');
    }

    console.log('FileStorageService: Deleting file', { key, fileUrl });

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
      console.log('FileStorageService: Successfully deleted', { key });
    } catch (error: any) {
      console.error('FileStorageService: Failed to delete', {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
        key,
      });
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  async uploadProductFile(
    file: Express.Multer.File,
    id: string,
    type: 'restaurant_owner' | 'product',
    existingUrl?: string
  ): Promise<string> {
    let fileBuffer = file.buffer;

    // Convert to JPG if needed
    if (file.mimetype !== 'image/jpeg') {
      try {
        fileBuffer = await sharp(file.buffer)
          .jpeg({ quality: 80 })
          .toBuffer();
        console.log('FileStorageService: Converted image to JPG', {
          originalMimetype: file.mimetype,
          id,
          type
        });
      } catch (error: any) {
        console.error('FileStorageService: Image conversion failed', {
          errorName: error.name,
          errorMessage: error.message
        });
        throw new Error('Failed to convert image to JPG');
      }
    }

    // Use existing URL's key if provided, otherwise generate a new key
    let key: string;
    if (existingUrl) {
      const { key: existingKey, isValid } = this.parseS3Url(existingUrl);
      if (!isValid) {
        throw new Error('Invalid existing S3 URL format');
      }
      key = existingKey;
      console.log('FileStorageService: Using existing URL key', { key });
    } else {
      key = `${type}/${id}`;
    }

    console.log('FileStorageService: Uploading file', {
      key,
      bucket: this.bucketName,
      mimetype: file.mimetype,
      size: fileBuffer.length
    });

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: 'image/jpeg'
    });

    try {
      await this.s3Client.send(command);
      const fileUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
      console.log('FileStorageService: Successfully uploaded', { fileUrl });
      return fileUrl;
    } catch (error: any) {
      console.error('FileStorageService: Failed to upload', {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
        key,
        bucket: this.bucketName
      });
      throw new Error(`Failed to upload image to S3: ${error.message}`);
    }
  }
}