package com.mypriorities.alarm

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.net.Uri
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat

class AlarmSoundService : Service() {
    companion object {
        var isPlaying = false
            private set
        const val NOTIFICATION_ID = 1002
    }

    private var mediaPlayer: MediaPlayer? = null

    override fun onCreate() {
        super.onCreate()
        Log.d("AlarmSoundService", "Service created")
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (isPlaying) {
            Log.d("AlarmSoundService", "Sound already playing, skipping")
            return START_STICKY
        }

        isPlaying = true

        Log.d("AlarmSoundService", "Service started")

        val soundUri: Uri? = intent?.getParcelableExtra("soundUri")
            ?: AlarmNotificationHelper.getDefaultAlarmUri()

        startForeground(NOTIFICATION_ID, buildForegroundNotification())

        playAlarmSound(soundUri)

        return START_STICKY
    }

    private fun playAlarmSound(uri: Uri?) {
        try {
            stopAlarmSound() // safety

            mediaPlayer = MediaPlayer().apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
                setDataSource(applicationContext, uri ?: AlarmNotificationHelper.getDefaultAlarmUri())
                setOnPreparedListener { mp ->
                    mp.isLooping = true
                    mp.start()
                    Log.d("AlarmSoundService", "Alarm sound started looping")
                }
                setOnErrorListener { mp, what, extra ->
                    Log.e("AlarmSoundService", "MediaPlayer error: $what, $extra")
                    false
                }
                prepareAsync() // Use async to avoid ANR
            }
        } catch (e: Exception) {
            Log.e("AlarmSoundService", "Error playing alarm sound", e)
            stopSelf()
        }
    }

    private fun createNotificationChannel() {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "alarm_sound_channel",
                "Alarm Sound",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Alarm sound playback"
                setShowBadge(false)
                lockscreenVisibility = Notification.VISIBILITY_PRIVATE
            }
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun buildForegroundNotification(): Notification {
        return NotificationCompat.Builder(this, "alarm_sound_channel")
            .setContentTitle("Alarm is ringing")
            .setContentText("Swipe down notification to stop alarm")
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .setSilent(true)
            .build()
    }

    private fun stopAlarmSound() {
        mediaPlayer?.let {
            if (it.isPlaying) it.stop()
            it.release()
        }
        mediaPlayer = null
        isPlaying = false
    }

    override fun onDestroy() {
        Log.d("AlarmSoundService", "Service destroyed")
        stopAlarmSound()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}