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

        // ✅ SAFE for all Android versions
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

            // prevent duplicate overlay
            if (overlayView != null) return;

            windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);

            /* ---------------- UI DESIGN ---------------- */

            LinearLayout layout = new LinearLayout(this);
            layout.setOrientation(LinearLayout.VERTICAL);
            layout.setPadding(30, 25, 30, 25);

            // rounded background
            GradientDrawable bg = new GradientDrawable();
            bg.setColor(0xDD111111);
            bg.setCornerRadius(40);
            layout.setBackground(bg);

            // title
            TextView title = new TextView(this);
            title.setText("📞 Call Mining");
            title.setTextColor(0xFFFFFFFF);
            title.setTextSize(16);
            title.setTypeface(null, Typeface.BOLD);

            // timer
            TextView timer = new TextView(this);
            timer.setText("⏱ 00:00");
            timer.setTextColor(0xFF00FFAA);
            timer.setTextSize(14);

            // earnings
            TextView earnings = new TextView(this);
            earnings.setText("💰 0.00 ATC");
            earnings.setTextColor(0xFFFFD700);
            earnings.setTextSize(13);

            layout.addView(title);
            layout.addView(timer);
            layout.addView(earnings);

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

            // top-right like Truecaller
            params.gravity = Gravity.TOP | Gravity.END;
            params.x = 30;
            params.y = 200;

            /* ---------------- DRAG SUPPORT ---------------- */

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

            /* ---------------- TIMER ---------------- */

            seconds = 0;

            handler.post(new Runnable() {
                @Override
                public void run() {
                    seconds++;

                    if (overlayView instanceof LinearLayout) {
                        LinearLayout layout = (LinearLayout) overlayView;
                        TextView timerView = (TextView) layout.getChildAt(1);

                        int mins = seconds / 60;
                        int secs = seconds % 60;

                        timerView.setText("⏱ " + mins + ":" + String.format("%02d", secs));
                    }

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