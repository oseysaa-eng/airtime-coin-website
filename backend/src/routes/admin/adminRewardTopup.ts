// src/routes/admin/adminRewardTopup.ts
import express from "express";
import adminAuth from "../../middleware/adminAuth";
import AdminAuditLog from "../../models/AdminAuditLog";
import RewardPool from "../../models/RewardPool";
import { mintATC } from "../../services/atcSupplyService";

const router = express.Router();

router.post("/:type/topup", adminAuth, async (req: any, res) => {
  const { type } = req.params;
  const { amountATC } = req.body;

  if (!amountATC || amountATC <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  const pool =
    (await RewardPool.findOne({ type })) ||
    (await RewardPool.create({ type }));
    
        await mintATC(amountATC); // 🔒 SUPPLY CHECK

        pool.balanceATC += amountATC;
        await pool.save();

  // 🔐 AUDIT LOG
  await AdminAuditLog.create({
    adminId: req.admin._id,
    action: "REWARD_POOL_TOPUP",
    meta: {
      pool: type,
      amountATC,
      newBalance: pool.balanceATC,
    },
  });

  res.json({
    success: true,
    pool,
  });
});

export default router;
