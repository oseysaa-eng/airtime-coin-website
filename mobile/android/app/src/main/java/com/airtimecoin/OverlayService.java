package com.airtimecoin.app;

import android.app.*;
import android.content.Intent;
import android.graphics.PixelFormat;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.*;
import android.provider.Settings;
import android.view.*;
import android.widget.*;

import androidx.core.app.NotificationCompat;

public class OverlayService extends Service {

    private WindowManager windowManager;
    private View overlayView;
    private LinearLayout expandedView;

    private Handler handler = new Handler();

    private int seconds = 0;
    private double earningsValue = 0.0;

    private TextView timerView;
    private TextView earningsView;
    private TextView spamTagView;

    private boolean isExpanded = false;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {

        if (intent == null) return START_STICKY;

        // ✅ REAL-TIME UPDATE
        if (intent.hasExtra("updateSpam")) {
            String newSpam = intent.getStringExtra("updateSpam");
            updateSpamUI(newSpam);
            return START_STICKY;
        }

        String name = intent.getStringExtra("name");
        String number = intent.getStringExtra("number");
        String photo = intent.getStringExtra("photo");
        String spam = intent.getStringExtra("spam");

        startForeground(1, buildNotification());

        showOverlay(name, number, photo, spam);

        return START_STICKY;
    }

    /* =====================================================
       MAIN OVERLAY UI
    ===================================================== */

    private void showOverlay(String name, String number, String photo, String spam) {

        try {

            if (!Settings.canDrawOverlays(this)) {
                stopSelf();
                return;
            }

            if (overlayView != null) return;

            windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);

            if (name == null) name = "Unknown Caller";
            if (number == null) number = "Private Number";

            /* ================= BUBBLE ================= */

            TextView bubble = new TextView(this);
            bubble.setText("📞");
            bubble.setTextSize(22);
            bubble.setPadding(30, 30, 30, 30);
            bubble.setTextColor(0xFFFFFFFF);

            GradientDrawable bubbleBg = new GradientDrawable();
            bubbleBg.setColor(0xFF0EA5A4);
            bubbleBg.setCornerRadius(100);
            bubble.setBackground(bubbleBg);

            overlayView = bubble;

            int layoutType = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                    ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                    : WindowManager.LayoutParams.TYPE_PHONE;

            WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    layoutType,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                    PixelFormat.TRANSLUCENT
            );

            params.gravity = Gravity.TOP | Gravity.END;
            params.x = 30;
            params.y = 200;

            windowManager.addView(overlayView, params);

            /* ================= EXPANDED VIEW ================= */

            expandedView = new LinearLayout(this);
            expandedView.setOrientation(LinearLayout.VERTICAL);
            expandedView.setPadding(40, 30, 40, 30);

            GradientDrawable bg = new GradientDrawable();
            bg.setColor(0xEE111111);
            bg.setCornerRadius(40);
            expandedView.setBackground(bg);

            expandedView.setVisibility(View.GONE);

            /* ---- Avatar ---- */
            ImageView avatar = new ImageView(this);

            if (photo != null && !photo.isEmpty()) {
                avatar.setImageURI(Uri.parse(photo));
            } else {
                avatar.setImageResource(android.R.drawable.sym_def_app_icon);
            }

            LinearLayout.LayoutParams imgParams =
                    new LinearLayout.LayoutParams(140, 140);
            avatar.setLayoutParams(imgParams);

            /* ---- Name ---- */
            TextView nameView = new TextView(this);
            nameView.setText(name);
            nameView.setTextColor(0xFFFFFFFF);
            nameView.setTextSize(18);
            nameView.setTypeface(null, Typeface.BOLD);

            /* ---- Number ---- */
            TextView numberView = new TextView(this);
            numberView.setText(number);
            numberView.setTextColor(0xFFAAAAAA);

            /* ---- SPAM VIEW (IMPORTANT) ---- */
            spamTagView = new TextView(this);
            spamTagView.setText("Checking...");
            spamTagView.setTextSize(14);

            updateSpamUI(spam);

            /* ---- Timer ---- */
            timerView = new TextView(this);
            timerView.setText("⏱ 00:00");
            timerView.setTextColor(0xFF00FFAA);

            /* ---- Earnings ---- */
            earningsView = new TextView(this);
            earningsView.setText("💰 0.000 ATC");
            earningsView.setTextColor(0xFFFFD700);

            /* ---- ADD VIEWS ---- */
            expandedView.addView(avatar);
            expandedView.addView(nameView);
            expandedView.addView(numberView);
            expandedView.addView(spamTagView);
            expandedView.addView(timerView);
            expandedView.addView(earningsView);

            windowManager.addView(expandedView, params);

            /* ================= TOGGLE ================= */

            bubble.setOnClickListener(v -> {
                isExpanded = !isExpanded;

                expandedView.setVisibility(isExpanded ? View.VISIBLE : View.GONE);
                bubble.setVisibility(isExpanded ? View.GONE : View.VISIBLE);
            });

            /* ================= TIMER ================= */

            handler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    seconds++;
                    earningsValue += 0.001;

                    int mins = seconds / 60;
                    int secs = seconds % 60;

                    if (timerView != null)
                        timerView.setText("⏱ " + mins + ":" + String.format("%02d", secs));

                    if (earningsView != null)
                        earningsView.setText("💰 " + String.format("%.3f", earningsValue) + " ATC");

                    handler.postDelayed(this, 1000);
                }
            }, 1000);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /* =====================================================
       REAL-TIME SPAM UPDATE
    ===================================================== */

    private void updateSpamUI(String status) {

        if (spamTagView == null) return;

        if ("spam".equals(status)) {
            spamTagView.setText("🚫 SPAM");
            spamTagView.setTextColor(0xFFFF4444);

        } else if ("warning".equals(status)) {
            spamTagView.setText("⚠️ Suspicious");
            spamTagView.setTextColor(0xFFFFA500);

        } else if ("checking".equals(status)) {
            spamTagView.setText("⏳ Checking...");
            spamTagView.setTextColor(0xFFFFFFFF);

        } else {
            spamTagView.setText("✅ Safe");
            spamTagView.setTextColor(0xFF00FFAA);
        }
    }

    /* =====================================================
       NOTIFICATION
    ===================================================== */

    private Notification buildNotification() {
        return new NotificationCompat.Builder(this, "call_channel")
                .setContentTitle("Call Mining Active")
                .setContentText("Tracking call...")
                .setSmallIcon(android.R.drawable.sym_call_incoming)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .build();
    }

    /* ===================================================== */

    @Override
    public void onDestroy() {
        super.onDestroy();

        handler.removeCallbacksAndMessages(null);

        try {
            if (overlayView != null) windowManager.removeView(overlayView);
            if (expandedView != null) windowManager.removeView(expandedView);
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
            getSystemService(NotificationManager.class).createNotificationChannel(channel);
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}