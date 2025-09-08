package com.mypriorities.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class StopAlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val requestCode = intent.getIntExtra("requestCode", 1001)

        // Stop ringing
        context.stopService(Intent(context, AlarmSoundService::class.java))

        // Cancel the notification
        AlarmNotificationHelper.cancelNotification(context, requestCode)

        // Cancel the alarm
        AlarmScheduler.cancelAlarm(context, requestCode)
    }
}