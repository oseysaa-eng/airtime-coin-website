package com.airtimecoin.app;

import android.telephony.PhoneStateListener;
import android.telephony.TelephonyManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

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

        if (isListening) return; // ✅ prevent duplicates
        isListening = true;

        telephonyManager =
            (TelephonyManager) getReactApplicationContext()
            .getSystemService(Context.TELEPHONY_SERVICE);

        listener = new PhoneStateListener() {

            @Override
            public void onCallStateChanged(int state, String phoneNumber) {

                // 📞 CALL STARTED
                if (state == TelephonyManager.CALL_STATE_OFFHOOK) {

                    callStartTime = System.currentTimeMillis();

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

                    sendEvent("CALL_STARTED", null);
                }

                // 📞 CALL ENDED
                if (state == TelephonyManager.CALL_STATE_IDLE && callStartTime != 0) {

                    Intent intent = new Intent(
                        getReactApplicationContext(),
                        OverlayService.class
                    );

                    getReactApplicationContext().stopService(intent);

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

    private void sendEvent(String name, WritableMap data) {
        getReactApplicationContext()
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(name, data);
    }
}