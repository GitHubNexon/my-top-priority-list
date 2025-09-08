package com.mypriorities.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.facebook.react.HeadlessJsTaskService

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED ||
            intent.action == Intent.ACTION_LOCKED_BOOT_COMPLETED) {

            Log.d("BootReceiver", "Device rebooted, notifying JS to restore alarms...")

            val serviceIntent = Intent(context, BootRestoreService::class.java)
            context.startService(serviceIntent)
            HeadlessJsTaskService.acquireWakeLockNow(context)
        }
    }
}