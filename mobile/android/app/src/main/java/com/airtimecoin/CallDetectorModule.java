package com.airtimecoin.app;

import android.telephony.PhoneStateListener;
import android.telephony.TelephonyManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.content.pm.PackageManager;

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

    @ReactMethod
    public void addListener(String eventName) {}

    @ReactMethod
    public void removeListeners(Integer count) {}

    @ReactMethod
    public void start() {

        if (isListening) return;

        // ✅ Permission check
        if (getReactApplicationContext().checkSelfPermission(
                android.Manifest.permission.READ_PHONE_STATE
        ) != PackageManager.PERMISSION_GRANTED) {
            return;
        }

        telephonyManager =
            (TelephonyManager) getReactApplicationContext()
            .getSystemService(Context.TELEPHONY_SERVICE);

        if (telephonyManager == null) return;

        isListening = true;

        listener = new PhoneStateListener() {

            @Override
            public void onCallStateChanged(int state, String phoneNumber) {

                // 📞 CALL STARTED
                if (state == TelephonyManager.CALL_STATE_OFFHOOK) {

                    callStartTime = System.currentTimeMillis();
                    sendEvent("CALL_STARTED", null);
                }

                // 📞 CALL ENDED
                if (state == TelephonyManager.CALL_STATE_IDLE && callStartTime != 0) {

                    long duration =
                        (System.currentTimeMillis() - callStartTime) / 1000;

                    WritableMap map = Arguments.createMap();
                    map.putDouble("duration", duration);

                    sendEvent("CALL_ENDED", map);

                    callStartTime = 0;
                }
            }
        };

        telephonyManager.listen(
            listener,
            PhoneStateListener.LISTEN_CALL_STATE
        );
    }

    // ✅ Stop listener (VERY IMPORTANT)
    @ReactMethod
    public void stopListening() {
        if (telephonyManager != null && listener != null) {
            telephonyManager.listen(listener, PhoneStateListener.LISTEN_NONE);
            isListening = false;
        }
    }

    // ✅ Start overlay
    @ReactMethod
    public void startOverlay() {
        try {
            Intent intent = new Intent(
                getReactApplicationContext(),
                OverlayService.class
            );

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                getReactApplicationContext().startForegroundService(intent);
            } else {
                getReactApplicationContext().startService(intent);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // ✅ Stop overlay
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

    private void sendEvent(String name, WritableMap data) {
        getReactApplicationContext()
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(name, data);
    }
}