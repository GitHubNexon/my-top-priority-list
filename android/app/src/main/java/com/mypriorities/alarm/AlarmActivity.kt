package com.mypriorities.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Vibrator
import android.os.VibratorManager
import android.os.VibrationEffect
import android.content.SharedPreferences
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.WindowManager
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.mypriorities.R
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class AlarmActivity : AppCompatActivity() {
    private var vibrator: Vibrator? = null
    private var shouldVibrate = true
    private var hasVibrator = false
    private var maxAlarmDuration: Int = 0
    private var autoSnoozeOnTimeout: Boolean = false
    private var alarmStartTime: Long = 0
    private var timeoutHandler: android.os.Handler? = null
    private val timeoutRunnable = Runnable { handleAlarmTimeout() }

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
                    if (shouldVibrate && hasVibrator) {
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

    // In your onCreate method, remove the duplicate service starts:
	override fun onCreate(savedInstanceState: Bundle?) {
	    super.onCreate(savedInstanceState)
	
	    // Register for config changes
	    val filter = IntentFilter("ALARM_CONFIG_CHANGED")
	    registerReceiver(configReceiver, filter)
	
	    initializeVibrator()
	
	    makeFullScreenAndTransparent()
	    setContentView(R.layout.activity_alarm)
	
	    val title = intent.getStringExtra("title") ?: "Alarm"
	    val message = intent.getStringExtra("message") ?: "Wake up!"
	    val requestCode = intent.getIntExtra("requestCode", -1)
	
	    updateUI(title, message)
	
	    // REMOVE THESE LINES - Service is already running from AlarmReceiver
	    // stopService(Intent(this, AlarmSoundService::class.java))
	    // val soundIntent = Intent(this, AlarmSoundService::class.java).apply { ... }
	
	    // Just update the service that activity is active (if needed)
	    // The service is already running and playing sound
	
	    // --- Stop button ---
	    findViewById<View>(R.id.stopButton).setOnClickListener {
	        val stopIntent = Intent(this, StopAlarmReceiver::class.java).apply {
	            action = "STOP_ALARM"
	            putExtra("requestCode", requestCode)
	        }
	        sendBroadcast(stopIntent)
	        finishAndRemoveTask()
	    }
	
	    // --- Snooze button ---
	    findViewById<View>(R.id.snoozeButton).setOnClickListener {
	        val snoozeIntent = Intent(this, SnoozeReceiver::class.java).apply {
	            action = "SNOOZE_ALARM"
	            putExtra("requestCode", requestCode)
	            putExtra("title", title)
	            putExtra("message", message)
	        }
	        sendBroadcast(snoozeIntent)
	        finishAndRemoveTask()
	    }
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
            // Timeout reached
            if (autoSnoozeOnTimeout) {
                triggerAutoSnooze()
            } else {
                triggerAutoStop()
            }
        } else {
            // Continue checking
            startTimeoutCheck()
        }
    }
    
    private fun triggerAutoSnooze() {
        val requestCode = intent.getIntExtra("requestCode", -1)
        val title = intent.getStringExtra("title") ?: "Alarm"
        val message = intent.getStringExtra("message") ?: "Wake up!"
        
        val snoozeIntent = Intent(this, SnoozeReceiver::class.java).apply {
            action = "SNOOZE_ALARM"
            putExtra("requestCode", requestCode)
            putExtra("title", title)
            putExtra("message", message)
        }
        sendBroadcast(snoozeIntent)
        finishAndRemoveTask()
    }

    private fun triggerAutoStop() {
        val requestCode = intent.getIntExtra("requestCode", -1)

        val stopIntent = Intent(this, StopAlarmReceiver::class.java).apply {
            action = "STOP_ALARM"
            putExtra("requestCode", requestCode)
        }
        sendBroadcast(stopIntent)
        finishAndRemoveTask()
    }

    private fun initializeVibrator() {
        vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vibratorManager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }

        // Check if device has vibrator
        hasVibrator = vibrator?.hasVibrator() ?: false
        
        // Check vibration preference
        val prefs = getSharedPreferences("AlarmConfig", Context.MODE_PRIVATE)
        shouldVibrate = prefs.getBoolean("vibrate", true)
        
        // Start vibration when activity starts
        if (shouldVibrate && hasVibrator) {
            startVibration()
        }
    }

    private fun startVibration() {
        if (!shouldVibrate || vibrator == null || !hasVibrator) return
        
        val vibrationPattern = longArrayOf(0, 1000, 500) // Wait 0ms, vibrate 1000ms, pause 500ms
        
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val vibrationEffect = VibrationEffect.createWaveform(vibrationPattern, 0)
                vibrator?.vibrate(vibrationEffect)
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(vibrationPattern, 0)
            }
        } catch (e: Exception) {
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

    private fun makeFullScreenAndTransparent() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        or View.SYSTEM_UI_FLAG_FULLSCREEN
                        or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                )
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor = android.graphics.Color.TRANSPARENT
            window.navigationBarColor = android.graphics.Color.TRANSPARENT
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                        or WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
                        or WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
                        or WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON
            )
        }

        window.setBackgroundDrawableResource(android.R.color.transparent)
    }

    private fun updateUI(title: String, message: String) {
        findViewById<TextView>(R.id.alarmTitle).text = title
        findViewById<TextView>(R.id.alarmMessage).text = message

        val currentTime = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
        findViewById<TextView>(R.id.alarmTime).text = currentTime
    }

    
    override fun onBackPressed() {
        // Disable back button to prevent accidental dismissal
    }
    
    override fun onDestroy() {
        // Clean up timeout handler
        timeoutHandler?.removeCallbacks(timeoutRunnable)
        timeoutHandler = null
        try {
            unregisterReceiver(configReceiver)
        } catch (e: Exception) {
            // ignore if not registered
        }
        
        stopVibration()
        super.onDestroy()
    }
}