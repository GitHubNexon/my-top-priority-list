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
        val intent = Intent(context, AlarmReceiver::class.java).apply {
            putExtra("requestCode", requestCode)
            putExtra("title", title)
            putExtra("message", message)
            putExtra("recurrenceType", recurrenceType)
            putExtra("recurrencePattern", recurrencePattern)
            putExtra("originalTriggerTime", triggerAtMillis)
        }

        val pi = PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        when (recurrenceType) {
            RecurrenceHelper.TYPE_DAILY -> {
                // For exact daily recurrence
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pi)
                } else {
                    am.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, pi)
                }
            }
            RecurrenceHelper.TYPE_WEEKLY -> {
                // For exact weekly recurrence
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pi)
                } else {
                    am.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, pi)
                }
            }
            RecurrenceHelper.TYPE_MONTHLY -> {
                // For exact monthly recurrence
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pi)
                } else {
                    am.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, pi)
                }
            }
            RecurrenceHelper.TYPE_CUSTOM -> {
                // Handle custom intervals
                val pattern = RecurrenceHelper.parseRecurrencePattern(recurrencePattern)
                val interval = pattern["interval"] as? Int ?: 1
                if (interval > 0) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pi)
                    } else {
                        am.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, pi)
                    }
                }
            }
            else -> { // TYPE_ONCE or unknown
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pi)
                } else {
                    am.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, pi)
                }
            }
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

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            generateSnoozeRequestCode(requestCode),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
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