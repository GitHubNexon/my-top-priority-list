package com.mypriorities.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
        val title = intent?.getStringExtra("title") ?: "Alarm"
        val message = intent?.getStringExtra("message") ?: "Alarm!"
        val requestCode = intent?.getIntExtra("requestCode", 1001) ?: 1001
        val recurrenceType = intent?.getStringExtra("recurrenceType") ?: "ONCE"
        val recurrencePattern = intent?.getStringExtra("recurrencePattern") ?: ""

        Log.d("AlarmReceiver", "Alarm triggered: $title - $message")

        // Show actionable notification + full-screen intent (sound is now handled by notification)
        AlarmNotificationHelper.showNotification(context, title, message, requestCode)

        // Start the service to keep the app alive (but no sound playing)
        context.startService(Intent(context, AlarmSoundService::class.java).apply {
            putExtra("requestCode", requestCode)
            putExtra("title", title)
            putExtra("message", message)
        })

        // Reschedule if it's a recurring alarm
        if (RecurrenceHelper.shouldReschedule(recurrenceType) && intent != null) {
            rescheduleRecurringAlarm(context, intent)
        }
    }

    private fun rescheduleRecurringAlarm(context: Context, intent: Intent) {
        try {
            val requestCode = intent.getIntExtra("requestCode", 1001)
            val title = intent.getStringExtra("title") ?: "Alarm"
            val message = intent.getStringExtra("message") ?: "Alarm!"
            val recurrenceType = intent.getStringExtra("recurrenceType") ?: "ONCE"
            val recurrencePattern = intent.getStringExtra("recurrencePattern") ?: ""
            
            val patternMap = RecurrenceHelper.parseRecurrencePattern(recurrencePattern)
            val daysOfWeek = (patternMap["daysOfWeek"] as? Array<*>)?.filterIsInstance<Int>() ?: emptyList()
            val dayOfMonth = (patternMap["dayOfMonth"] as? Int) ?: 0
            val interval = (patternMap["interval"] as? Int) ?: 1
            
            val nextTriggerTime = RecurrenceHelper.calculateNextTriggerTime(
                System.currentTimeMillis(),
                recurrenceType,
                recurrencePattern,
                daysOfWeek,
                dayOfMonth,
                interval,
                System.currentTimeMillis()
            )
            
            AlarmScheduler.scheduleRecurringAlarm(
                context,
                nextTriggerTime,
                requestCode,
                title,
                message,
                recurrenceType,
                recurrencePattern
            )
            
        } catch (e: Exception) {
            Log.e("AlarmReceiver", "Error rescheduling recurring alarm", e)
        }
    }
}