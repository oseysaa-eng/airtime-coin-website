package com.airtimecoin.app;

import android.accessibilityservice.AccessibilityService;
import android.view.accessibility.AccessibilityEvent;
import android.content.Intent;
import android.util.Log;
import android.os.Build;

public class CallAccessibilityService extends AccessibilityService {

    private long callStart = 0;

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {

        if (event == null) return;

        String pkg = String.valueOf(event.getPackageName());

        // 📞 Detect phone app (Samsung/Android)
        if (pkg.contains("com.android.incallui") || pkg.contains("com.samsung.android.incallui")) {

            int type = event.getEventType();

            // CALL START (UI visible)
            if (type == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {

                if (callStart == 0) {

                    callStart = System.currentTimeMillis();
                    Log.d("ATC", "CALL START DETECTED");

                    try {
                        Intent intent = new Intent(this, OverlayService.class);

                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            startForegroundService(intent);
                        } else {
                            startService(intent);
                        }

                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }

        } else {
            // CALL ENDED (left phone UI)
            if (callStart != 0) {

                long duration = (System.currentTimeMillis() - callStart) / 1000;

                Log.d("ATC", "CALL ENDED: " + duration);

                Intent stop = new Intent(this, OverlayService.class);
                stopService(stop);

                callStart = 0;
            }
        }
    }

    @Override
    public void onInterrupt() {}
}