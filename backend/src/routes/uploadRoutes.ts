import express from 'express';
import { uploadSelfie, uploadGhanaCard } from '../controllers/upload.controller';
import { upload } from '../middlewares/upload.middleware'; // Multer config

const router = express.Router();

// Route for uploading selfie
router.post('/selfie', upload.single('selfie'), uploadSelfie);

// Route for uploading Ghana Card
router.post('/ghana-card', upload.single('ghanaCard'), uploadGhanaCard);

export default router;
