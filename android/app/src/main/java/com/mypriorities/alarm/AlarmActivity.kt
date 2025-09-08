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

        makeFullScreenAndTransparent()
        setContentView(R.layout.activity_alarm)

        val title = intent.getStringExtra("title") ?: "Alarm"
        val message = intent.getStringExtra("message") ?: "Wake up!"
        val requestCode = intent.getIntExtra("requestCode", -1)

        updateUI(title, message)

        if (!AlarmSoundService.isPlaying) {
            startForegroundService(Intent(this, AlarmSoundService::class.java))
        }

        // Ensure alarm sound is playing (if activity is opened manually)
        startForegroundService(Intent(this, AlarmSoundService::class.java))

        // --- Stop button ---
        findViewById<View>(R.id.stopButton).setOnClickListener {
            val stopIntent = Intent(this, AlarmReceiver::class.java).apply {
                action = "STOP_ALARM"
            }
            sendBroadcast(stopIntent)
            finishAndRemoveTask()
        }

        // --- Snooze button ---
        findViewById<View>(R.id.snoozeButton).setOnClickListener {
            val snoozeIntent = Intent(this, AlarmReceiver::class.java).apply {
                action = "SNOOZE_ALARM"
            }
            sendBroadcast(snoozeIntent)
            finishAndRemoveTask()
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
}