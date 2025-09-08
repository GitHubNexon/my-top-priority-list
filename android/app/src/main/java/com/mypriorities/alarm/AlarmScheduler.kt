package com.mypriorities.alarm

import android.util.Log
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent

object AlarmScheduler {
    fun scheduleAlarm(
        context: Context,
        triggerAtMillis: Long,
        requestCode: Int,
        title: String,
        message: String,
        recurrenceType: String,
        recurrencePattern: String
    ) {
        scheduleRecurringAlarm(
            context,
            triggerAtMillis,
            requestCode,
            title,
            message,
            recurrenceType,
            recurrencePattern
        )
    }

    fun scheduleRecurringAlarm(
        context: Context,
        triggerAtMillis: Long,
        requestCode: Int,
        title: String,
        message: String,
        recurrenceType: String,
        recurrencePattern: String
    ) {
        val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(context, AlarmReceiver::class.java).apply {
            putExtra("requestCode", requestCode)
            putExtra("title", title)
            putExtra("message", message)
            putExtra("recurrenceType", recurrenceType)
            putExtra("recurrencePattern", recurrencePattern)
        }

        val pi = PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        am.setExactAndAllowWhileIdle(
            AlarmManager.RTC_WAKEUP,
            triggerAtMillis,
            pi
        )
    }

    fun scheduleSnooze(context: Context, minutes: Int) {
        val snoozeTime = System.currentTimeMillis() + minutes * 60 * 1000

        val intent = Intent(context, AlarmReceiver::class.java)
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            2001,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, snoozeTime, pendingIntent)

        Log.d("AlarmScheduler", "Snooze set for $minutes minutes later")
    }

    fun cancelAlarm(context: Context, requestCode: Int) {
        val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(context, AlarmReceiver::class.java)
        val pi = PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        am.cancel(pi)
        pi.cancel()
    }
}