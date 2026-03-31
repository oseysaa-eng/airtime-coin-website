import { NativeModules, NativeEventEmitter } from "react-native";
import { v4 as uuidv4 } from "uuid";

const { CallDetector } = NativeModules;

const emitter = CallDetector
  ? new NativeEventEmitter(CallDetector)
  : null;

const API_URL = "https://atc-backend-cn4f.onrender.com";

let isOverlayRunning = false;
let currentNumber = null;
let activeSessionId = null;
let isInitialized = false;

export const initCallMining = (onStart, onEnd) => {

  if (!CallDetector || !emitter) {
    console.warn("❌ CallDetector not found");
    return () => {};
  }

  if (isInitialized) {
    console.log("⚠️ CallMining already initialized");
    return () => {};
  }

  isInitialized = true;

  console.log("✅ CallMining initialized");

  /* ================================
     CLEAR OLD LISTENERS
  ================================= */
  try {
    emitter.removeAllListeners("CALL_STARTED");
    emitter.removeAllListeners("CALL_ENDED");
  } catch {}

  /* ================================
     CALL STARTED
  ================================= */

  const startSub = emitter.addListener("CALL_STARTED", async (data = {}) => {
  console.log("📞 CALL STARTED", data);

  const name = data.name || "Unknown Caller";
  const number = data.number || "Unknown";
  const photo = data.photo || null;

  // 🚫 BLOCK TRUE DUPLICATES ONLY
  if (currentNumber === number && activeSessionId) {
    console.log("⚠️ Duplicate ignored:", number);
    return;
  }

  // ✅ SET NUMBER FIRST (CRITICAL FIX)
  currentNumber = number;

  // ✅ CREATE SESSION
  activeSessionId = uuidv4();
  console.log("🆔 SESSION CREATED:", activeSessionId);

  /* ---------- START OVERLAY ---------- */
  if (!isOverlayRunning) {
    try {
      CallDetector.startOverlay(name, number, photo, "checking");
      isOverlayRunning = true;
    } catch (e) {
      console.log("Overlay start error:", e);
    }
  }

  /* ---------- EMIT TO BACKEND ---------- */
  try {
    if (global.socket?.connected) {
      console.log("🚀 EMIT CALL START");

      global.socket.emit("call_start", {
        sessionId: activeSessionId,
        number,
      });

    } else {
      console.log("⚠️ Socket not connected (start)");
    }
  } catch (e) {
    console.log("Socket start error:", e);
  }

  onStart && onStart(data);
});

  /* ================================
     CALL ENDED
  ================================= */
const endSub = emitter.addListener("CALL_ENDED", (data = {}) => {
  console.log("📞 CALL ENDED");

  const duration = data?.duration || 0;

  if (!activeSessionId) {
    console.log("❌ No session, skipping");
    return;
  }

  console.log("🛑 Ending session:", activeSessionId);

  try {
    if (global.socket?.connected) {
      console.log("🚀 EMIT CALL END");

      global.socket.emit("call_end", {
        sessionId: activeSessionId,
        duration,
      });
    } else {
      console.log("⚠️ Socket not connected (end)");
    }
  } catch (e) {
    console.log("Socket end error:", e);
  }

  setTimeout(() => {
    try {
      CallDetector.stopOverlay();
    } catch {}
  }, 1500);

  // ✅ RESET
  activeSessionId = null;
  currentNumber = null;
  isOverlayRunning = false;

  onEnd && onEnd(duration);
});

  /* ================================
     START LISTENER
  ================================= */
  try {
    CallDetector.start();
  } catch (e) {
    console.log("Start listener error:", e);
  }

  /* ================================
     NO CLEANUP (PERSISTENT ENGINE)
  ================================= */
  return () => {
    console.log("⚠️ Cleanup skipped (persistent)");
  };
};