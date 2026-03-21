package com.airtimecoin.app;
import android.telephony.PhoneStateListener;
import android.telephony.TelephonyManager;
import android.content.Context;

import com.facebook.react.bridge.*;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import android.content.Intent;

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
    public void addListener(String eventName) {
     // Required for RN built-in EventEmitter
     }

     @ReactMethod
    public void removeListeners(Integer count) {
    // Required for RN built-in EventEmitter
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
                    Intent intent = new Intent(getReactApplicationContext(), OverlayService.class);
getReactApplicationContext().startService(intent);

                    callStartTime = System.currentTimeMillis();

                    sendEvent("CALL_STARTED", null);
                }

                if (state == TelephonyManager.CALL_STATE_IDLE && callStartTime != 0) {
                    Intent intent = new Intent(getReactApplicationContext(), OverlayService.class);
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