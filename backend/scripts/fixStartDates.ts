import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

// Load your DB connection string from .env
const MONGO_URI = process.env.MONGO_URI || "";

async function fixStartDates() {
  try {
    console.log("Connecting to MongoDB…");
    await mongoose.connect(MONGO_URI);
    console.log("Connected.");

    const stakes = mongoose.connection.collection("stakes");

    console.log("Updating documents…");

    const result = await stakes.updateMany(
      { startDate: { $exists: false } },     // condition
      { $set: { startDate: new Date() } }    // update
    );

    console.log(`✔ Updated ${result.modifiedCount} documents.`);
  } catch (err) {
    console.error("❌ ERROR:", err);
  } finally {
    mongoose.disconnect();
    console.log("Disconnected.");
  }
}

fixStartDates();
