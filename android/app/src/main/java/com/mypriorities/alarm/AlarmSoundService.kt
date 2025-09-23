package com.mypriorities.alarm

import android.app.KeyguardManager
import android.app.Notification
import android.app.Service
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.net.Uri
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import androidx.core.app.NotificationCompat

class AlarmSoundService : Service() {
    companion object {
        var isPlaying = false
            private set
        var isActivityActive = false
            private set
    }

    private var mediaPlayer: MediaPlayer? = null

    override fun onCreate() {
        super.onCreate()
        AlarmNotificationHelper.ensureNotificationChannel(this)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        isActivityActive = intent?.getBooleanExtra("activityActive", false) ?: false
    
        // Only start full-screen activity if no activity is active and screen is off
        if (!isActivityActive) {
            val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
            val keyguardManager = getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
            val showFullScreen = !powerManager.isInteractive || keyguardManager.isKeyguardLocked
        
            if (showFullScreen) {
                val title = intent?.getStringExtra("title") ?: "Alarm"
                val message = intent?.getStringExtra("message") ?: "Wake up!"
                val requestCode = intent?.getIntExtra("requestCode", -1) ?: -1
                
                val fullScreenIntent = Intent(this, AlarmActivity::class.java).apply {
                    putExtra("title", title)
                    putExtra("message", message)
                    putExtra("requestCode", requestCode)
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
                }
                startActivity(fullScreenIntent)
            }
        }

        // If already playing, we still ensure notification is present and return
        if (isPlaying) {
            // Ensure notification still exists in case service restarted
            val title = intent?.getStringExtra("title") ?: "Alarm"
            val message = intent?.getStringExtra("message") ?: "Wake up!"
            val requestCode = intent?.getIntExtra("requestCode", -1) ?: -1
            val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
            val showFullscreen = !pm.isInteractive
            val notification = AlarmNotificationHelper.buildAlarmNotification(
                this,
                title,
                message,
                requestCode,
                includeSound = false,
                showFullScreen = showFullscreen
            )
            startForeground(AlarmNotificationHelper.NOTIFICATION_ID, notification)
            return START_STICKY
        }

        isPlaying = true

        val title = intent?.getStringExtra("title") ?: "Alarm"
        val message = intent?.getStringExtra("message") ?: "Wake up!"
        val requestCode = intent?.getIntExtra("requestCode", -1) ?: -1

        
        // Decide whether to show fullscreen -> when device is not interactive (screen off / locked)
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        val keyguardManager = getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
        val showFullScreen = !powerManager.isInteractive || keyguardManager.isKeyguardLocked

        // If device is locked/screen off, start the full-screen activity
        if (showFullScreen) {
            val fullScreenIntent = Intent(this, AlarmActivity::class.java).apply {
                putExtra("title", title)
                putExtra("message", message)
                putExtra("requestCode", requestCode)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            }
            startActivity(fullScreenIntent)
        }
        
        // Build the single notification and start foreground with it (this replaces separate notification)
        val notification = AlarmNotificationHelper.buildAlarmNotification(
            this,
            title,
            message,
            requestCode,
            includeSound = false, // service handles audio
            showFullScreen = showFullScreen
        )
        startForeground(AlarmNotificationHelper.NOTIFICATION_ID, notification)

        // Play alarm sound (service controls playback so notification can remain silent)
        val soundUri: Uri? = intent?.getParcelableExtra("soundUri")
            ?: AlarmNotificationHelper.getDefaultAlarmUri()

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
                }
                setOnErrorListener { _, what, extra ->
                    false
                }
                prepareAsync()
            }
        } catch (e: Exception) {
            stopSelf()
        }
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
        try {
            stopForeground(true)
        } catch (e: Exception) {
            // ignore if not in foreground
        }
        stopAlarmSound()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}