package com.mypriorities.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class SnoozeReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        Log.d("SnoozeReceiver", "onReceive SNOOZE_ALARM intent=$intent")

        try {
            context.stopService(Intent(context, AlarmSoundService::class.java))
        } catch (e: Exception) {
            e.printStackTrace()
        }

        val originalRequestCode = intent.getIntExtra("requestCode", System.currentTimeMillis().toInt())
        val title = intent.getStringExtra("title") ?: "Snoozed Alarm"
        val message = intent.getStringExtra("message") ?: "Snoozed Alarm"
        val snoozeMinutes = intent.getIntExtra("snoozeMinutes", 10)

        try {
            val snoozeTime = System.currentTimeMillis() + (snoozeMinutes * 60 * 1000L)
            val snoozeRequestCode = (originalRequestCode.toString() + "_snooze_" + snoozeTime).hashCode()
            AlarmScheduler.scheduleAlarm(
                context,
                snoozeTime,
                snoozeRequestCode,
                snoozeRequestCode.toString(),
                "$title (Snoozed)",
                message,
                RecurrenceHelper.TYPE_ONCE,
                ""
            )
            AlarmNotificationHelper.cancelAlarmNotification(context)
        } catch (e: Exception) {
            e.printStackTrace()
        }

        try {
            val finishIntent = Intent().apply {
                action = "SNOOZE_ALARM"
                putExtra("requestCode", originalRequestCode)
            }
            context.sendBroadcast(finishIntent)
            Log.d("SnoozeReceiver", "Broadcasted SNOOZE_ALARM")
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}