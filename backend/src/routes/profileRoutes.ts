import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/authMiddleware";
import { getProfile, updateProfile } from "../controllers/profileController";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + file.originalname;
    cb(null, unique);
  }
});

const upload = multer({ storage });

router.get("/", authMiddleware, getProfile);

router.put(
  "/",
  authMiddleware,
  upload.single("avatar"),
  updateProfile
);

export default router;