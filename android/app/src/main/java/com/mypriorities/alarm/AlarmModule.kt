package com.mypriorities.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.media.RingtoneManager
import android.net.Uri
import android.util.Log
import com.facebook.react.bridge.*
import org.json.JSONObject

class AlarmModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val prefs: SharedPreferences by lazy {
        reactContext.getSharedPreferences("AlarmConfig", Context.MODE_PRIVATE)
    }

    override fun getName() = "AlarmModule"

    @ReactMethod
    fun scheduleAlarm(
        timestamp: Double,
        title: String,
        message: String,
        requestCodeStr: String,
        recurrenceType: String,
        recurrencePattern: String,
        promise: Promise
    ) {
        try {
            val requestCode = generateRequestCode(requestCodeStr)
            val finalTitle = title.ifEmpty { "Alarm" }

            AlarmScheduler.scheduleAlarm(
                reactContext,
                timestamp.toLong(),
                requestCode,
                finalTitle,
                message,
                recurrenceType,
                recurrencePattern
            )

            promise.resolve(requestCodeStr)
        } catch (e: Exception) {
            promise.reject("E_ALARM", e)
        }
    }

    @ReactMethod
    fun scheduleRecurringAlarm(
        timestamp: Double,
        title: String,
        message: String,
        requestCodeStr: String,
        recurrenceType: String,
        daysOfWeek: ReadableArray?,
        dayOfMonth: Int,
        interval: Int,
        promise: Promise
    ) {
        try {
            val requestCode = generateRequestCode(requestCodeStr)
            val finalTitle = title.ifEmpty { "Alarm" }
            
            val daysList = mutableListOf<Int>()
            daysOfWeek?.let {
                for (i in 0 until it.size()) {
                    daysList.add(it.getInt(i))
                }
            }
            
            val pattern = JSONObject().apply {
                put("daysOfWeek", daysList.toTypedArray())
                put("dayOfMonth", dayOfMonth)
                put("interval", interval)
            }.toString()

            AlarmScheduler.scheduleRecurringAlarm(
                reactContext,
                timestamp.toLong(),
                requestCode,
                finalTitle,
                message,
                recurrenceType,
                pattern
            )

            promise.resolve(requestCodeStr)
        } catch (e: Exception) {
            promise.reject("E_RECURRING_ALARM", e)
        }
    }

    @ReactMethod
    fun cancelAlarm(requestCodeStr: String, promise: Promise) {
        try {
            val requestCode = generateRequestCode(requestCodeStr)
            AlarmScheduler.cancelAlarm(reactContext, requestCode)
            AlarmNotificationHelper.cancelAlarmNotification(reactContext)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("E_CANCEL_ALARM", e)
        }
    }

    @ReactMethod
    fun cancelAllAlarms(promise: Promise) {
        try {
            // This would require tracking all scheduled alarms
            // For now, we'll provide a basic implementation
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("E_CANCEL_ALL_ALARMS", e)
        }
    }

    private fun generateRequestCode(requestCodeStr: String): Int {
        return requestCodeStr.hashCode() and 0x7FFFFFFF
    }
}