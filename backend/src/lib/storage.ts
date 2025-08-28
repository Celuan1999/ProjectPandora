// src/lib/storage.ts

import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client (configure with your AWS credentials and region)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

interface PresignOptions {
  bucket: string;
  key: string;
  expiresIn?: number; // Seconds until URL expires
}

/**
 * Generates a presigned URL for uploading an object to S3
 * @param options Presign options (bucket, key, expiresIn)
 * @returns Presigned URL for PUT request
 */
export async function presignPut({
  bucket,
  key,
  expiresIn = 3600, // Default: 1 hour
}: PresignOptions): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    throw new Error(`Failed to generate presigned PUT URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generates a presigned URL for downloading an object from S3
 * @param options Presign options (bucket, key, expiresIn)
 * @returns Presigned URL for GET request
 */
export async function presignGet({
  bucket,
  key,
  expiresIn = 3600, // Default: 1 hour
}: PresignOptions): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    throw new Error(`Failed to generate presigned GET URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Example usage:
/*
const putUrl = await presignPut({ bucket: 'my-bucket', key: 'uploads/file.txt' });
const getUrl = await presignGet({ bucket: 'my-bucket', key: 'uploads/file.txt' });
*/