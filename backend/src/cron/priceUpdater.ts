import cron from "node-cron";
import { calculateATCPrice } from "../services/pricingEngine";

/**
 * Runs every 30 minutes
 * Dynamically updates ATC price
 */
cron.schedule("*/30 * * * *", async () => {
  try {
    console.log("🔄 Updating ATC price...");

    await calculateATCPrice();

    console.log("✅ ATC price updated");
  } catch (err) {
    console.error("❌ ATC price update failed:", err);
  }
});