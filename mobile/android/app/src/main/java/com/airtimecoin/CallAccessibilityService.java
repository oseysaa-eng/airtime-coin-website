package com.airtimecoin.app;

import android.accessibilityservice.AccessibilityService;
import android.view.accessibility.AccessibilityEvent;
import android.content.Intent;
import android.os.Build;

public class CallAccessibilityService extends AccessibilityService {

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {

        if (event == null) return;

        int type = event.getEventType();

        if (type == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {

            CharSequence pkg = event.getPackageName();

            if (pkg != null && pkg.toString().contains("com.android.dialer")) {

                // 🚀 CALL SCREEN DETECTED
                Intent intent = new Intent(this, OverlayService.class);
                intent.putExtra("name", "Incoming Call");
                intent.putExtra("number", "Detecting...");
                intent.putExtra("spam", "checking");

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
    startService(intent);
} else {
    startService(intent);
}

            }
        }
    }

    @Override
    public void onInterrupt() {}
}