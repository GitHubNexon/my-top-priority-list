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

    fun showAlarmNotification(context: Context, title: String, message: String) {
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        // Create channel
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
            }
            nm.createNotificationChannel(channel)
        }

        val snoozeMinutes = prefs.getInt("snooze_minutes", 5)

        // --- PendingIntents for actions ---
        // Snooze button
        val snoozeIntent = Intent(context, AlarmReceiver::class.java).apply {
            action = "SNOOZE_ALARM"
            putExtra("snoozeMinutes", snoozeMinutes)
        }
        val snoozePI = PendingIntent.getBroadcast(
            context,
            2001,
            snoozeIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        // Swipe/Dismiss -> same as snooze
        val dismissIntent = Intent(context, AlarmReceiver::class.java).apply {
            action = "SNOOZE_ALARM"
            putExtra("snoozeMinutes", snoozeMinutes)
        }
        val dismissPI = PendingIntent.getBroadcast(
            context,
            2004,
            dismissIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val stopIntent = Intent(context, AlarmReceiver::class.java).apply {
            action = "STOP_ALARM"
        }
        val stopPI = PendingIntent.getBroadcast(
            context,
            2002,
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val fullScreenIntent = Intent(context, AlarmActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }
        val fullScreenPI = PendingIntent.getActivity(
            context,
            2003,
            fullScreenIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val soundUri = getSoundUri(context, prefs)

        val notificationBuilder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setLargeIcon(BitmapFactory.decodeResource(context.resources, android.R.drawable.ic_lock_idle_alarm))
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setAutoCancel(true) // allow swipe
            .setOngoing(false)   // must be false to allow swipe dismiss
            .setDeleteIntent(dismissPI) // <-- important
            .setFullScreenIntent(fullScreenPI, true)
            .addAction(android.R.drawable.ic_media_pause, "Snooze ($snoozeMinutes min)", snoozePI)
            .addAction(android.R.drawable.ic_delete, "Stop", stopPI)


        if (prefs.getBoolean("vibrate", true)) {
            notificationBuilder.setVibrate(longArrayOf(0, 1000, 500, 1000))
        }

        nm.notify(NOTIFICATION_ID, notificationBuilder.build())
    }

    fun cancelAlarmNotification(context: Context) {
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.cancel(NOTIFICATION_ID)
    }

    fun getSoundUri(context: Context, prefs: SharedPreferences): Uri {
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
    }
}