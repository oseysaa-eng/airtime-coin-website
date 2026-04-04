package com.airtimecoin.app;

import android.app.*;
import android.content.Intent;
import android.graphics.PixelFormat;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.*;
import android.provider.Settings;
import android.view.*;
import android.widget.*;
import androidx.core.app.NotificationCompat;
import android.util.Log;

public class OverlayService extends Service {

    private WindowManager windowManager;
    private View overlayView;
    private LinearLayout expandedView;

    private Handler handler = new Handler(Looper.getMainLooper());

    private int seconds = 0;
    private double earningsValue = 0.0;

    private TextView timerView;
    private TextView earningsView;
    private TextView spamTagView;

    private boolean isExpanded = false;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {

        startForeground(1, buildNotification()); // ✅ REQUIRED

        if (intent != null && intent.hasExtra("stop")) {
            stopSelf();
            return START_NOT_STICKY;
        }

        showOverlay(
                intent != null ? intent.getStringExtra("name") : null,
                intent != null ? intent.getStringExtra("number") : null,
                intent != null ? intent.getStringExtra("photo") : null,
                intent != null ? intent.getStringExtra("spam") : null
        );

        return START_STICKY;
    }

    private void showOverlay(String name, String number, String photo, String spam) {

        try {

            if (!Settings.canDrawOverlays(this)) {
                Intent intent = new Intent(
                        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                        Uri.parse("package:" + getPackageName())
                );
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(intent);
                return;
            }

            windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);

            int type = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                    ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                    : WindowManager.LayoutParams.TYPE_PHONE;

            WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    type,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                            | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN
                            | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
                    PixelFormat.TRANSLUCENT
            );

            params.gravity = Gravity.TOP | Gravity.END;
            params.x = 30;
            params.y = 200;

            /* ========= BUBBLE ========= */
            TextView bubble = new TextView(this);
            bubble.setText("📞");
            bubble.setTextSize(22);
            bubble.setPadding(30, 30, 30, 30);
            bubble.setTextColor(0xFFFFFFFF);

            GradientDrawable bg = new GradientDrawable();
            bg.setColor(0xFF0EA5A4);
            bg.setCornerRadius(100);
            bubble.setBackground(bg);

            overlayView = bubble;

            /* ========= EXPANDED ========= */
            expandedView = new LinearLayout(this);
            expandedView.setOrientation(LinearLayout.VERTICAL);
            expandedView.setPadding(40, 30, 40, 30);

            GradientDrawable bg2 = new GradientDrawable();
            bg2.setColor(0xEE111111);
            bg2.setCornerRadius(40);
            expandedView.setBackground(bg2);

            expandedView.setVisibility(View.GONE);

            TextView nameView = new TextView(this);
            nameView.setText(name != null ? name : "Unknown");

            TextView numberView = new TextView(this);
            numberView.setText(number != null ? number : "Unknown");

            spamTagView = new TextView(this);
            spamTagView.setText(spam != null ? spam : "Safe");

            timerView = new TextView(this);
            earningsView = new TextView(this);

            expandedView.addView(nameView);
            expandedView.addView(numberView);
            expandedView.addView(spamTagView);
            expandedView.addView(timerView);
            expandedView.addView(earningsView);

            /* ========= ADD VIEWS ========= */
            windowManager.addView(overlayView, params);
            windowManager.addView(expandedView, params);

            /* ========= DRAG SUPPORT ========= */
            overlayView.setOnTouchListener(new View.OnTouchListener() {
                int initialX, initialY;
                float initialTouchX, initialTouchY;

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
                            windowManager.updateViewLayout(expandedView, params);
                            return true;
                    }
                    return false;
                }
            });

            /* ========= CLICK ========= */
            bubble.setOnClickListener(v -> {
                isExpanded = !isExpanded;
                expandedView.setVisibility(isExpanded ? View.VISIBLE : View.GONE);
                bubble.setVisibility(isExpanded ? View.GONE : View.VISIBLE);
            });

            /* ========= TIMER ========= */
            handler.post(new Runnable() {
                @Override
                public void run() {
                    seconds++;
                    earningsValue += 0.001;

                    timerView.setText("⏱ " + seconds + "s");
                    earningsView.setText("💰 " + String.format("%.4f", earningsValue));

                    handler.postDelayed(this, 1000);
                }
            });

        } catch (Exception e) {
            Log.e("OVERLAY_ERROR", e.toString());
        }
    }

    private Notification buildNotification() {

        String channelId = "overlay_channel";

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    channelId,
                    "Overlay Service",
                    NotificationManager.IMPORTANCE_LOW
            );

            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }

        return new NotificationCompat.Builder(this, channelId)
                .setContentTitle("ATC Call Mining")
                .setContentText("Running...")
                .setSmallIcon(android.R.drawable.sym_call_incoming)
                .build();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();

        handler.removeCallbacksAndMessages(null);

        if (windowManager != null) {
            if (overlayView != null) windowManager.removeView(overlayView);
            if (expandedView != null) windowManager.removeView(expandedView);
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}