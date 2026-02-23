// src/utils/s3Client.ts
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.R2_REGION || "us-east-1";
const endpoint = process.env.R2_ENDPOINT; // e.g. https://<accountid>.r2.cloudflarestorage.com
const accessKey = process.env.R2_ACCESS_KEY_ID;
const secretKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET;

if (!endpoint || !accessKey || !secretKey || !bucket) {
  console.warn("R2 variables not fully set. Presigned upload will fail if attempted.");
}

export const s3 = new S3Client({
  region,
  endpoint,
  credentials: {
    accessKeyId: accessKey!,
    secretAccessKey: secretKey!,
  },
  forcePathStyle: false, // Cloudflare R2 works with virtual-hosted style
});

export async function generatePresignedPutUrl(key: string, contentType = "image/jpeg", expiresInSec = 300) {
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    ACL: "private",
  });

  const url = await getSignedUrl(s3, cmd, { expiresIn: expiresInSec });
  return url;
}
