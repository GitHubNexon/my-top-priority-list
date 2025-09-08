package com.mypriorities.alarm

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat

object AlarmNotificationHelper {
    private const val CHANNEL_ID = "alarm_channel"
    private const val PREFS_NAME = "AlarmConfig"

    fun showNotification(context: Context, title: String, message: String, requestCode: Int) {
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        // Create notification channel for Android 8.0+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Alarm Notifications",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Alarm and reminder notifications"
                setShowBadge(true)
                enableVibration(prefs.getBoolean("vibrate", true))
                
                // Set sound for the channel
                val soundUri = getSoundUri(context, prefs)
                setSound(soundUri, android.media.AudioAttributes.Builder()
                    .setUsage(android.media.AudioAttributes.USAGE_ALARM)
                    .setContentType(android.media.AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build())
            }
            nm.createNotificationChannel(channel)
        }

        val snoozeMinutes = prefs.getInt("snooze_minutes", 5)
        
        // Get icons from configuration
        val smallIconResId = getIconResourceId(context, prefs.getString("small_icon", "ic_alarm"), "drawable")
        val bigIconResId = getIconResourceId(context, prefs.getString("big_icon", "ic_alarm_big"), "drawable")
        
        // Convert big icon resource to Bitmap
        val bigIconBitmap = BitmapFactory.decodeResource(context.resources, bigIconResId)

        val snoozeIntent = Intent(context, SnoozeReceiver::class.java).apply {
            putExtra("requestCode", requestCode)
            putExtra("title", title)
            putExtra("message", message)
            putExtra("snoozeMinutes", snoozeMinutes)
        }
        val snoozePI = PendingIntent.getBroadcast(
            context,
            requestCode,
            snoozeIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val stopIntent = Intent(context, StopAlarmReceiver::class.java).apply {
            putExtra("requestCode", requestCode)
            putExtra("title", title)
            putExtra("message", message)
        }
        val stopPI = PendingIntent.getBroadcast(
            context,
            requestCode + 1,
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val fullScreenIntent = Intent(context, AlarmActivity::class.java).apply {
            putExtra("title", title)
            putExtra("message", message)
            putExtra("requestCode", requestCode)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }
        val fullScreenPI = PendingIntent.getActivity(
            context,
            requestCode + 2,
            fullScreenIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Get sound URI for notification
        val soundUri = getSoundUri(context, prefs)

        // Build notification with sound
        val notificationBuilder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(smallIconResId)
            .setLargeIcon(bigIconBitmap)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setAutoCancel(false)
            .setOngoing(true)
            .setSound(soundUri) // Set the sound here
            .addAction(android.R.drawable.ic_media_pause, "Snooze ($snoozeMinutes min)", snoozePI)
            .addAction(android.R.drawable.ic_delete, "Stop", stopPI)
            .setFullScreenIntent(fullScreenPI, true)

        // Add vibration if enabled
        if (prefs.getBoolean("vibrate", true)) {
            notificationBuilder.setVibrate(longArrayOf(0, 500, 250, 500))
        }

        nm.notify(requestCode, notificationBuilder.build())
    }

    fun cancelNotification(context: Context, requestCode: Int) {
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.cancel(requestCode)
    }

    private fun getIconResourceId(context: Context, resourceName: String?, defType: String): Int {
        if (resourceName.isNullOrEmpty()) {
            return android.R.drawable.ic_dialog_alert
        }
        
        return try {
            val resId = context.resources.getIdentifier(resourceName, defType, context.packageName)
            if (resId == 0) {
                android.R.drawable.ic_dialog_alert
            } else {
                resId
            }
        } catch (e: Exception) {
            android.R.drawable.ic_dialog_alert
        }
    }

    private fun getSoundUri(context: Context, prefs: SharedPreferences): Uri {
        val soundUriString = prefs.getString("sound_uri", null)
        return if (!soundUriString.isNullOrEmpty()) {
            Uri.parse(soundUriString)
        } else {
            // Default alarm sound
            RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
        }
    }
}