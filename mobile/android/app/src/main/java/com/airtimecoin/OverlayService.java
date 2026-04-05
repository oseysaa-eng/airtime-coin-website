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
import android.graphics.Typeface;
import android.content.res.Resources;

public class OverlayService extends Service {

    private WindowManager windowManager;
    private View overlayView;
    private LinearLayout expandedView;
    private WindowManager.LayoutParams bubbleParams;
    private WindowManager.LayoutParams expandedParams;


    private Handler handler = new Handler(Looper.getMainLooper());

    private int seconds = 0;
    private double earningsValue = 0.0;

    private TextView timerView;
    private TextView earningsView;
    private TextView spamTagView;

    private boolean isExpanded = false;
    

    @Override
public int onStartCommand(Intent intent, int flags, int startId) {

    try {
        startForeground(1, buildNotification()); // ✅ REQUIRED
    } catch (Exception e) {
        Log.e("FGS_ERROR", e.toString());
    }

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

            if (overlayView != null) {
                return; // already running
            }

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
            bubble.setElevation(20);

            GradientDrawable bg = new GradientDrawable();
            bg.setColor(0xFF0EA5A4);
            bg.setCornerRadius(100);
            bubble.setBackground(bg);

            overlayView = bubble;

            /* ========= EXPANDED ========= */
            expandedView = new LinearLayout(this);
            expandedView.setOrientation(LinearLayout.VERTICAL);
            expandedView.setPadding(40, 40, 40, 40);

            GradientDrawable bg2 = new GradientDrawable();
            bg2.setColor(0xEE0F172A); // dark glass
            bg2.setCornerRadius(50);
            expandedView.setBackground(bg2);
            expandedView.setElevation(30);
            expandedView.setAlpha(0.98f);
     
            expandedView.setVisibility(View.GONE);
          

            LinearLayout header = new LinearLayout(this);
            header.setOrientation(LinearLayout.HORIZONTAL);
            header.setGravity(Gravity.CENTER_VERTICAL | Gravity.END);

            header.setLayoutParams(new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
            ));

            TextView icon = new TextView(this);
            icon.setText("📞");
            icon.setTextSize(18);

            TextView title = new TextView(this);
            title.setText(" Live Call");
            title.setTextColor(0xFFFFFFFF);
            title.setTextSize(14);
            title.setLayoutParams(new LinearLayout.LayoutParams(0,
                    ViewGroup.LayoutParams.WRAP_CONTENT, 1));

            TextView closeBtn = new TextView(this);
            closeBtn.setText("✕");
            closeBtn.setTextSize(18);
            closeBtn.setTextColor(0xFFFFFFFF);
            closeBtn.setPadding(20, 0, 0, 0);
            closeBtn.setOnClickListener(v -> toggleExpanded());

            header.addView(icon);
            header.addView(title);
            header.addView(closeBtn);

            expandedView.addView(header);
            addSpacer(expandedView, 15);

                    

           TextView nameView = new TextView(this);
            nameView.setText(name != null ? name : "Unknown Caller");
            nameView.setTextSize(18);
            nameView.setTextColor(0xFFFFFFFF);
            nameView.setTypeface(null, Typeface.BOLD);

           TextView numberView = new TextView(this);
            numberView.setText(number != null ? number : "Unknown Number");
            numberView.setTextSize(13);
            numberView.setTextColor(0xFF94A3B8);

            spamTagView = new TextView(this);

            String label = spam != null ? spam : "Safe";

            spamTagView.setText("⚠ " + label);
            spamTagView.setTextSize(13);
            spamTagView.setPadding(12, 6, 12, 6);

            GradientDrawable tagBg = new GradientDrawable();
            tagBg.setCornerRadius(20);

            if ("spam".equalsIgnoreCase(label)) {
                tagBg.setColor(0xFFDC2626); // red
            } else if ("warning".equalsIgnoreCase(label)) {
                tagBg.setColor(0xFFF59E0B); // orange
            } else {
                tagBg.setColor(0xFF16A34A); // green
            }

            spamTagView.setBackground(tagBg);
            spamTagView.setTextColor(0xFFFFFFFF);


