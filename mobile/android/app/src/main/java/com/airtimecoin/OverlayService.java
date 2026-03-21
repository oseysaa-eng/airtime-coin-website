package com.airtimecoin.app;

import android.app.*;
import android.content.Intent;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.IBinder;
import android.provider.Settings;
import android.view.*;
import android.widget.TextView;

import androidx.core.app.NotificationCompat;

public class OverlayService extends Service {

    private WindowManager windowManager;
    private View overlayView;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {

        Notification notification = new NotificationCompat.Builder(this, "call_channel")
                .setContentTitle("Call Mining Active")
                .setContentText("Tracking your call...")
                .setSmallIcon(android.R.drawable.sym_call_incoming)
                .build();

        startForeground(1, notification);

        showOverlay();

        return START_STICKY;
    }

    private void showOverlay() {

        try {

            if (!Settings.canDrawOverlays(this)) {
                stopSelf();
                return;
            }

            // ✅ Prevent duplicate overlay crash
            if (overlayView != null) return;

            windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);

            TextView text = new TextView(this);
            text.setText("📞 Mining...");
            text.setTextSize(18);
            text.setBackgroundColor(0xAA000000);
            text.setTextColor(0xFFFFFFFF);
            text.setPadding(20, 20, 20, 20);

            int layoutType;

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                layoutType = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
            } else {
                layoutType = WindowManager.LayoutParams.TYPE_PHONE;
            }

            WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    layoutType,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                            | WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                    PixelFormat.TRANSLUCENT
            );

            params.gravity = Gravity.TOP | Gravity.START;
            params.x = 50;
            params.y = 200;

            overlayView = text;

            windowManager.addView(overlayView, params);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();

        try {
            if (overlayView != null && windowManager != null) {
                windowManager.removeView(overlayView);
                overlayView = null;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

            NotificationChannel channel = new NotificationChannel(
                    "call_channel",
                    "Call Mining",
                    NotificationManager.IMPORTANCE_LOW
            );

            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}