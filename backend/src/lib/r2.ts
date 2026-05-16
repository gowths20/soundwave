import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const BUCKET = process.env.R2_BUCKET!;
export const CDN_BASE = process.env.R2_PUBLIC_URL!;

export async function uploadToR2(key: string, body: Buffer, contentType: string) {
  await r2.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }));
}

export async function downloadFromR2(key: string, destPath: string) {
  const { Body } = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  await pipeline(Body as Readable, createWriteStream(destPath));
  return destPath;
}
