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
import android.telephony.TelephonyCallback;

import com.facebook.react.bridge.*;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class CallDetectorModule extends ReactContextBaseJavaModule {

    private TelephonyManager telephonyManager;
    private PhoneStateListener listener;

    // ✅ FIXED: correct callback type
    private TelephonyCallback telephonyCallback;

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
       CALLBACK CLASS (ANDROID 12+)
    ============================================ */
    private class CallStateCallback extends TelephonyCallback implements TelephonyCallback.CallStateListener {
        @Override
        public void onCallStateChanged(int state) {
            handleCallState(state, null);
        }
    }

    /* ============================================
       START LISTENING
    ============================================ */
    @ReactMethod
    public void start() {

        if (isListening) return;

        Context ctx = getReactApplicationContext();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M &&
                ctx.checkSelfPermission(android.Manifest.permission.READ_PHONE_STATE)
                        != PackageManager.PERMISSION_GRANTED) {
            Log.d("CALL_DEBUG", "❌ Permission missing");
            return;
        }

        telephonyManager = (TelephonyManager)
                ctx.getSystemService(Context.TELEPHONY_SERVICE);

        if (telephonyManager == null) return;

        isListening = true;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {

            telephonyCallback = new CallStateCallback();

            telephonyManager.registerTelephonyCallback(
                    ctx.getMainExecutor(),
                    telephonyCallback
            );

        } else {

            listener = new PhoneStateListener() {
                @Override
                public void onCallStateChanged(int state, String incomingNumber) {
                    handleCallState(state, incomingNumber);
                }
            };

            telephonyManager.listen(listener, PhoneStateListener.LISTEN_CALL_STATE);
        }
    }

    /* ============================================
       HANDLE CALL STATE
    ============================================ */
    private void handleCallState(int state, String incomingNumber) {

        Log.d("CALL_DEBUG", "STATE: " + state);

        switch (state) {

            case TelephonyManager.CALL_STATE_OFFHOOK:

                if (callStartTime == 0) {

                    callStartTime = System.currentTimeMillis();

                    String number = (incomingNumber != null && !incomingNumber.isEmpty())
                            ? incomingNumber
                            : "Unknown";

                    WritableMap caller = getContactDataSafe(number);

                    startOverlay(
                            caller.getString("name"),
                            caller.getString("number"),
                            caller.getString("photo"),
                            caller.getString("spam")
                    );

                    sendEventSafe("CALL_STARTED", caller);
                }
                break;

            case TelephonyManager.CALL_STATE_IDLE:

                if (callStartTime != 0) {

                    long duration =
                            (System.currentTimeMillis() - callStartTime) / 1000;

                    WritableMap map = Arguments.createMap();
                    map.putDouble("duration", duration);

                    stopOverlay();

                    sendEventSafe("CALL_ENDED", map);

                    callStartTime = 0;
                }
                break;
        }
    }

    /* ============================================
       STOP LISTENING
    ============================================ */
    @ReactMethod
    public void stopListening() {

        if (!isListening || telephonyManager == null) return;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {

            if (telephonyCallback != null) {
                telephonyManager.unregisterTelephonyCallback(telephonyCallback);
                telephonyCallback = null;
            }

        } else if (listener != null) {

            telephonyManager.listen(listener, PhoneStateListener.LISTEN_NONE);
            listener = null;
        }

        isListening = false;
    }

    /* ============================================
       OVERLAY CONTROL
    ============================================ */

    @ReactMethod
    public void startOverlay(String name, String number, String photo, String spamStatus) {

        try {
            Intent intent = new Intent(getReactApplicationContext(), OverlayService.class);

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

    @ReactMethod
    public void stopOverlay() {

        try {
            Intent intent = new Intent(getReactApplicationContext(), OverlayService.class);
            intent.putExtra("stop", true);
            getReactApplicationContext().startService(intent);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /* ============================================
       CONTACT RESOLVER
    ============================================ */
    private WritableMap getContactDataSafe(String number) {

        WritableMap map = Arguments.createMap();

        Cursor cursor = null;

        try {

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

                map.putString("name",
                        nameIndex != -1 ? cursor.getString(nameIndex) : "Unknown Caller"
                );

                map.putBoolean("isSaved", true);

            } else {
                map.putString("name", "Unknown Caller");
                map.putBoolean("isSaved", false);
            }

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (cursor != null) cursor.close();
        }

        map.putString("number", number);
        map.putString("photo", null);
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