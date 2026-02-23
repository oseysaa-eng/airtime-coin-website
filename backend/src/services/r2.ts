// src/services/r2.ts
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();

const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT;
if (!endpoint) throw new Error("CLOUDFLARE_R2_ENDPOINT not set");

const r2 = new S3Client({
  region: "auto",
  endpoint,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: false,
});

export const uploadFileToR2 = async (localFilePath: string, destKey?: string) => {
  const bucket = process.env.CLOUDFLARE_R2_BUCKET!;
  const fileBuffer = fs.readFileSync(localFilePath);
  const key = destKey ?? `kyc/${Date.now()}-${path.basename(localFilePath)}`;

  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileBuffer,
    ContentType: "image/jpeg",
  });

  await r2.send(cmd);

  // public URL: your R2 endpoint + bucket + key
  // Example: https://<accountid>.r2.cloudflarestorage.com/<bucket>/<key>
  return `${endpoint}/${bucket}/${key}`;
};
