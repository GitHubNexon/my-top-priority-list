package com.mypriorities.alarm

import android.app.Notification
import android.app.Service
import android.content.Intent
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.net.Uri
import android.os.IBinder
import androidx.core.app.NotificationCompat
import android.util.Log

class AlarmSoundService : Service() {
    companion object {
        var isPlaying = false
            private set
    }

    private var mediaPlayer: MediaPlayer? = null

    override fun onCreate() {
        super.onCreate()
        Log.d("AlarmSoundService", "Service created")
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

        startForeground(1002, buildSilentNotification())

        playAlarmSound(soundUri)

        return START_STICKY
    }

    private fun playAlarmSound(uri: Uri?) {
        stopAlarmSound() // safety

        mediaPlayer = MediaPlayer().apply {
            setAudioAttributes(
                AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build()
            )
            setDataSource(applicationContext, uri ?: AlarmNotificationHelper.getDefaultAlarmUri())
            isLooping = true
            prepare()
            start()
        }
        Log.d("AlarmSoundService", "Playing alarm sound on STREAM_ALARM")
    }

    private fun buildSilentNotification(): Notification {
        return NotificationCompat.Builder(this, "alarm_channel")
            .setContentTitle("Alarm ringing")
            .setContentText("Tap Stop or Snooze to dismiss")
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
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
