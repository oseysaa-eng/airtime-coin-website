package com.airtimecoin.app;

import android.app.*;
import android.content.Intent;
import android.graphics.PixelFormat;
import android.os.IBinder;
import android.view.*;
import android.widget.TextView;
import android.os.Build;
import android.provider.Settings;

public class OverlayService extends Service {

    private WindowManager windowManager;
    private View overlayView;

    @Override
    public void onCreate() {
        super.onCreate();

        // ✅ REQUIRED: Proper notification
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

            String channelId = "overlay_channel";

            NotificationChannel channel = new NotificationChannel(
                channelId,
                "Overlay Service",
                NotificationManager.IMPORTANCE_LOW
            );

            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);

            Notification notification = new Notification.Builder(this, channelId)
                .setContentTitle("ATC Running")
                .setContentText("Call mining active")
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .build();

            startForeground(1, notification);
        }

        // ✅ Check permission
        if (!Settings.canDrawOverlays(this)) {
            stopSelf();
            return;
        }

        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);

        TextView text = new TextView(this);
        text.setText("📞 Mining...");
        text.setTextSize(18);
        text.setBackgroundColor(0xAA000000);
        text.setTextColor(0xFFFFFFFF);
        text.setPadding(20, 20, 20, 20);

        int layoutFlag;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            layoutFlag = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
        } else {
            layoutFlag = WindowManager.LayoutParams.TYPE_PHONE;
        }

        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutFlag,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        );

        params.gravity = Gravity.TOP | Gravity.START;
        params.x = 50;
        params.y = 200;

        overlayView = text;

        windowManager.addView(overlayView, params);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (overlayView != null) windowManager.removeView(overlayView);
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}