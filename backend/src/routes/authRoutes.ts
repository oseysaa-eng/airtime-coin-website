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




const router = express.Router();

/* AUTH */
router.post("/register", trackDevice, registerUser);
router.post("/login", trackDevice, loginUser);
router.post("/refresh", refreshAuthToken);
router.post("/logout", authMiddleware, logoutUser);

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