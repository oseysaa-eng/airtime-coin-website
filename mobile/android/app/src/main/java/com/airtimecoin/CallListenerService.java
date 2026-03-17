package com.atcapp;

import android.telephony.PhoneStateListener;
import android.telephony.TelephonyManager;
import android.content.Context;
import android.content.Intent;

public class CallListenerService extends PhoneStateListener {

    private static long callStartTime = 0;

    @Override
    public void onCallStateChanged(int state, String incomingNumber) {

        if(state == TelephonyManager.CALL_STATE_OFFHOOK) {

            callStartTime = System.currentTimeMillis();

            Intent intent = new Intent("CALL_STARTED");
            intent.putExtra("timestamp", callStartTime);
        }

        if(state == TelephonyManager.CALL_STATE_IDLE) {

            long duration =
                (System.currentTimeMillis() - callStartTime) / 1000;

            Intent intent = new Intent("CALL_ENDED");
            intent.putExtra("duration", duration);
        }
    }
}