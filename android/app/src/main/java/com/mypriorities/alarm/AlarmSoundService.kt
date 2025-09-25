package com.mypriorities.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.app.KeyguardManager
import android.app.Notification
import android.app.Service
import android.content.SharedPreferences
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.net.Uri
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.core.app.NotificationCompat

class AlarmSoundService : Service() {
    companion object {
        var isPlaying = false
            private set
        var isActivityActive = false
            private set
    }

    private var mediaPlayer: MediaPlayer? = null
    private var vibrator: Vibrator? = null
    private var shouldVibrate = true
    private val vibrationPattern = longArrayOf(0, 1000, 500, 1000) // Wait, vibrate, pause, vibrate

    private val configReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            when (intent.action) {
                "ALARM_CONFIG_CHANGED" -> {
                    // Update vibration setting
                    val prefs = getSharedPreferences("AlarmConfig", Context.MODE_PRIVATE)
                    shouldVibrate = prefs.getBoolean("vibrate", true)
                    
                    // Restart vibration if needed
                    if (isPlaying) {
                        stopVibration()
                        if (shouldVibrate) {
                            startVibration()
                        }
                    }
                }
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        AlarmNotificationHelper.ensureNotificationChannel(this)
        initializeVibrator()
        
        // Register for config changes
        val filter = IntentFilter("ALARM_CONFIG_CHANGED")
        registerReceiver(configReceiver, filter)
    }

    private fun initializeVibrator() {
        vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vibratorManager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        isActivityActive = intent?.getBooleanExtra("activityActive", false) ?: false
        
        // Get preferences
        val prefs = getSharedPreferences("AlarmConfig", Context.MODE_PRIVATE)
        shouldVibrate = prefs.getBoolean("vibrate", true)

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

        // Build the single notification and start foreground with it
        val notification = AlarmNotificationHelper.buildAlarmNotification(
            this,
            title,
            message,
            requestCode,
            includeSound = false, // service handles audio
            showFullScreen = showFullScreen
        )
        startForeground(AlarmNotificationHelper.NOTIFICATION_ID, notification)

        // Get soundUri from preferences
        val soundUriString = prefs.getString("sound_uri", null)
        val soundUri = if (!soundUriString.isNullOrEmpty()) {
            Uri.parse(soundUriString)
        } else {
            AlarmNotificationHelper.getDefaultAlarmUri()
        }

        playAlarmSound(soundUri)
        startVibration()

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

    private fun startVibration() {
        if (!shouldVibrate || vibrator == null) return

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val vibrationEffect = VibrationEffect.createWaveform(vibrationPattern, 0) // repeat at index 0
                vibrator?.vibrate(vibrationEffect)
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(vibrationPattern, 0) // repeat at index 0
            }
        } catch (e: Exception) {
            // Vibration might not be available on this device
            e.printStackTrace()
        }
    }

    private fun stopVibration() {
        try {
            vibrator?.cancel()
        } catch (e: Exception) {
            e.printStackTrace()
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
            unregisterReceiver(configReceiver)
            stopForeground(true)
        } catch (e: Exception) {
            // ignore if not registered or not in foreground
        }
        stopAlarmSound()
        stopVibration()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}