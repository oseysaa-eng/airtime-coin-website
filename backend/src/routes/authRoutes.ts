import express from "express";
import {
    getMe,
    loginUser,
    registerUser,
} from "../controllers/authController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getMe);

export default router;


