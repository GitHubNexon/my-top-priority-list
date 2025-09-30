package com.mypriorities.alarm

import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import android.util.Log

class BootRestoreService : HeadlessJsTaskService() {
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d("BootRestoreService", "Service started")
        
        val taskConfig = getTaskConfig(intent)
        if (taskConfig != null) {
            startTask(taskConfig)
        } else {
            Log.e("BootRestoreService", "Failed to start headless task")
            stopSelf()
        }
        
        return START_NOT_STICKY
    }
    
    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
        Log.d("BootRestoreService", "Creating HeadlessJsTaskConfig for BootRestoreTask")
        
        return HeadlessJsTaskConfig(
            "BootRestoreTask",
            Arguments.createMap(),
            30000, // 30 seconds timeout
            true   // Allow task to run in background
        )
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d("BootRestoreService", "Service destroyed")
    }
}