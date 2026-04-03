import express from "express";

import {
  registerUser,
  loginUser,
  getMe,
} from "../controllers/authController";

import authMiddleware from "../middleware/authMiddleware";
import { trackDevice } from "../middleware/trackDevice";

const router = express.Router();

/**
 * Register (Public Beta)
 */
router.post(
  "/register",
  trackDevice,
  registerUser
);

/**
 * Login
 */
router.post(
  "/login",
  trackDevice,
  loginUser
);

/**
 * Get current user
 */
router.get(
  "/me",
  authMiddleware,
  getMe
);

export default router;