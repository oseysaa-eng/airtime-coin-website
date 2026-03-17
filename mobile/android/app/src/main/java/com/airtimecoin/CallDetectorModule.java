package com.atcapp;

import com.facebook.react.bridge.*;

public class CallDetectorModule extends ReactContextBaseJavaModule {

    public CallDetectorModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "CallDetector";
    }

    @ReactMethod
    public void startListener() {
        // Start telephony listener
    }
}