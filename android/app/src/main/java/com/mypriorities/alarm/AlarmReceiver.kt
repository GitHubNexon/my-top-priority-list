package com.mypriorities.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

class AlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action

        when (action) {
            "STOP_ALARM" -> {
                stopAlarm(context)
            }

            "SNOOZE_ALARM" -> {
                snoozeAlarm(context, intent)
            }

            else -> {
                // Normal alarm trigger from AlarmManager
                triggerAlarm(context, intent)
            }
        }
    }

    private fun triggerAlarm(context: Context, intent: Intent) {
        val title = intent.getStringExtra("title") ?: "Alarm"
        val message = intent.getStringExtra("message") ?: "Wake up!"
        val requestCode = intent.getIntExtra("requestCode", -1)
        val recurrenceType = intent.getStringExtra("recurrenceType") ?: RecurrenceHelper.TYPE_ONCE
        val recurrencePattern = intent.getStringExtra("recurrencePattern") ?: ""
        val originalTriggerTime = intent.getLongExtra("originalTriggerTime", System.currentTimeMillis())

        // Start the sound service
        val soundIntent = Intent(context, AlarmSoundService::class.java).apply {
            putExtra("title", title)
            putExtra("message", message)
            putExtra("requestCode", requestCode)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(soundIntent)
        } else {
            context.startService(soundIntent)
        }

        // Reschedule if it's a recurring alarm (except for snoozed alarms)
        if (recurrenceType != RecurrenceHelper.TYPE_ONCE && !title.contains("(Snoozed)")) {
            rescheduleNextAlarm(context, originalTriggerTime, requestCode, title, message, recurrenceType, recurrencePattern)
        }
    }

    private fun rescheduleNextAlarm(
        context: Context,
        originalTriggerTime: Long,
        requestCode: Int,
        title: String,
        message: String,
        recurrenceType: String,
        recurrencePattern: String
    ) {
        val patternMap = RecurrenceHelper.parseRecurrencePattern(recurrencePattern)
        val daysOfWeek = (patternMap["daysOfWeek"] as? Array<*>)?.filterIsInstance<Int>()?.toList() ?: emptyList()
        val dayOfMonth = patternMap["dayOfMonth"] as? Int ?: 0
        val interval = patternMap["interval"] as? Int ?: 1

        val nextTriggerTime = RecurrenceHelper.calculateNextTriggerTime(
            originalTriggerTime,
            recurrenceType,
            recurrencePattern,
            daysOfWeek,
            dayOfMonth,
            interval,
            originalTriggerTime
        )

        if (nextTriggerTime > System.currentTimeMillis()) {
            AlarmScheduler.scheduleRecurringAlarm(
                context,
                nextTriggerTime,
                requestCode,
                title,
                message,
                recurrenceType,
                recurrencePattern
            )
        }
    }

    private fun stopAlarm(context: Context) {
        // Stop alarm sound (service will clean up)
        context.stopService(Intent(context, AlarmSoundService::class.java))
        // Cancel the notification
        AlarmNotificationHelper.cancelAlarmNotification(context)
    }

    private fun snoozeAlarm(context: Context, intent: Intent) {
        val requestCode = intent.getIntExtra("requestCode", -1)
        val title = intent.getStringExtra("title") ?: "Alarm"
        val message = intent.getStringExtra("message") ?: "Wake up!"
        val snoozeMinutes = intent.getIntExtra("snoozeMinutes", 5)

        // Stop current alarm
        stopAlarm(context)

        // Schedule snooze as a one-time alarm
        AlarmScheduler.scheduleSnooze(context, snoozeMinutes, requestCode, title, message)
    }
}