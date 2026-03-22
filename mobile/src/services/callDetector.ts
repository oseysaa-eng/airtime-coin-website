import { NativeModules, NativeEventEmitter } from "react-native";

const { CallDetector } = NativeModules;

const emitter = CallDetector
  ? new NativeEventEmitter(CallDetector)
  : null;

const API_URL = "https://atc-backend-cn4f.onrender.com"; // ✅ FIX THIS

let isOverlayRunning = false;
let currentNumber = null; // ✅ prevent duplicate checks

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

    // ✅ Prevent duplicate processing
    if (currentNumber === number) return;
    currentNumber = number;

    /* ---------- START OVERLAY FAST ---------- */
    if (!isOverlayRunning) {
      try {
        CallDetector.startOverlay(name, number, photo, "checking");
        isOverlayRunning = true;
      } catch (e) {
        console.log("Overlay start error:", e);
      }
    }

    /* ---------- SPAM CHECK (ASYNC) ---------- */
    try {

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const res = await fetch(`${API_URL}/api/call/check-number`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ number }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      const result = await res.json();

      // ✅ Only update if still same call
      if (currentNumber === number) {
        CallDetector.updateOverlay(result.status);
      }

    } catch (e) {
      console.log("⚠️ Spam check error:", e);

      // fallback → mark as unknown
      try {
        CallDetector.updateOverlay("unknown");
      } catch {}
    }

    if (onStart) onStart(data);
  });

  /* ================================
     CALL ENDED
  ================================= */
  const endSub = emitter.addListener("CALL_ENDED", (data = {}) => {
    console.log("📞 CALL ENDED");

    try {
      CallDetector.stopOverlay();
    } catch (e) {
      console.log("Overlay stop error:", e);
    }

    isOverlayRunning = false;
    currentNumber = null;

    if (onEnd) onEnd(data.duration || 0);
  });

  /* ================================
     START NATIVE LISTENER
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

      if (CallDetector.stopListening) {
        CallDetector.stopListening();
      }

      CallDetector.stopOverlay();

    } catch (e) {
      console.log("Cleanup error:", e);
    }

    isOverlayRunning = false;
    currentNumber = null;
  };
};