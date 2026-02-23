// src/middleware/multerR2.ts
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import crypto from "crypto";
import multer from "multer";

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    if (/image\/(jpeg|jpg|png)/.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only images are allowed"));
  },
});

const R2_ENDPOINT = process.env.R2_ENDPOINT!;
const R2_BUCKET = process.env.R2_BUCKET_NAME!;
const R2_KEY = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET = process.env.R2_SECRET_ACCESS_KEY!;

const s3 = new S3Client({
  region: "auto", // Cloudflare recommends any string; not used for signing
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_KEY,
    secretAccessKey: R2_SECRET,
  },
  forcePathStyle: false,
});

export async function uploadBufferToR2(buffer: Buffer, filename: string, mime: string) {
  const key = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${filename}`;
  const cmd = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mime,
    ACL: "public-read", // you may want private + signed URL instead
  });
  await s3.send(cmd);
  // construct public URL
  const base = process.env.R2_BASE_URL || `${R2_ENDPOINT}/${R2_BUCKET}`;
  return `${base}/${key}`;
}
