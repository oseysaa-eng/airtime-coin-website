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
 * Register
 */
router.post(
  "/register",
  registerUser, trackDevice
);

/**
 * Login
 */
router.post(
  "/login",
  loginUser, trackDevice
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

