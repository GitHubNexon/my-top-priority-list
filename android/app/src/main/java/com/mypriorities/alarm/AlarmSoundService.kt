package com.mypriorities.alarm

import android.app.Service
import android.content.Intent
import android.os.IBinder

class AlarmSoundService : Service() {

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // This service is now just a placeholder to keep the app alive
        // The actual sound is handled by the notification system
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        // No media player to clean up anymore
    }
}