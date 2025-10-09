package com.mypriorities.alarm

import android.app.AlarmManager
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.annotation.RequiresApi

object PermissionHelper {
    
    /**
     * Request full screen intent permission for Android 14+ (API 34+)
     */
    fun requestFullScreenIntentPermission(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) { // API 34
            try {
                val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                
                if (!canUseFullScreenIntent(notificationManager)) {
                    val intent = Intent(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT).apply {
                        data = Uri.parse("package:${context.packageName}")
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    
                    // Check if the intent can be resolved (settings activity exists)
                    if (intent.resolveActivity(context.packageManager) != null) {
                        context.startActivity(intent)
                    }
                }
            } catch (e: Exception) {
                // Log error but don't crash
                android.util.Log.e("PermissionHelper", "Error requesting full screen intent permission", e)
            }
        }
    }
    
    /**
     * Check if app can use full screen intents
     */
    @RequiresApi(Build.VERSION_CODES.UPSIDE_DOWN_CAKE)
    private fun canUseFullScreenIntent(notificationManager: NotificationManager): Boolean {
        return try {
            notificationManager.canUseFullScreenIntent()
        } catch (e: Exception) {
            // Fallback to true if we can't check (older devices or permission issues)
            true
        }
    }
    
    /**
     * Check if app can schedule exact alarms (Android 12+)
     */
    fun canScheduleExactAlarms(context: Context): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            try {
                val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
                alarmManager.canScheduleExactAlarms()
            } catch (e: Exception) {
                // If we can't check, assume we can schedule (fallback for older devices)
                Build.VERSION.SDK_INT < Build.VERSION_CODES.S
            }
        } else {
            true // Pre-Android 12, always allowed
        }
    }
    
    /**
     * Open app settings for manual permission granting
     */
    fun openAppSettings(context: Context) {
        try {
            val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = Uri.parse("package:${context.packageName}")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            android.util.Log.e("PermissionHelper", "Error opening app settings", e)
        }
    }
}