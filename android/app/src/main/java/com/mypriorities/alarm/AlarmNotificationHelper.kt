package com.mypriorities.alarm

import android.app.Notification
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
    const val CHANNEL_ID = "alarm_channel"
    const val PREFS_NAME = "AlarmConfig"
    const val NOTIFICATION_ID = 1001

    /**
     * Ensure notification channel exists. Safe to call repeatedly.
     */
    fun ensureNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            val soundUri = getSoundUri(context, prefs)

            // Check if channel already exists
            val existingChannel = nm.getNotificationChannel(CHANNEL_ID)
            if (existingChannel != null) {
                return // Channel already exists
            }

            val channel = NotificationChannel(
                CHANNEL_ID,
                "Alarms",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Alarms and reminders"
                enableVibration(prefs.getBoolean("vibrate", true))
                setSound(null, null)
                setBypassDnd(true)
                lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
            }
            nm.createNotificationChannel(channel)
        }
    }

    /**
     * Build a Notification object for the alarm. The service should call startForeground(...)
     * with this notification so only one notification exists.
     *
     * @param includeSound if true the notification itself will set sound/vibration (useful for
     *                     cases where you want the notification to play sound). If false the
     *                     service is assumed to be playing audio.
     * @param showFullScreen whether to setFullScreenIntent (used when screen is off/locked).
     */
    fun buildAlarmNotification(
        context: Context,
        title: String,
        message: String,
        requestCode: Int,
        includeSound: Boolean = false,
        showFullScreen: Boolean = false,
        noteType: String? = null
    ): Notification {
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        ensureNotificationChannel(context)

        val contentIntent = Intent(context, NotificationTapReceiver::class.java).apply {
            putExtra("title", title)
            putExtra("message", message)
            putExtra("requestCode", requestCode)
            putExtra("noteType", noteType) // Add noteType to intent
            putExtra("timestamp", System.currentTimeMillis())
        }
        val contentPI = PendingIntent.getBroadcast(
            context,
            generateActionRequestCode(requestCode, 5), // Use a new request code
            contentIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Snooze action -> uses dedicated SnoozeReceiver
        val snoozeIntent = Intent(context, SnoozeReceiver::class.java).apply {
            action = "SNOOZE_ALARM"
            putExtra("snoozeMinutes", prefs.getInt("snooze_minutes", 5))
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

        // Stop action -> uses dedicated StopAlarmReceiver
        val stopIntent = Intent(context, StopAlarmReceiver::class.java).apply {
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

        // Delete intent (when swiped away) - use StopReceiver to ensure sound stops
        val deleteIntent = Intent(context, StopAlarmReceiver::class.java).apply {
            action = "STOP_ALARM"
            putExtra("requestCode", requestCode)
        }
        val deletePI = PendingIntent.getBroadcast(
            context,
            generateActionRequestCode(requestCode, 4),
            deleteIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Use configured icons instead of hardcoded ones
        val smallIconName = prefs.getString("small_icon", "ic_alarm")
        val bigIconName = prefs.getString("big_icon", "ic_alarm_big")
        
        val smallIconResId = context.resources.getIdentifier(smallIconName, "drawable", context.packageName)
        val bigIconResId = context.resources.getIdentifier(bigIconName, "drawable", context.packageName)

        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(
                if (smallIconResId != 0) smallIconResId 
                else android.R.drawable.ic_lock_idle_alarm) // Use configured icon
            .setLargeIcon(BitmapFactory.decodeResource(context.resources, android.R.drawable.ic_lock_idle_alarm))
            .setContentIntent(contentPI)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setAutoCancel(false)
            .setOngoing(true)
            .setFullScreenIntent(fullScreenPI, showFullScreen)
            .setDeleteIntent(deletePI)
            .addAction(android.R.drawable.ic_media_pause, "Snooze (${prefs.getInt("snooze_minutes", 5)} min)", snoozePI)
            .addAction(android.R.drawable.ic_delete, "Stop", stopPI)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)

        if (bigIconResId != 0) {
            builder.setLargeIcon(BitmapFactory.decodeResource(context.resources, bigIconResId))
        }

        // Set sound/vibrate only if requested (service may handle audio)
        if (includeSound) {
            val soundUri = getSoundUri(context, prefs)
            builder.setSound(soundUri)
            if (prefs.getBoolean("vibrate", true)) {
                builder.setVibrate(longArrayOf(0, 1000, 500, 1000, 500, 1000)) // More pronounced pattern
            }
        } else {
            /**
             * DON'T USE @param builder.setSilent(true)
             * Since setSilent(true) marks it “non-interruptive,”
             * Android treats it as a non-urgent background notification
             * and blocks your full-screen intent when the screen is off.
             */
            builder.setSound(null)
            builder.setVibrate(null)
            builder.setDefaults(0) // disables default sound/vibration
        }

        return builder.build()
    }

    fun cancelAlarmNotification(context: Context) {
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.cancel(NOTIFICATION_ID)
    }

    private fun getSoundUri(context: Context, prefs: SharedPreferences): Uri {
        val soundUriString = prefs.getString("sound_uri", null)
        return if (!soundUriString.isNullOrEmpty()) {
            Uri.parse(soundUriString)
        } else {
            getDefaultAlarmUri()
        }
    }

    fun getCustomAlarmUri(context: Context): Uri? {
        return try {
            // Check if the raw resource exists
            val resId = context.resources.getIdentifier("urgent", "raw", context.packageName)
            if (resId != 0) {
                Uri.parse("android.resource://" + context.packageName + "/" + resId)
            } else {
                null
            }
        } catch (e: Exception) {
            null
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