import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  refreshAuthToken,
  logoutUser,
} from "../controllers/authController";

import authMiddleware from "../middleware/authMiddleware";
import { trackDevice } from "../middleware/trackDevice";
import { authLimiter } from "../middleware/rateLimiter";



const router = express.Router();

/* AUTH */
router.post("/register", authLimiter, trackDevice, registerUser);
router.post("/login", authLimiter, trackDevice, loginUser);
router.post("/refresh", authLimiter, refreshAuthToken);
router.post("/logout", authLimiter, authMiddleware, logoutUser);

/* USER */
router.get("/me", authMiddleware, getMe);

/* OPTIONAL */

router.post("/logout", authMiddleware, async (req: any, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      refreshToken: null,
    });

    res.json({ message: "Logged out" });

  } catch (err) {
    res.status(500).json({ message: "Logout failed" });
  }
});

export default router;