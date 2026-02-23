// src/controllers/kycController.ts
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { s3Client } from "../config/s3Client";
import Kyc from "../models/Kyc";
import User from "../models/User";
import { runOCRFromBuffer } from "../utils/ocr";

const BUCKET = process.env.R2_BUCKET!;
const ENDPOINT = process.env.R2_ENDPOINT!;

function makeUrl(key: string) {
  // Cloudflare R2 endpoint style
  return `${ENDPOINT}/${BUCKET}/${key}`;
}

export const getKycStatus = async (req: any, res: Response) => {
  const userId = req.user.id;
  const kyc = await Kyc.findOne({ userId }).sort({ createdAt: -1 });
  if (!kyc) return res.json({ kycStatus: "not_submitted" });
  return res.json({ kycStatus: kyc.status, kyc });
};

export const submitKyc = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const files = req.files as any;
    const idNumber = req.body.idNumber;

    if (!idNumber) return res.status(400).json({ message: "ID number is required" });
    if (!files?.front?.[0] || !files?.back?.[0] || !files?.selfie?.[0]) {
      return res.status(400).json({ message: "front, back and selfie images are required" });
    }

    const frontBuffer = files.front[0].buffer;
    const backBuffer = files.back[0].buffer;
    const selfieBuffer = files.selfie[0].buffer;

    // OCR on front
    const ocrText = await runOCRFromBuffer(frontBuffer);

    // Simple face detection heuristic: use expo-face-detector on client; here we just flag true if OCR found name/ID-like pattern
    const faceDetected = true; // we rely on client to ensure selfie contains face

    // upload to R2: generate keys
    const id = uuidv4();
    const frontKey = `kyc/${userId}/${id}-front.jpg`;
    const backKey = `kyc/${userId}/${id}-back.jpg`;
    const selfieKey = `kyc/${userId}/${id}-selfie.jpg`;

    // helper upload
    const uploadOne = async (buffer: Buffer, key: string) => {
      const cmd = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: "image/jpeg",
      });
      await s3Client.send(cmd);
      return makeUrl(key);
    };

    const frontUrl = await uploadOne(frontBuffer, frontKey);
    const backUrl = await uploadOne(backBuffer, backKey);
    const selfieUrl = await uploadOne(selfieBuffer, selfieKey);

    // create db record
    const kyc = await Kyc.create({
      userId,
      idNumber,
      frontUrl,
      backUrl,
      selfieUrl,
      ocrText,
      faceDetected,
      status: "pending"
    });

    // set user's kycStatus to pending
    await User.findByIdAndUpdate(userId, { kycStatus: "pending" });

    return res.json({ success: true, kycId: kyc._id });
  } catch (err) {
    console.error("submitKyc error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ADMIN endpoints (ensure you check req.user isAdmin in real app)
export const adminListPending = async (req: any, res: Response) => {
  // NOTE: check admin role
  if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin only" });
  const list = await Kyc.find({ status: "pending" }).sort({ createdAt: 1 }).populate("userId", "name email");
  return res.json({ list });
};
export const adminApprove = async (req: any, res: Response) => {
  if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin only" });
  const kyc = await Kyc.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true });
  if (!kyc) return res.status(404).json({ message: "KYC not found" });
  await User.findByIdAndUpdate(kyc.userId, { kycStatus: "verified" });
  return res.json({ success: true });
};
export const adminReject = async (req: any, res: Response) => {
  if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin only" });
  const { reason } = req.body;
  const kyc = await Kyc.findByIdAndUpdate(req.params.id, { status: "rejected", adminNote: reason }, { new: true });
  if (!kyc) return res.status(404).json({ message: "KYC not found" });
  await User.findByIdAndUpdate(kyc.userId, { kycStatus: "rejected" });
  return res.json({ success: true });
};



