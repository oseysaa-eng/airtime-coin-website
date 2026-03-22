package com.airtimecoin.app;

import android.app.*;
import android.content.Intent;
import android.graphics.PixelFormat;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.provider.Settings;
import android.view.*;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.core.app.NotificationCompat;

public class OverlayService extends Service {

    private WindowManager windowManager;
    private View overlayView;

    private Handler handler = new Handler();
    private int seconds = 0;
    private double earningsValue = 0.0;

    // ✅ Keep references (IMPORTANT)
    private TextView timerView;
    private TextView earningsView;

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
                .setPriority(NotificationCompat.PRIORITY_LOW)
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

            if (overlayView != null) return;

            windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);

            /* ---------------- UI ---------------- */

            LinearLayout layout = new LinearLayout(this);
            layout.setOrientation(LinearLayout.VERTICAL);
            layout.setPadding(30, 25, 30, 25);

            // background
            GradientDrawable bg = new GradientDrawable();
            bg.setColor(0xEE1A1A1A);
            bg.setCornerRadius(50);
            bg.setStroke(2, 0x2200FFAA);
            layout.setBackground(bg);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                layout.setElevation(20);
            }

            // title
            TextView title = new TextView(this);
            title.setText("📞 Mining Active");
            title.setTextColor(0xFFFFFFFF);
            title.setTextSize(15);
            title.setTypeface(null, Typeface.BOLD);

            // timer
            timerView = new TextView(this);
            timerView.setText("⏱ 00:00");
            timerView.setTextColor(0xFF00FFAA);
            timerView.setTextSize(16);
            timerView.setTypeface(null, Typeface.BOLD);

            // earnings
            earningsView = new TextView(this);
            earningsView.setText("💰 0.000 ATC");
            earningsView.setTextColor(0xFFFFD700);
            earningsView.setTextSize(14);

            // status (optional premium touch)
            TextView status = new TextView(this);
            status.setText("⚡ Earning in progress...");
            status.setTextColor(0xFF888888);
            status.setTextSize(11);

            layout.addView(title);
            layout.addView(timerView);
            layout.addView(earningsView);
            layout.addView(status);

            overlayView = layout;

            /* ---------------- POSITION ---------------- */

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

            params.gravity = Gravity.TOP | Gravity.END;
            params.x = 30;
            params.y = 200;

            /* ---------------- DRAG ---------------- */

            layout.setOnTouchListener(new View.OnTouchListener() {

                private int initialX, initialY;
                private float initialTouchX, initialTouchY;

                @Override
                public boolean onTouch(View v, MotionEvent event) {

                    switch (event.getAction()) {

                        case MotionEvent.ACTION_DOWN:
                            initialX = params.x;
                            initialY = params.y;
                            initialTouchX = event.getRawX();
                            initialTouchY = event.getRawY();
                            return true;

                        case MotionEvent.ACTION_MOVE:
                            params.x = initialX - (int) (event.getRawX() - initialTouchX);
                            params.y = initialY + (int) (event.getRawY() - initialTouchY);
                            windowManager.updateViewLayout(overlayView, params);
                            return true;
                    }
                    return false;
                }
            });

            windowManager.addView(overlayView, params);

            /* ---------------- TIMER + EARNINGS ---------------- */

            seconds = 0;
            earningsValue = 0.0;

            handler.post(new Runnable() {
                @Override
                public void run() {

                    seconds++;

                    // 💰 earning logic
                    earningsValue += 0.001;

                    int mins = seconds / 60;
                    int secs = seconds % 60;

                    timerView.setText("⏱ " + mins + ":" + String.format("%02d", secs));
                    earningsView.setText("💰 " + String.format("%.3f", earningsValue) + " ATC");

                    handler.postDelayed(this, 1000);
                }
            });

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();

        try {
            handler.removeCallbacksAndMessages(null);

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