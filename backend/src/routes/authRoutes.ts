import express from "express";

import {
  registerUser,
  loginUser,
  getMe,
} from "../controllers/authController";

import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

/**
 * Register
 */
router.post(
  "/register",
  registerUser
);

/**
 * Login
 */
router.post(
  "/login",
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