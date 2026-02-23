// src/middleware/kycUpload.ts
import fs from "fs";
import multer from "multer";
import path from "path";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  if (/image\/(jpeg|jpg|png)/.test(file.mimetype)) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

export default multer({ storage, fileFilter, limits: { fileSize: 8 * 1024 * 1024 } });
