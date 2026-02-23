// src/lib/r2Client.ts
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const REGION = process.env.AWS_REGION || "us-east-1"; // not critical for R2
const R2_ENDPOINT = process.env.R2_ENDPOINT; // ex: https://<accountid>.r2.cloudflarestorage.com
const ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
const SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET = process.env.R2_BUCKET_NAME;

if (!ACCESS_KEY || !SECRET_KEY || !R2_ENDPOINT || !BUCKET) {
  console.warn("R2 variables not fully set. Presigned upload will fail if attempted.");
}

export const s3Client = new S3Client({
  region: REGION,
  endpoint: R2_ENDPOINT,
  credentials: { accessKeyId: ACCESS_KEY || "", secretAccessKey: SECRET_KEY || "" },
  forcePathStyle: false,
});

export async function generatePresignedPut(key: string, contentType = "image/jpeg", expiresSeconds = 300) {
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
    ACL: "private",
  });
  const url = await getSignedUrl(s3Client, cmd, { expiresIn: expiresSeconds });
  // compute public url if you host publicly
  const publicUrl = `${process.env.R2_PUBLIC_BASE?.replace(/\/$/, "") || R2_ENDPOINT}/${BUCKET}/${key}`;
  return { url, publicUrl };
}
