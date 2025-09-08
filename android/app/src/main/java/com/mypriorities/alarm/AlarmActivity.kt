package com.mypriorities.alarm

import android.content.Intent
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

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Make activity fully immersive and transparent
        makeFullScreenAndTransparent()
        
        setContentView(R.layout.activity_alarm)

        // Get dynamic data from intent
        val title = intent.getStringExtra("title") ?: "Alarm"
        val message = intent.getStringExtra("message") ?: "Wake up!"
        val requestCode = intent.getIntExtra("requestCode", -1)

        // Update UI with dynamic data
        updateUI(title, message)

        // Start playing alarm sound
        startService(Intent(this, AlarmSoundService::class.java).apply {
            putExtra("requestCode", requestCode)
            putExtra("title", title)
            putExtra("message", message)
        })

        // Stop button
        findViewById<View>(R.id.stopButton).setOnClickListener {
            stopAlarm(requestCode)
        }

        // Snooze button
        findViewById<View>(R.id.snoozeButton).setOnClickListener {
            snoozeAlarm(requestCode, title, message)
        }
    }

    private fun makeFullScreenAndTransparent() {
        // Hide system UI for full immersion
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or
                View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
                View.SYSTEM_UI_FLAG_FULLSCREEN or
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            )
        }

        // Make status bar and navigation bar transparent
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor = android.graphics.Color.TRANSPARENT
            window.navigationBarColor = android.graphics.Color.TRANSPARENT
        }

        // Show over lockscreen + turn screen on
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

        // Make window transparent
        window.setBackgroundDrawableResource(android.R.color.transparent)
    }

    private fun updateUI(title: String, message: String) {
        // Update title
        findViewById<TextView>(R.id.alarmTitle).text = title
        
        // Update message
        findViewById<TextView>(R.id.alarmMessage).text = message
        
        // Update current time
        val currentTime = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
        findViewById<TextView>(R.id.alarmTime).text = currentTime
    }

    private fun snoozeAlarm(requestCode: Int, title: String, message: String) {
        // Stop current sound
        stopService(Intent(this, AlarmSoundService::class.java))

        val snoozeMinutes = 10 // You can make this configurable from shared preferences
        val snoozeTime = System.currentTimeMillis() + (snoozeMinutes * 60 * 1000L)

        AlarmScheduler.scheduleAlarm(
            this,
            snoozeTime,
            requestCode,
            title,
            "$message (Snoozed)",
            RecurrenceHelper.TYPE_ONCE,
            ""
        )

        AlarmNotificationHelper.cancelNotification(this, requestCode)
        finishAndRemoveTask()
    }

    private fun stopAlarm(requestCode: Int) {
        stopService(Intent(this, AlarmSoundService::class.java))
        AlarmNotificationHelper.cancelNotification(this, requestCode)
        AlarmScheduler.cancelAlarm(this, requestCode)
        finishAndRemoveTask()
    }

    override fun onDestroy() {
        super.onDestroy()
        stopService(Intent(this, AlarmSoundService::class.java))
    }

    // Handle back button press to prevent accidental dismissal
    override fun onBackPressed() {
        // Optional: Show a toast or prevent back button from dismissing
        // super.onBackPressed() // Comment this out to prevent back button from working
    }
}