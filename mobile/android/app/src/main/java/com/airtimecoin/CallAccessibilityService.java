package com.airtimecoin.app;

import android.accessibilityservice.AccessibilityService;
import android.view.accessibility.AccessibilityEvent;
import android.util.Log;

public class CallAccessibilityService extends AccessibilityService {

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {

        if (event == null) return;

        if (event.getEventType() == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {

            CharSequence pkg = event.getPackageName();

            if (pkg == null) return;

            String packageName = pkg.toString();

            if (
                packageName.contains("dialer") ||
                packageName.contains("call") ||
                packageName.contains("incallui")
            ) {
                Log.d("CALL_DEBUG", "📲 Call UI detected: " + packageName);

                // 🚫 DO NOT start overlay here
            }
        }
    }

    @Override
    public void onInterrupt() {}
}