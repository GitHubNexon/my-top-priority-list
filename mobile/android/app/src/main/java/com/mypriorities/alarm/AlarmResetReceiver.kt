package com.mypriorities.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

/**
 * Handles alarm reset broadcasts to immediately stop ongoing alarms
 * and close any active full-screen AlarmActivity.
 *
 * Actions:
 * - ALARM_CONFIG_CLEARED → triggered when config or data is wiped
 * - ALARM_STOP_ALL → triggered when all alarms should be stopped manually
 */
class AlarmResetReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        Log.d("AlarmResetReceiver", "Received action: $action")

        when (action) {
            "ALARM_CONFIG_CLEARED", "ALARM_STOP_ALL" -> {
                try {
                    // Stop any playing sound or vibration
                    context.stopService(Intent(context, AlarmSoundService::class.java))

                    // Cancel ongoing notification
                    AlarmNotificationHelper.cancelAlarmNotification(context)

                    // Close any open full-screen alarm activity
                    val closeIntent = Intent("CLOSE_ALARM_ACTIVITY")
                    context.sendBroadcast(closeIntent)

                    Log.d("AlarmResetReceiver", "All alarms stopped and UI closed.")
                } catch (e: Exception) {
                    Log.e("AlarmResetReceiver", "Error handling reset broadcast", e)
                }
            }
        }
    }
}