package com.mypriorities.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import org.json.JSONObject
import java.util.Calendar

object AlarmScheduler {
    fun scheduleAlarm(
        context: Context,
        triggerAtMillis: Long,
        requestCode: Int,
        requestCodeStr: String,
        title: String,
        message: String,
        recurrenceType: String,
        recurrencePattern: String
    ) {
        // Save to storage
        val alarmItem = AlarmItem(
            requestCode = requestCode,
            requestCodeStr = requestCodeStr,
            timestamp = triggerAtMillis,
            title = title,
            message = message,
            recurrenceType = recurrenceType,
            recurrencePattern = recurrencePattern
        )
        AlarmStorageHelper.saveAlarm(context, alarmItem)

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

        // Prepare intent extras common to both flows
        val extras = android.os.Bundle().apply {
            putInt("requestCode", requestCode)
            putString("title", title)
            putString("message", message)
            putString("recurrenceType", recurrenceType)
            putString("recurrencePattern", recurrencePattern)
            putLong("originalTriggerTime", triggerAtMillis)
        }

        val pi = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            // Directly start the foreground service via PendingIntent
            val svcIntent = Intent(context, AlarmSoundService::class.java)
            svcIntent.putExtras(extras)
            PendingIntent.getForegroundService(
                context,
                requestCode,
                svcIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
        } else {
            // Fallback: trigger the BroadcastReceiver
            val intent = Intent(context, AlarmReceiver::class.java)
            intent.putExtras(extras)
            PendingIntent.getBroadcast(
                context,
                requestCode,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pi)
        } else {
            am.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, pi)
        }
    }

    fun scheduleSnooze(context: Context, minutes: Int, requestCode: Int, title: String, message: String) {
        val snoozeTime = System.currentTimeMillis() + minutes * 60 * 1000L

        // Generate a unique request code string for the snooze
        val snoozeRequestCodeStr = "snooze_${requestCode}_${System.currentTimeMillis()}"
        val snoozeRequestCode = AlarmStorageHelper.generateRequestCode(snoozeRequestCodeStr)

        val intent = Intent(context, AlarmReceiver::class.java).apply {
            putExtra("requestCode", snoozeRequestCode)
            putExtra("title", "$title (Snoozed)")
            putExtra("message", message)
            putExtra("recurrenceType", RecurrenceHelper.TYPE_ONCE)
            putExtra("recurrencePattern", "") // Add empty pattern
            putExtra("originalTriggerTime", snoozeTime)
        }
        
        val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

        val pendingIntent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val svcIntent = Intent(context, AlarmSoundService::class.java).apply {
                putExtra("requestCode", snoozeRequestCode)
                putExtra("title", "$title (Snoozed)")
                putExtra("message", message)
                putExtra("recurrenceType", RecurrenceHelper.TYPE_ONCE)
                putExtra("recurrencePattern", "")
                putExtra("originalTriggerTime", snoozeTime)
                putExtra("shouldHandleVibration", true)
            }
            PendingIntent.getForegroundService(
                context,
                generateSnoozeRequestCode(requestCode),
                svcIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
        } else {
            PendingIntent.getBroadcast(
                context,
                generateSnoozeRequestCode(requestCode),
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, snoozeTime, pendingIntent)
        } else {
            am.setExact(AlarmManager.RTC_WAKEUP, snoozeTime, pendingIntent)
        }

        // Also save to storage
        AlarmScheduler.scheduleAlarm(
            context,
            snoozeTime,
            snoozeRequestCode,
            snoozeRequestCodeStr,
            "$title (Snoozed)",
            message,
            RecurrenceHelper.TYPE_ONCE,
            ""
        )
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

    private fun generateSnoozeRequestCode(originalRequestCode: Int): Int {
        return (originalRequestCode.toString() + "snooze").hashCode() and 0x7FFFFFFF
    }
}