package com.mypriorities.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class StopAlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val requestCode = intent.getIntExtra("requestCode", 1001)

        Log.d("StopAlarmReceiver", "onReceive STOP_ALARM requestCode=$requestCode")

        try {
            context.stopService(Intent(context, AlarmSoundService::class.java))
        } catch (e: Exception) {
            e.printStackTrace()
        }

        try {
            AlarmNotificationHelper.cancelAlarmNotification(context)
        } catch (e: Exception) {
            e.printStackTrace()
        }

        try {
            AlarmScheduler.cancelAlarm(context, requestCode)
        } catch (e: Exception) {
            e.printStackTrace()
        }

        try {
            val finishIntent = Intent().apply {
                action = "STOP_ALARM"
                putExtra("requestCode", requestCode)
            }
            context.sendBroadcast(finishIntent)
            Log.d("StopAlarmReceiver", "Broadcasted STOP_ALARM")
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}