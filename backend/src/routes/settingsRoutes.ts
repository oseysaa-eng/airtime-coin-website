import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import authMiddleware from '../middleware/authMiddleware';
const router = express.Router();

router.get('/', authMiddleware, getSettings);
router.put('/', authMiddleware, updateSettings);

export default router;



