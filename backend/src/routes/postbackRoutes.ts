import express from "express";
import cpx from "./postback/cpx";
import unity from "./postback/unity";

const router = express.Router();

router.use("/cpx", cpx);
router.use("/unity", unity);

export default router;
