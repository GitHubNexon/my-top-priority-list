package com.mypriorities.alarm

import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class BootRestoreService : HeadlessJsTaskService() {
    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
        return HeadlessJsTaskConfig(
            "BootRestoreTask",              // 👈 must match your JS task name
            Arguments.createMap(),          // empty WritableMap instead of null
            60000,                          // timeout in ms
            true                            // allow running in foreground
        )
    }
}