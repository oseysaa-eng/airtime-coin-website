package com.atcapp;

import android.telephony.PhoneStateListener;
import android.telephony.TelephonyManager;
import android.content.Context;

import com.facebook.react.bridge.*;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class CallDetectorModule extends ReactContextBaseJavaModule {

    private TelephonyManager telephonyManager;
    private PhoneStateListener listener;
    private long callStartTime = 0;

    public CallDetectorModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "CallDetector";
    }

    @ReactMethod
    public void start() {

        telephonyManager =
            (TelephonyManager) getReactApplicationContext()
            .getSystemService(Context.TELEPHONY_SERVICE);

        listener = new PhoneStateListener() {

            @Override
            public void onCallStateChanged(int state, String phoneNumber) {

                if (state == TelephonyManager.CALL_STATE_OFFHOOK) {

                    callStartTime = System.currentTimeMillis();

                    sendEvent("CALL_STARTED", null);
                }

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

    private void sendEvent(String name, WritableMap data) {
        getReactApplicationContext()
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(name, data);
    }
}