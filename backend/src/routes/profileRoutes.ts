import express from 'express';
import multer from 'multer';
import { getProfile, updateProfile } from '../controllers/profileController';
import authMiddleware from '../middleware/authMiddleware';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, upload.single('avatar'), updateProfile);

export default router;
