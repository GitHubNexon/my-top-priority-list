package com.mypriorities.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Vibrator
import android.os.VibratorManager
import android.os.VibrationEffect
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.WindowManager
import android.view.animation.AnimationUtils
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
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
            if (intent.action == "ALARM_CONFIG_CHANGED") {
                val prefs = getSharedPreferences("AlarmConfig", Context.MODE_PRIVATE)
                shouldVibrate = prefs.getBoolean("vibrate", true)
                maxAlarmDuration = prefs.getInt("max_alarm_duration", 0)
                autoSnoozeOnTimeout = prefs.getBoolean("auto_snooze_on_timeout", false)

                stopVibration()
                if (shouldVibrate && hasVibrator) startVibration()

                if (maxAlarmDuration > 0) {
                    alarmStartTime = System.currentTimeMillis()
                    startTimeoutCheck()
                } else {
                    timeoutHandler?.removeCallbacks(timeoutRunnable)
                }
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Register config receiver
        val filter = IntentFilter("ALARM_CONFIG_CHANGED")
        if (Build.VERSION.SDK_INT >= 34 && applicationInfo.targetSdkVersion >= 34) {
            registerReceiver(configReceiver, filter, Context.RECEIVER_EXPORTED)
        } else {
            registerReceiver(configReceiver, filter)
        }

        initializeVibrator()
        makeFullScreenAndDimmed()
        setContentView(R.layout.activity_alarm)

        // Dim brightness
        val layoutParams = window.attributes
        layoutParams.screenBrightness = 0.2f
        window.attributes = layoutParams

        // Fade-in animation
        val rootView = findViewById<View>(R.id.alarmRoot)
        val fadeIn = AnimationUtils.loadAnimation(this, R.anim.fade_in)
        rootView.startAnimation(fadeIn)

        val title = intent.getStringExtra("title") ?: "Alarm"
        val message = intent.getStringExtra("message") ?: "Wake up!"
        val requestCode = intent.getIntExtra("requestCode", -1)

        updateUI(title, message)

        // Stop button
        findViewById<View>(R.id.stopButton).setOnClickListener {
            val stopIntent = Intent(this, StopAlarmReceiver::class.java).apply {
                action = "STOP_ALARM"
                putExtra("requestCode", requestCode)
            }
            sendBroadcast(stopIntent)
            fadeOutAndFinish()
        }

        // Snooze button
        findViewById<View>(R.id.snoozeButton).setOnClickListener {
            val snoozeIntent = Intent(this, SnoozeReceiver::class.java).apply {
                action = "SNOOZE_ALARM"
                putExtra("requestCode", requestCode)
                putExtra("title", title)
                putExtra("message", message)
            }
            sendBroadcast(snoozeIntent)
            fadeOutAndFinish()
        }
    }

    // --- Helper UI functions ---

    private fun makeFullScreenAndDimmed() {
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

        // Soft dark background
        window.setBackgroundDrawable(ColorDrawable(Color.parseColor("#121212")))

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor = Color.parseColor("#121212")
            window.navigationBarColor = Color.parseColor("#121212")
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                        WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                        WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
                        WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON
            )
        }
    }

    private fun fadeOutAndFinish() {
        val rootView = findViewById<View>(R.id.alarmRoot)
        val fadeOut = AnimationUtils.loadAnimation(this, android.R.anim.fade_out)
        fadeOut.setAnimationListener(object : android.view.animation.Animation.AnimationListener {
            override fun onAnimationStart(animation: android.view.animation.Animation) {}
            override fun onAnimationEnd(animation: android.view.animation.Animation) {
                finishAndRemoveTask()
                overridePendingTransition(0, 0)
            }
            override fun onAnimationRepeat(animation: android.view.animation.Animation) {}
        })
        rootView.startAnimation(fadeOut)
    }

    private fun updateUI(title: String, message: String) {
        findViewById<TextView>(R.id.alarmTitle).text = title
        findViewById<TextView>(R.id.alarmMessage).text = message
        val currentTime = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
        findViewById<TextView>(R.id.alarmTime).text = currentTime
    }

    // --- Timeout management ---

    private fun startTimeoutCheck() {
        timeoutHandler?.removeCallbacks(timeoutRunnable)
        timeoutHandler = android.os.Handler(mainLooper)
        timeoutHandler?.postDelayed(timeoutRunnable, 1000)
    }

    private fun handleAlarmTimeout() {
        val elapsedTime = (System.currentTimeMillis() - alarmStartTime) / 1000
        if (maxAlarmDuration > 0 && elapsedTime >= maxAlarmDuration) {
            if (autoSnoozeOnTimeout) triggerAutoSnooze()
            else triggerAutoStop()
        } else {
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
        fadeOutAndFinish()
    }

    private fun triggerAutoStop() {
        val requestCode = intent.getIntExtra("requestCode", -1)
        val stopIntent = Intent(this, StopAlarmReceiver::class.java).apply {
            action = "STOP_ALARM"
            putExtra("requestCode", requestCode)
        }
        sendBroadcast(stopIntent)
        fadeOutAndFinish()
    }

    // --- Vibration management ---

    private fun initializeVibrator() {
        vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vibratorManager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }

        hasVibrator = vibrator?.hasVibrator() ?: false
        val prefs = getSharedPreferences("AlarmConfig", Context.MODE_PRIVATE)
        shouldVibrate = prefs.getBoolean("vibrate", true)
        if (shouldVibrate && hasVibrator) startVibration()
    }

    private fun startVibration() {
        if (!shouldVibrate || vibrator == null || !hasVibrator) return
        val pattern = longArrayOf(0, 1000, 500)
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator?.vibrate(VibrationEffect.createWaveform(pattern, 0))
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(pattern, 0)
            }
        } catch (_: Exception) {}
    }

    private fun stopVibration() {
        try { vibrator?.cancel() } catch (_: Exception) {}
    }

    override fun onBackPressed() {
        // Prevent accidental dismiss
    }

    override fun onDestroy() {
        timeoutHandler?.removeCallbacks(timeoutRunnable)
        timeoutHandler = null
        try { unregisterReceiver(configReceiver) } catch (_: Exception) {}
        stopVibration()
        super.onDestroy()
    }
}