package com.mypriorities.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log

class NotificationTapReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        try {
            Log.d("NotificationTapReceiver", "Notification tapped, handling navigation")
            
            val data = intent.extras
            val noteType = data?.getString("noteType") ?: ""
            
            // Create intent to launch the app
            val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
            launchIntent?.apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
                
                // Add navigation data based on noteType
                when (noteType) {
                    "Priority" -> {
                        putExtra("screen", "Priorities")
                        putExtra("target", "PrioritiesScreen")
                    }
                    else -> {
                        putExtra("screen", "Notes")
                        putExtra("target", "NotesScreen")
                    }
                }
                
                // Add the original notification data
                data?.keySet()?.forEach { key ->
                    val value = data.get(key)
                    if (value != null) {
                        putExtra(key, value.toString())
                    }
                }
            }
            
            context.startActivity(launchIntent)
            
        } catch (e: Exception) {
            Log.e("NotificationTapReceiver", "Error handling notification tap", e)
            
            // Fallback: just open the app
            try {
                val fallbackIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
                fallbackIntent?.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(fallbackIntent)
            } catch (e2: Exception) {
                Log.e("NotificationTapReceiver", "Failed to open app", e2)
            }
        }
    }
}