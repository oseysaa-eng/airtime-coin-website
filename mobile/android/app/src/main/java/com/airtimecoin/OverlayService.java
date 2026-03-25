package com.airtimecoin.app;

import android.app.Service;
import android.content.Intent;
import android.graphics.PixelFormat;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.*;
import android.provider.Settings;
import android.view.*;
import android.widget.*;

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

        if (intent == null) return START_STICKY;

        if (intent.hasExtra("updateSpam")) {
            updateSpamUI(intent.getStringExtra("updateSpam"));
            return START_STICKY;
        }

                if (intent.hasExtra("stop")) {
            stopSelf();
            return START_NOT_STICKY;
        }

        showOverlay(
                intent.getStringExtra("name"),
                intent.getStringExtra("number"),
                intent.getStringExtra("photo"),
                intent.getStringExtra("spam")
        );

        return START_STICKY;
    }

    private void showOverlay(String name, String number, String photo, String spam) {

        try {

            if (!Settings.canDrawOverlays(this)) return;

            if (overlayView != null) return;

            windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);

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

            int type = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                    ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                    : WindowManager.LayoutParams.TYPE_PHONE;

            WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    type,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                    PixelFormat.TRANSLUCENT
            );

            params.gravity = Gravity.TOP | Gravity.END;
            params.x = 30;
            params.y = 200;

            windowManager.addView(overlayView, params);

            // EXPANDED VIEW
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
            updateSpamUI(spam);

            timerView = new TextView(this);
            earningsView = new TextView(this);

            expandedView.addView(nameView);
            expandedView.addView(numberView);
            expandedView.addView(spamTagView);
            expandedView.addView(timerView);
            expandedView.addView(earningsView);

            windowManager.addView(expandedView, params);

            bubble.setOnClickListener(v -> {
                isExpanded = !isExpanded;
                expandedView.setVisibility(isExpanded ? View.VISIBLE : View.GONE);
                bubble.setVisibility(isExpanded ? View.GONE : View.VISIBLE);
            });
            

            handler.post(new Runnable() {
                @Override
                public void run() {
                    seconds++;
                    earningsValue += 0.001;

                    timerView.setText("⏱ " + seconds);
                    earningsView.setText("💰 " + earningsValue);

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

    handler.removeCallbacksAndMessages(null);

    try {
        if (windowManager != null) {
            if (overlayView != null) {
                windowManager.removeView(overlayView);
                overlayView = null;
            }
            if (expandedView != null) {
                windowManager.removeView(expandedView);
                expandedView = null;
            }
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
}


    private void updateSpamUI(String status) {
        if (spamTagView == null) return;

        spamTagView.setText(status != null ? status : "Safe");
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}

