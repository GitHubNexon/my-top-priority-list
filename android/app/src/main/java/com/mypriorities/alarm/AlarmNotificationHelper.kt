package com.mypriorities.alarm

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.graphics.BitmapFactory
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat

object AlarmNotificationHelper {
    private const val CHANNEL_ID = "alarm_channel"
    private const val PREFS_NAME = "AlarmConfig"
    private const val NOTIFICATION_ID = 1001

    fun showAlarmNotification(context: Context, title: String, message: String, requestCode: Int) {
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        createNotificationChannel(context, nm, prefs)

        val snoozeMinutes = prefs.getInt("snooze_minutes", 5)

        // Snooze action
        val snoozeIntent = Intent(context, AlarmReceiver::class.java).apply {
            action = "SNOOZE_ALARM"
            putExtra("snoozeMinutes", snoozeMinutes)
            putExtra("requestCode", requestCode)
            putExtra("title", title)
            putExtra("message", message)
        }
        val snoozePI = PendingIntent.getBroadcast(
            context,
            generateActionRequestCode(requestCode, 1),
            snoozeIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Stop action
        val stopIntent = Intent(context, AlarmReceiver::class.java).apply {
            action = "STOP_ALARM"
            putExtra("requestCode", requestCode)
        }
        val stopPI = PendingIntent.getBroadcast(
            context,
            generateActionRequestCode(requestCode, 2),
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Fullscreen activity intent
        val fullScreenIntent = Intent(context, AlarmActivity::class.java).apply {
            putExtra("title", title)
            putExtra("message", message)
            putExtra("requestCode", requestCode)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }
        val fullScreenPI = PendingIntent.getActivity(
            context,
            generateActionRequestCode(requestCode, 3),
            fullScreenIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Delete intent (when swiped away) - STOP the alarm
        val deleteIntent = Intent(context, AlarmReceiver::class.java).apply {
            action = "STOP_ALARM"
            putExtra("requestCode", requestCode)
        }
        val deletePI = PendingIntent.getBroadcast(
            context,
            generateActionRequestCode(requestCode, 4),
            deleteIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notificationBuilder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setLargeIcon(BitmapFactory.decodeResource(context.resources, android.R.drawable.ic_lock_idle_alarm))
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setAutoCancel(false) // Don't auto-cancel when clicked
            .setOngoing(true)     // Make it ongoing to prevent swipe
            .setDeleteIntent(deletePI) // Stop alarm when swiped away
            .setFullScreenIntent(fullScreenPI, true)
            .addAction(android.R.drawable.ic_media_pause, "Snooze ($snoozeMinutes min)", snoozePI)
            .addAction(android.R.drawable.ic_delete, "Stop", stopPI)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)

        // Only set sound/vibration if not already playing through service
        if (!AlarmSoundService.isPlaying) {
            val soundUri = getSoundUri(context, prefs)
            notificationBuilder.setSound(soundUri)
            
            if (prefs.getBoolean("vibrate", true)) {
                notificationBuilder.setVibrate(longArrayOf(0, 1000, 500, 1000))
            }
        }

        nm.notify(NOTIFICATION_ID, notificationBuilder.build())
    }

    fun cancelAlarmNotification(context: Context) {
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.cancel(NOTIFICATION_ID)
    }

    private fun createNotificationChannel(context: Context, nm: NotificationManager, prefs: SharedPreferences) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Alarm Notifications",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Alarm and reminder notifications"
                enableVibration(prefs.getBoolean("vibrate", true))
                
                val soundUri = getSoundUri(context, prefs)
                setSound(
                    soundUri,
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
                
                setBypassDnd(true)
                lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
                importance = NotificationManager.IMPORTANCE_HIGH
            }
            nm.createNotificationChannel(channel)
        }
    }

    private fun getSoundUri(context: Context, prefs: SharedPreferences): Uri {
        val soundUriString = prefs.getString("sound_uri", null)
        return if (!soundUriString.isNullOrEmpty()) {
            Uri.parse(soundUriString)
        } else {
            getDefaultAlarmUri()
        }
    }

    fun getDefaultAlarmUri(): Uri {
        return RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
            ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
            ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
    }

    private fun generateActionRequestCode(baseRequestCode: Int, actionType: Int): Int {
        return (baseRequestCode.toString() + actionType.toString()).hashCode() and 0x7FFFFFFF
    }
}