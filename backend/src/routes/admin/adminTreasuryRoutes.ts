import express from "express";
import adminAuth from "../../middleware/adminAuth";
import Treasury from "../../models/Treasury";

const router = express.Router();

router.get("/", adminAuth, async (_req, res) => {
  const treasury =
    (await Treasury.findOne()) || (await Treasury.create({}));

  res.json(treasury);
});

export default router;