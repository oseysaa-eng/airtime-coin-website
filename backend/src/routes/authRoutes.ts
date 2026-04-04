import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  refreshAuthToken,
} from "../controllers/authController";

import authMiddleware from "../middleware/authMiddleware";
import { trackDevice } from "../middleware/trackDevice";

const router = express.Router();

/* AUTH */
router.post("/register", trackDevice, registerUser);
router.post("/login", trackDevice, loginUser);
router.post("/refresh", refreshAuthToken);

/* USER */
router.get("/me", authMiddleware, getMe);

/* OPTIONAL */
router.post("/logout", authMiddleware, (req, res) => {
  res.json({ message: "Logged out" });
});

export default router;