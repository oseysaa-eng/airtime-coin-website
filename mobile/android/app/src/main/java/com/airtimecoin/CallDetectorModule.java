package com.airtimecoin.app;

import android.telephony.PhoneStateListener;
import android.telephony.TelephonyManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.provider.ContactsContract;
import android.util.Log;

import com.facebook.react.bridge.*;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class CallDetectorModule extends ReactContextBaseJavaModule {

    private TelephonyManager telephonyManager;
    private PhoneStateListener listener;

    private long callStartTime = 0;
    private boolean isListening = false;

    public CallDetectorModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "CallDetector";
    }

    @ReactMethod public void addListener(String eventName) {}
    @ReactMethod public void removeListeners(Integer count) {}

    /* ============================================
       START LISTENING
    ============================================ */

    @ReactMethod
    public void start() {

        if (isListening) return;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M &&
                getReactApplicationContext().checkSelfPermission(
                        android.Manifest.permission.READ_PHONE_STATE
                ) != PackageManager.PERMISSION_GRANTED) {
            Log.d("CALL_DEBUG", "❌ Permission READ_PHONE_STATE not granted");
            return;
        }

        telephonyManager = (TelephonyManager)
                getReactApplicationContext().getSystemService(Context.TELEPHONY_SERVICE);

        if (telephonyManager == null) return;

        isListening = true;

        listener = new PhoneStateListener() {

            @Override
            public void onCallStateChanged(int state, String incomingNumber) {

                Log.d("CALL_DEBUG", "STATE: " + state + " NUMBER: " + incomingNumber);

                switch (state) {

                    case TelephonyManager.CALL_STATE_OFFHOOK:

                        if (callStartTime == 0) {

                            callStartTime = System.currentTimeMillis();

                            String safeNumber =
                                    (incomingNumber == null || incomingNumber.isEmpty())
                                            ? "Outgoing Call"
                                            : incomingNumber;

                            WritableMap caller = getContactDataSafe(safeNumber);

                            sendEventSafe("CALL_STARTED", caller);
                        }
                        break;

                    case TelephonyManager.CALL_STATE_IDLE:

                        if (callStartTime != 0) {

                            long duration =
                                    (System.currentTimeMillis() - callStartTime) / 1000;

                            WritableMap map = Arguments.createMap();
                            map.putDouble("duration", duration);

                            sendEventSafe("CALL_ENDED", map);

                            callStartTime = 0;
                        }
                        break;
                }
            }
        };

        telephonyManager.listen(listener, PhoneStateListener.LISTEN_CALL_STATE);
    }

    /* ============================================
       STOP LISTENING
    ============================================ */

    @ReactMethod
    public void stopListening() {
        if (telephonyManager != null && listener != null) {
            telephonyManager.listen(listener, PhoneStateListener.LISTEN_NONE);
            isListening = false;
        }
    }

    /* ============================================
       START OVERLAY
    ============================================ */

    @ReactMethod
    public void startOverlay(String name, String number, String photo, String spamStatus) {
        Log.d("OVERLAY_DEBUG", "🔥 START OVERLAY");

        try {
            Intent intent = new Intent(
                    getReactApplicationContext(),
                    OverlayService.class
            );

            intent.putExtra("name", name);
            intent.putExtra("number", number);
            intent.putExtra("photo", photo);
            intent.putExtra("spam", spamStatus);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                getReactApplicationContext().startForegroundService(intent); // ✅ ONLY HERE
            } else {
                getReactApplicationContext().startService(intent);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /* ============================================
       UPDATE OVERLAY
    ============================================ */

    @ReactMethod
    public void updateOverlay(String spamStatus) {
        try {
            Intent intent = new Intent(
                    getReactApplicationContext(),
                    OverlayService.class
            );

            intent.putExtra("updateSpam", spamStatus);

            getReactApplicationContext().startService(intent); // ✅ NORMAL SERVICE

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /* ============================================
       STOP OVERLAY
    ============================================ */

    @ReactMethod
    public void stopOverlay() {
        try {
            Intent intent = new Intent(
                    getReactApplicationContext(),
                    OverlayService.class
            );

            intent.putExtra("stop", true);

            getReactApplicationContext().startService(intent); // ✅ NOT foreground

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /* ============================================
       CONTACT RESOLVER
    ============================================ */

    private WritableMap getContactDataSafe(String number) {

        WritableMap map = Arguments.createMap();

        if (number == null || number.trim().isEmpty()) {
            map.putString("name", "Private Number");
            map.putString("number", "Unknown");
            map.putBoolean("isSaved", false);
            map.putString("photo", null);
            map.putString("spam", "unknown");
            return map;
        }

        Cursor cursor = null;

        try {

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M &&
                    getReactApplicationContext().checkSelfPermission(
                            android.Manifest.permission.READ_CONTACTS
                    ) != PackageManager.PERMISSION_GRANTED) {

                map.putString("name", "Unknown Caller");
                map.putBoolean("isSaved", false);
                map.putString("photo", null);

            } else {

                cursor = getReactApplicationContext()
                        .getContentResolver()
                        .query(
                                ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
                                null,
                                ContactsContract.CommonDataKinds.Phone.NUMBER + " LIKE ?",
                                new String[]{"%" + number + "%"},
                                null
                        );

                if (cursor != null && cursor.moveToFirst()) {

                    map.putString("name",
                            cursor.getString(cursor.getColumnIndex(
                                    ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME)));

                    map.putString("photo",
                            cursor.getString(cursor.getColumnIndex(
                                    ContactsContract.CommonDataKinds.Phone.PHOTO_URI)));

                    map.putBoolean("isSaved", true);

                } else {
                    map.putString("name", "Unknown Caller");
                    map.putBoolean("isSaved", false);
                    map.putString("photo", null);
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (cursor != null) cursor.close();
        }

        map.putString("number", number);
        map.putString("spam", "unknown");

        return map;
    }

    /* ============================================
       EVENT EMITTER
    ============================================ */

    private void sendEventSafe(String name, WritableMap data) {
        try {
            getReactApplicationContext()
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(name, data);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}