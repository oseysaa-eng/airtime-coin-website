// src/middleware/uploadR2.ts
import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
dotenv.config();

const R2_ENDPOINT = process.env.R2_ENDPOINT!;
const R2_REGION = process.env.R2_REGION || "auto";
const R2_BUCKET = process.env.R2_BUCKET_NAME!;
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET = process.env.R2_SECRET_ACCESS_KEY!;

// S3 client for R2 (S3-compatible)
const s3 = new S3Client({
  region: R2_REGION,
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET,
  },
  forcePathStyle: false,
});

const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

const upload = multer({
  storage: multerS3({
    s3: (s3 as any), // multer-s3 expects aws-sdk S3; it works with @aws-sdk client if cast
    bucket: R2_BUCKET,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req: any, file: Express.Multer.File, cb: any) {
      const ext = path.extname(file.originalname) || ".jpg";
      const filename = `kyc/${Date.now()}_${Math.round(Math.random()*1e6)}${ext}`;
      cb(null, filename);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid file type"), false);
  },
  limits: { fileSize: 6 * 1024 * 1024 }, // 6MB max per file
});

export default upload;
export { s3 };

