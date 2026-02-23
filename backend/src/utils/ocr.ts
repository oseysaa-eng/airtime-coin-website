// src/utils/ocr.ts
import fs from "fs";
import { createWorker } from "tesseract.js";

export async function runOCRFromBuffer(buffer: Buffer) {
  const worker = createWorker({
    logger: m => { /* optional progress */ }
  });
  await worker.load();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  // write to temp file
  const tmpPath = `/tmp/ocr-${Date.now()}.jpg`;
  fs.writeFileSync(tmpPath, buffer);
  const { data: { text } } = await worker.recognize(tmpPath);
  await worker.terminate();
  try { fs.unlinkSync(tmpPath); } catch(e){}
  return text;
}
