package com.airtimecoin.app;

import android.accessibilityservice.AccessibilityService;
import android.content.Intent;
import android.os.Build;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import android.util.Log;

import java.util.List;

public class CallAccessibilityService extends AccessibilityService {

    private boolean overlayRunning = false;

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {

        if (event == null || event.getPackageName() == null) return;

        if (event.getEventType() != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED &&
            event.getEventType() != AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED) {
            return;
        }

        String pkg = event.getPackageName().toString();

        // 🎯 Detect call UI apps
        if (
                pkg.contains("dialer") ||
                pkg.contains("call") ||
                pkg.contains("incallui")
        ) {

            Log.d("CALL_DEBUG", "📲 Call UI detected: " + pkg);

            AccessibilityNodeInfo root = getRootInActiveWindow();
            if (root == null) return;

            String detectedText = extractCallerText(root);

            Log.d("CALL_DEBUG", "👤 Detected: " + detectedText);

            if (!overlayRunning) {
                startOverlay(detectedText);
                overlayRunning = true;
            }

        } else {
            // ❌ Not call screen → stop overlay
            if (overlayRunning) {
                stopOverlay();
                overlayRunning = false;
            }
        }
    }

    /* ============================
       EXTRACT CALLER INFO
    ============================ */
    private String extractCallerText(AccessibilityNodeInfo root) {

        try {
            List<AccessibilityNodeInfo> nodes = root.findAccessibilityNodeInfosByText("");

            for (AccessibilityNodeInfo node : nodes) {

                if (node == null) continue;

                CharSequence text = node.getText();

                if (text != null) {
                    String value = text.toString();

                    // Filter realistic caller info
                    if (value.length() > 2 && value.length() < 40) {
                        return value;
                    }
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return "Unknown Caller";
    }

    /* ============================
       START OVERLAY
    ============================ */
    private void startOverlay(String callerName) {

        try {
            Intent intent = new Intent(this, OverlayService.class);

            intent.putExtra("name", callerName);
            intent.putExtra("number", callerName);
            intent.putExtra("photo", "");
            intent.putExtra("spam", "checking");

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(intent);
            } else {
                startService(intent);
            }

            Log.d("OVERLAY_DEBUG", "✅ Overlay started from accessibility");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /* ============================
       STOP OVERLAY
    ============================ */
    private void stopOverlay() {

        try {
            Intent intent = new Intent(this, OverlayService.class);
            intent.putExtra("stop", true);
            startService(intent);

            Log.d("OVERLAY_DEBUG", "❌ Overlay stopped from accessibility");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onInterrupt() {}
}