import { NativeModules, NativeEventEmitter } from "react-native";
import { v4 as uuidv4 } from "uuid";

const { CallDetector } = NativeModules;

const emitter = CallDetector
  ? new NativeEventEmitter(CallDetector)
  : null;

const API_URL = "https://atc-backend-cn4f.onrender.com";

let isOverlayRunning = false;
let currentNumber = null;
let activeSessionId = null; // ✅ GLOBAL SESSION TRACK

export const initCallMining = (onStart, onEnd) => {

  if (!CallDetector || !emitter) {
    console.warn("❌ CallDetector not found");
    return () => {};
  }

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

    // 🚫 BLOCK DUPLICATES PROPERLY
    if (currentNumber === number && activeSessionId) {
      console.log("⚠️ Duplicate call ignored");
      return;
    }

    // ✅ CREATE SESSION ONLY ONCE
    activeSessionId = uuidv4();
    currentNumber = number;

    /* ---------- START OVERLAY ---------- */
    if (!isOverlayRunning) {
      try {
        CallDetector.startOverlay(name, number, photo, "checking");
        isOverlayRunning = true;
      } catch (e) {
        console.log("Overlay start error:", e);
      }
    }

    /* ---------- SEND TO BACKEND ---------- */
    try {
      global.socket?.emit("call_start", {
        sessionId: activeSessionId,
        number,
      });
    } catch (e) {
      console.log("Socket start error:", e);
    }

    /* ---------- SPAM CHECK ---------- */
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${API_URL}/api/call/check-number`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const result = await res.json();

      if (currentNumber === number) {
        CallDetector.updateOverlay(result.status);
      }

    } catch (e) {
      console.log("⚠️ Spam check error:", e);

      try {
        CallDetector.updateOverlay("unknown");
      } catch {}
    }

    onStart && onStart(data);
  });

  /* ================================
     CALL ENDED
  ================================= */
  const endSub = emitter.addListener("CALL_ENDED", (data = {}) => {
    console.log("📞 CALL ENDED");

    const duration = data?.duration || 0;

    // ❌ NO SESSION → IGNORE (prevents backend crash)
    if (!activeSessionId) {
      console.log("⚠️ No active session, skipping");
      return;
    }

    /* ---------- DELAY OVERLAY STOP ---------- */
    setTimeout(() => {
      try {
        CallDetector.stopOverlay();
      } catch (e) {
        console.log("Overlay stop error:", e);
      }
    }, 2000);

    /* ---------- SEND END EVENT ---------- */
    try {
      global.socket?.emit("call_end", {
        sessionId: activeSessionId,
        duration,
      });
    } catch (e) {
      console.log("Socket end error:", e);
    }

    // ✅ RESET STATE SAFELY
    activeSessionId = null;
    isOverlayRunning = false;
    currentNumber = null;

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
     CLEANUP
  ================================= */
  return () => {
    console.log("🧹 Cleaning CallDetector");

    try {
      startSub.remove();
      endSub.remove();

      emitter.removeAllListeners("CALL_STARTED");
      emitter.removeAllListeners("CALL_ENDED");

      CallDetector.stopListening?.();
      CallDetector.stopOverlay();

    } catch (e) {
      console.log("Cleanup error:", e);
    }

    activeSessionId = null;
    isOverlayRunning = false;
    currentNumber = null;
  };
};