import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/authMiddleware";
import { getProfile, updateProfile } from "../controllers/profileController";

const router = express.Router();

/* IMAGE STORAGE */

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + file.originalname;
    cb(null, unique);
  },
});

const upload = multer({ storage });

/* ROUTES */

router.get("/profile", authMiddleware, getProfile);

router.put(
  "/profile",
  authMiddleware,
  upload.single("avatar"),
  updateProfile
);

export default router;