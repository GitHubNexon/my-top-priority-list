package com.mypriorities.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED ||
            intent.action == Intent.ACTION_LOCKED_BOOT_COMPLETED ||
            intent.action == "android.intent.action.QUICKBOOT_POWERON") {
            
            Log.d("BootReceiver", "Device booted, restoring alarms...")
            
            // Initialize encryption if needed
            if (!AlarmStorageHelper.isInitialized()) {
                AlarmStorageHelper.initializeEncryption(context)
            }
            
            // First, restore alarms in native code (this is crucial)
            restoreAlarmsAfterBoot(context)
            
            // Then start the headless JS service
            try {
                val serviceIntent = Intent(context, BootRestoreService::class.java)
                context.startService(serviceIntent)
                Log.d("BootReceiver", "Started BootRestoreService")
            } catch (e: Exception) {
                Log.e("BootReceiver", "Failed to start BootRestoreService", e)
            }
        }
    }
    
    private fun restoreAlarmsAfterBoot(context: Context) {
        try {
            // Get all stored alarms
            val alarms = AlarmStorageHelper.getAllAlarms(context)
            Log.d("BootReceiver", "Found ${alarms.size} alarms to restore")
            
            // Reschedule each alarm
            alarms.forEach { alarm ->
                if (alarm.isActive && alarm.timestamp > System.currentTimeMillis()) {
                    try {
                        AlarmScheduler.scheduleRecurringAlarm(
                            context,
                            alarm.timestamp,
                            alarm.requestCode,
                            alarm.title,
                            alarm.message,
                            alarm.recurrenceType,
                            alarm.recurrencePattern
                        )
                        Log.d("BootReceiver", "Restored alarm: ${alarm.title} at ${alarm.timestamp}")
                    } catch (e: Exception) {
                        Log.e("BootReceiver", "Failed to restore alarm ${alarm.title}", e)
                    }
                } else if (alarm.timestamp <= System.currentTimeMillis()) {
                    Log.d("BootReceiver", "Skipping expired alarm: ${alarm.title}")
                    // Remove expired alarms
                    AlarmStorageHelper.removeAlarm(context, alarm.requestCode)
                }
            }
        } catch (e: Exception) {
            Log.e("BootReceiver", "Error restoring alarms", e)
        }
    }
}