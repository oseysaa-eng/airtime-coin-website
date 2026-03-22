package com.airtimecoin.app;

import android.telephony.PhoneStateListener;
import android.telephony.TelephonyManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.provider.ContactsContract;

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

    /* =====================================================
       START LISTENING
    ===================================================== */

    @ReactMethod
    public void start() {

        if (isListening) return;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M &&
            getReactApplicationContext().checkSelfPermission(
                android.Manifest.permission.READ_PHONE_STATE
        ) != PackageManager.PERMISSION_GRANTED) {
            return;
        }

        telephonyManager = (TelephonyManager)
                getReactApplicationContext().getSystemService(Context.TELEPHONY_SERVICE);

        if (telephonyManager == null) return;

        isListening = true;

        listener = new PhoneStateListener() {

            @Override
            public void onCallStateChanged(int state, String incomingNumber) {

                // 📞 CALL STARTED
                if (state == TelephonyManager.CALL_STATE_OFFHOOK && callStartTime == 0) {

                    callStartTime = System.currentTimeMillis();

                    WritableMap caller = getContactDataSafe(incomingNumber);

                    sendEventSafe("CALL_STARTED", caller);
                }

                // 📞 CALL ENDED
                if (state == TelephonyManager.CALL_STATE_IDLE && callStartTime != 0) {

                    long duration =
                            (System.currentTimeMillis() - callStartTime) / 1000;

                    WritableMap map = Arguments.createMap();
                    map.putDouble("duration", duration);

                    sendEventSafe("CALL_ENDED", map);

                    callStartTime = 0;
                }
            }
        };

        telephonyManager.listen(listener, PhoneStateListener.LISTEN_CALL_STATE);
    }

    /* =====================================================
       STOP LISTENING
    ===================================================== */

    @ReactMethod
    public void stopListening() {
        if (telephonyManager != null && listener != null) {
            telephonyManager.listen(listener, PhoneStateListener.LISTEN_NONE);
            isListening = false;
        }
    }

    /* =====================================================
       START OVERLAY
    ===================================================== */

    @ReactMethod
    public void startOverlay(String name, String number, String photo, String spamStatus) {

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
                getReactApplicationContext().startForegroundService(intent);
            } else {
                getReactApplicationContext().startService(intent);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /* =====================================================
       UPDATE OVERLAY (REAL-TIME)
    ===================================================== */

    @ReactMethod
    public void updateOverlay(String spamStatus) {
        try {
            Intent intent = new Intent(
                    getReactApplicationContext(),
                    OverlayService.class
            );

            intent.putExtra("updateSpam", spamStatus);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                getReactApplicationContext().startForegroundService(intent);
            } else {
                getReactApplicationContext().startService(intent);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /* =====================================================
       STOP OVERLAY
    ===================================================== */

    @ReactMethod
    public void stopOverlay() {
        try {
            Intent intent = new Intent(
                    getReactApplicationContext(),
                    OverlayService.class
            );

            getReactApplicationContext().stopService(intent);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /* =====================================================
       CONTACT RESOLVER (SAFE VERSION)
    ===================================================== */

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
                map.putString("number", number);
                map.putBoolean("isSaved", false);
                map.putString("photo", null);
                map.putString("spam", "unknown");
                return map;
            }

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

                int nameIndex = cursor.getColumnIndex(
                        ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME
                );

                int photoIndex = cursor.getColumnIndex(
                        ContactsContract.CommonDataKinds.Phone.PHOTO_URI
                );

                String name = (nameIndex >= 0)
                        ? cursor.getString(nameIndex)
                        : "Saved Contact";

                String photo = (photoIndex >= 0)
                        ? cursor.getString(photoIndex)
                        : null;

                map.putString("name", name);
                map.putString("photo", photo);
                map.putBoolean("isSaved", true);

            } else {
                map.putString("name", "Unknown Caller");
                map.putBoolean("isSaved", false);
                map.putString("photo", null);
            }

        } catch (Exception e) {
            e.printStackTrace();
            map.putString("name", "Unknown");
            map.putBoolean("isSaved", false);
            map.putString("photo", null);
        } finally {
            if (cursor != null) cursor.close();
        }

        map.putString("number", number);
        map.putString("spam", "unknown");

        return map;
    }

    /* =====================================================
       SAFE EVENT EMITTER
    ===================================================== */

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