            timerView = new TextView(this);
            timerView.setTextSize(18);
            timerView.setTextColor(0xFFFFFFFF);
            timerView.setTypeface(null, Typeface.BOLD);

            earningsView = new TextView(this);
            earningsView.setTextSize(18);
            earningsView.setTextColor(0xFF22C55E);
            earningsView.setTypeface(null, Typeface.BOLD);

            expandedView.addView(nameView);
            expandedView.addView(numberView);

            addSpacer(expandedView, 10);

            expandedView.addView(spamTagView);

            addSpacer(expandedView, 20);

            expandedView.addView(timerView);
            expandedView.addView(earningsView);


                
            /* ========= ADD VIEWS ========= */
            bubbleParams = params;

            expandedParams = new WindowManager.LayoutParams();
            expandedParams.copyFrom(params);

            windowManager.addView(overlayView, bubbleParams);
            windowManager.addView(expandedView, expandedParams);

            /* ========= DRAG SUPPORT ========= */
            overlayView.setOnTouchListener(new View.OnTouchListener() {
            int initialX, initialY;
            float initialTouchX, initialTouchY;
            long touchStartTime;

    @Override
    public boolean onTouch(View v, MotionEvent event) {
        switch (event.getAction()) {

                case MotionEvent.ACTION_DOWN:
    initialX = bubbleParams.x;
    initialY = bubbleParams.y;
    initialTouchX = event.getRawX();
    initialTouchY = event.getRawY();
    touchStartTime = System.currentTimeMillis();
    return true;

                case MotionEvent.ACTION_MOVE:

    int dx = (int) (event.getRawX() - initialTouchX);
    int dy = (int) (event.getRawY() - initialTouchY);

    bubbleParams.x = initialX - dx;
    bubbleParams.y = initialY + dy;

    expandedParams.x = bubbleParams.x;
    expandedParams.y = bubbleParams.y;

    windowManager.updateViewLayout(overlayView, bubbleParams);
    windowManager.updateViewLayout(expandedView, expandedParams);

    return true;


    case MotionEvent.ACTION_UP:

    long clickDuration = System.currentTimeMillis() - touchStartTime;

    float dxUp = Math.abs(event.getRawX() - initialTouchX);
    float dyUp = Math.abs(event.getRawY() - initialTouchY);

    int screenWidth = Resources.getSystem().getDisplayMetrics().widthPixels;

    if (bubbleParams.x > screenWidth / 2) {
        bubbleParams.x = screenWidth - 150;
    } else {
        bubbleParams.x = 0;
    }

    expandedParams.x = bubbleParams.x;

    windowManager.updateViewLayout(overlayView, bubbleParams);
    windowManager.updateViewLayout(expandedView, expandedParams);

    // 👉 Only treat as click if NOT moved
    if (clickDuration < 200 && dxUp < 10 && dyUp < 10) {
        toggleExpanded();
    }

    return true;
        }
        return false;
    }
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


    private void addSpacer(LinearLayout parent, int height) {
    View space = new View(this);
    space.setLayoutParams(new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            height
    ));
    parent.addView(space);
}

private void toggleExpanded() {
    isExpanded = !isExpanded;

    if (isExpanded) {
        expandedView.setAlpha(0f);
        expandedView.setVisibility(View.VISIBLE);
        expandedView.animate().alpha(1f).setDuration(200);

        overlayView.setVisibility(View.GONE);

        // ✅ AUTO COLLAPSE ONLY WHEN EXPANDED
        handler.postDelayed(() -> {
            if (isExpanded) {
                toggleExpanded();
            }
        }, 8000);

    } else {
        expandedView.animate().alpha(0f).setDuration(200)
                .withEndAction(() -> expandedView.setVisibility(View.GONE));

        overlayView.setVisibility(View.VISIBLE);
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

    try {
        if (windowManager != null && overlayView != null) {
            windowManager.removeView(overlayView);
        }
    } catch (Exception ignored) {}

    try {
        if (windowManager != null && expandedView != null) {
            windowManager.removeView(expandedView);
        }
    } catch (Exception ignored) {}

    overlayView = null;
    expandedView = null;
}

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}