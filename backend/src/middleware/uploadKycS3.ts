// src/middleware/uploadKycS3.ts
import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const bucket = process.env.S3_BUCKET_NAME!;

const upload = multer({
  storage: multerS3({
    s3: s3 as any, // multer-s3 expects v2 S3 client; many setups work with v3 via aws-sdk v2 compatibility — if you run into types mismatch, use aws-sdk v2 or use signed-URL approach
    bucket,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "private", // keep files private; serve via signed URLs or admin portal
    key: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".jpg";
      const name = `kyc/${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
      cb(null, name);
    },
  }),
  limits: { fileSize: 6 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png"];
    cb(null, allowed.includes(file.mimetype));
  },
});

export const uploadKycS3 = upload;
