import AWS from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";

const s3 = new AWS.S3({
  endpoint: process.env.R2_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
});

export const uploadToR2 = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.R2_BUCKET_NAME!,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "private", // KYC must be private
    key: function (_req, file, cb) {
      const filename = `kyc/${Date.now()}-${file.originalname}`;
      cb(null, filename);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
