import { NativeModules, NativeEventEmitter } from "react-native";
import { v4 as uuidv4 } from "uuid";
import { getSocket } from "./socket"; // ✅ FIXED

const { CallDetector } = NativeModules;

const emitter = CallDetector
  ? new NativeEventEmitter(CallDetector)
  : null;

/* =============================
   STATE
============================= */
let isOverlayRunning = false;
let currentNumber: string | null = null;
let activeSessionId: string | null = null;
let isInitialized = false;
let lastCallTimestamp = 0;

/* =============================
   INIT
============================= */
export const initCallMining = (onStart?: any, onEnd?: any) => {
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

  /* =============================
     CLEAN OLD LISTENERS
  ============================= */
  try {
    emitter.removeAllListeners("CALL_STARTED");
    emitter.removeAllListeners("CALL_ENDED");
  } catch {}

  /* =============================
     CALL START
  ============================= */
  const startSub = emitter.addListener("CALL_STARTED", async (data = {}) => {
    const now = Date.now();

    const name = data.name || "Unknown Caller";
    const number = data.number || "Unknown";
    const photo = data.photo || null;

    console.log("📞 CALL START:", number);

    /* 🚫 PREVENT RAPID DUPLICATES (1.5s window) */
    if (now - lastCallTimestamp < 1500) {
      console.log("⚠️ Rapid duplicate ignored");
      return;
    }

    lastCallTimestamp = now;

    /* 🚫 BLOCK IF ACTIVE SESSION EXISTS */
    if (activeSessionId) {
      console.log("⚠️ Session already active, ignoring new start");
      return;
    }

    /* =============================
       CREATE SESSION
    ============================= */
    activeSessionId = uuidv4();
    currentNumber = number;

    console.log("🆔 Session:", activeSessionId);

    /* =============================
       START OVERLAY
    ============================= */
    if (!isOverlayRunning) {
      try {
        CallDetector.startOverlay(name, number, photo, "checking");
        isOverlayRunning = true;
      } catch (e) {
        console.log("Overlay start error:", e);
      }
    }

    /* =============================
       EMIT TO BACKEND
    ============================= */
    try {
      const socket = await getSocket();

      if (socket?.connected) {
        socket.emit("call_start", {
          sessionId: activeSessionId,
          number,
        });

        console.log("🚀 call_start sent");
      } else {
        console.log("⚠️ Socket not connected (start)");
      }
    } catch (e) {
      console.log("Socket start error:", e);
    }

    onStart && onStart(data);
  });

  /* =============================
     CALL END
  ============================= */
  const endSub = emitter.addListener("CALL_ENDED", async (data = {}) => {
    console.log("📞 CALL END");

    const duration = data?.duration || 0;

    if (!activeSessionId) {
      console.log("⚠️ No active session → ignored");
      return;
    }

    const sessionId = activeSessionId;

    console.log("🛑 Ending session:", sessionId);

    /* =============================
       EMIT END
    ============================= */
    try {
      const socket = await getSocket();

      if (socket?.connected) {
        socket.emit("call_end", {
          sessionId,
          duration,
        });

        console.log("🚀 call_end sent");
      } else {
        console.log("⚠️ Socket not connected (end)");
      }
    } catch (e) {
      console.log("Socket end error:", e);
    }

    /* =============================
       STOP OVERLAY (SAFE DELAY)
    ============================= */
    setTimeout(() => {
      try {
        CallDetector.stopOverlay();
      } catch {}
    }, 1200);

    /* =============================
       RESET STATE
    ============================= */
    activeSessionId = null;
    currentNumber = null;
    isOverlayRunning = false;

    onEnd && onEnd(duration);
  });

  /* =============================
     START NATIVE LISTENER
  ============================= */
  try {
    CallDetector.start();
  } catch (e) {
    console.log("Start listener error:", e);
  }

  /* =============================
     CLEANUP (OPTIONAL)
  ============================= */
  return () => {
    console.log("🧹 Cleaning CallMining");

    try {
      startSub.remove();
      endSub.remove();
      CallDetector.stopListening?.();
    } catch {}

    isInitialized = false;
  };
};