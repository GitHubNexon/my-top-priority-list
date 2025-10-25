package com.mypriorities.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.app.KeyguardManager
import android.app.Notification
import android.app.Service
import android.content.pm.ServiceInfo
import android.content.SharedPreferences
import androidx.core.app.NotificationCompat
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.net.Uri
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager

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
    private var shouldHandleVibration = false // Default to false, let activity handle it
    private var alarmStartTime: Long = 0
    private var maxAlarmDuration: Int = 0 // 0 means infinite
    private var autoSnoozeOnTimeout: Boolean = false
    private var timeoutHandler: android.os.Handler? = null
    private val timeoutRunnable = Runnable { handleAlarmTimeout() }
    
    // Store the intent and alarm details for timeout handling
    private var currentIntent: Intent? = null
    private var currentTitle: String = "Alarm"
    private var currentMessage: String = "Wake up!"
    private var currentRequestCode: Int = -1

    private val configReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            when (intent.action) {
                "ALARM_CONFIG_CHANGED" -> {
                    // Update vibration setting
                    val prefs = getSharedPreferences("AlarmConfig", Context.MODE_PRIVATE)
                    shouldVibrate = prefs.getBoolean("vibrate", true)

                    // Update timeout settings
                    maxAlarmDuration = prefs.getInt("max_alarm_duration", 0)
                    autoSnoozeOnTimeout = prefs.getBoolean("auto_snooze_on_timeout", false)

                    // Restart vibration if needed
                    stopVibration()
                    if (shouldVibrate && hasVibrator()) {
                        startVibration()
                    }

                    // Restart timeout check with new settings
                    if (maxAlarmDuration > 0) {
                        alarmStartTime = System.currentTimeMillis()
                        startTimeoutCheck()
                    } else {
                        timeoutHandler?.removeCallbacks(timeoutRunnable)
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
        if (Build.VERSION.SDK_INT >= 34 && applicationInfo.targetSdkVersion >= 34) {
            // use the 5-arg overload: (receiver, filter, receiverPermission, scheduler, flags)
            registerReceiver(configReceiver, filter, /* receiverPermission = */ null, /* scheduler = */ null, Context.RECEIVER_EXPORTED)
        } else {
            registerReceiver(configReceiver, filter)
        }
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
    
    private fun hasVibrator(): Boolean {
        return vibrator?.hasVibrator() ?: false
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Store the intent and alarm details for timeout handling
        currentIntent = intent
        currentTitle = intent?.getStringExtra("title") ?: "Alarm"
        currentMessage = intent?.getStringExtra("message") ?: "Wake up!"
        currentRequestCode = intent?.getIntExtra("requestCode", -1) ?: -1

        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        val keyguardManager = getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
        val fullScreen = !powerManager.isInteractive || keyguardManager.isKeyguardLocked

        val notification = AlarmNotificationHelper.buildAlarmNotification(
            this,
            currentTitle,
            currentMessage,
            currentRequestCode,
            includeSound = false,
            showFullScreen = fullScreen
        )

        // Start as Foreground Service (required immediately)
        if (Build.VERSION.SDK_INT >= 34) {
            startForeground(
                AlarmNotificationHelper.NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
            )
        } else {
            startForeground(
                AlarmNotificationHelper.NOTIFICATION_ID,
                notification
            )
        }

        isActivityActive = intent?.getBooleanExtra("activityActive", false) ?: false
        shouldHandleVibration = intent?.getBooleanExtra("shouldHandleVibration", true) ?: true

        // Get preferences
        val prefs = getSharedPreferences("AlarmConfig", Context.MODE_PRIVATE)
        shouldVibrate = prefs.getBoolean("vibrate", true)
        maxAlarmDuration = prefs.getInt("max_alarm_duration", 0)
        autoSnoozeOnTimeout = prefs.getBoolean("auto_snooze_on_timeout", false)

        if (!isActivityActive && shouldHandleVibration) {
            // Start vibration only if activity is not handling it
            startVibration()
        }
        
        // Restart timeout check if needed
        if (maxAlarmDuration > 0) {
            alarmStartTime = System.currentTimeMillis()
            startTimeoutCheck()
        }

        isPlaying = true
        alarmStartTime = System.currentTimeMillis()

        // Get soundUri from preferences
        val soundUriString = prefs.getString("sound_uri", null)
        val soundUri = if (!soundUriString.isNullOrEmpty()) {
            Uri.parse(soundUriString)
        } else {
            AlarmNotificationHelper.getCustomAlarmUri(this) ?: AlarmNotificationHelper.getDefaultAlarmUri()
        }
        
        /**
         * Always play sound regardless of activity state
         * The service should always handle the sound,
         * activity only handles UI and vibration
         */
        playAlarmSound(soundUri)
        
        // Start timeout check if duration is set
        if (maxAlarmDuration > 0) {
            startTimeoutCheck()
        }

        return START_STICKY
    }

    private fun startTimeoutCheck() {
        timeoutHandler?.removeCallbacks(timeoutRunnable)
        timeoutHandler = android.os.Handler(mainLooper)
        
        // Check every second
        timeoutHandler?.postDelayed(timeoutRunnable, 1000)
    }

    private fun handleAlarmTimeout() {
        val elapsedTime = (System.currentTimeMillis() - alarmStartTime) / 1000
        
        if (maxAlarmDuration > 0 && elapsedTime >= maxAlarmDuration) {
            // Get the timeout action preference
            val prefs = getSharedPreferences("AlarmConfig", Context.MODE_PRIVATE)
            val timeoutAction = prefs.getString("alarm_timeout_action", "SNOOZE") ?: "SNOOZE"
            
            if (timeoutAction == "STOP") {
                triggerAutoStop()
            } else {
                // Default to snooze
                triggerAutoSnooze()
            }
        } else {
            // Continue checking
            startTimeoutCheck()
        }
    }

    private fun playAlarmSound(uri: Uri?) {
        try {
            stopAlarmSound() // safety

            // Get preferences for consistent sound selection
            val prefs = getSharedPreferences("AlarmConfig", Context.MODE_PRIVATE)
            val soundUriString = prefs.getString("sound_uri", null)

            // Use the provided URI, or fallback to the same logic as onStartCommand
            val finalUri = uri ?: if (!soundUriString.isNullOrEmpty()) {
                Uri.parse(soundUriString)
            } else {
                AlarmNotificationHelper.getCustomAlarmUri(this) ?: AlarmNotificationHelper.getDefaultAlarmUri()
            }

            mediaPlayer = MediaPlayer().apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
                setDataSource(applicationContext, finalUri)
                setOnPreparedListener { mp ->
                    mp.isLooping = true
                    mp.start()
                }
                setOnErrorListener { _, what, extra ->
                    // Try to fallback to default sound on error
                    try {
                        val defaultUri = AlarmNotificationHelper.getDefaultAlarmUri()
                        if (finalUri != defaultUri) {
                            stopAlarmSound()
                            playAlarmSound(defaultUri)
                        }
                    } catch (e: Exception) {
                        stopSelf()
                    }
                    true // Indicate we handled the error
                }
                prepareAsync()
            }
        } catch (e: Exception) {
            // If everything fails, try with default system alarm sound
            try {
                if (uri != AlarmNotificationHelper.getDefaultAlarmUri()) {
                    playAlarmSound(AlarmNotificationHelper.getDefaultAlarmUri())
                } else {
                    stopSelf()
                }
            } catch (e2: Exception) {
                stopSelf()
            }
        }
    }

    private fun startVibration() {
        if (!shouldVibrate || vibrator == null || !shouldHandleVibration) return

        val hasVibrator = vibrator?.hasVibrator() ?: false
        if (!hasVibrator) return

        // Use the same fixed pattern as activity
        val vibrationPattern = longArrayOf(0, 1000, 500)

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

    private fun triggerAutoSnooze() {
        val prefs = getSharedPreferences("AlarmConfig", Context.MODE_PRIVATE)
        val snoozeMinutes = prefs.getInt("snooze_minutes", 5)
        
        // Create snooze intent similar to SnoozeReceiver
        val snoozeIntent = Intent(this, SnoozeReceiver::class.java).apply {
            action = "SNOOZE_ALARM"
            putExtra("snoozeMinutes", snoozeMinutes)
            putExtra("requestCode", currentRequestCode)
            putExtra("title", currentTitle)
            putExtra("message", currentMessage)
        }

        // Send broadcast to trigger snooze
        sendBroadcast(snoozeIntent)

        // Stop current alarm
        stopSelf()
    }

    private fun triggerAutoStop() {
        // Create stop intent similar to StopAlarmReceiver
        val stopIntent = Intent(this, StopAlarmReceiver::class.java).apply {
            action = "STOP_ALARM"
            putExtra("requestCode", currentRequestCode)
        }

        // Send broadcast to trigger stop
        sendBroadcast(stopIntent)

        // Stop current alarm
        stopSelf()
    }

    override fun onDestroy() {
        // Clean up timeout handler
        timeoutHandler?.removeCallbacks(timeoutRunnable)
        timeoutHandler = null
        
        try {
            unregisterReceiver(configReceiver)
            stopForeground(true)
        } catch (e: Exception) {
            // ignore if not registered or not in foreground
        }
        stopAlarmSound()
        stopVibration()
        
        // Clear stored intent and alarm details
        currentIntent = null
        currentTitle = "Alarm"
        currentMessage = "Wake up!"
        currentRequestCode = -1
        
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}