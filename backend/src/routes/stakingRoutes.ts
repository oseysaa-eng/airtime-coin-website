// src/routes/stakingRoutes.ts
import { Router } from 'express';
import { createStake, listStakes, unstake } from '../controllers/stakingController';
import authMiddleware from "../middleware/authMiddleware";



const router = Router();

router.post('/create', authMiddleware, createStake);
router.post('/unstake/:stakeId', authMiddleware, unstake);
router.get('/list', authMiddleware, listStakes);

export default router;
