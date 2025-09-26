package com.mypriorities.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.media.RingtoneManager
import android.net.Uri
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
        requestCodeStr: String?,
        recurrenceType: String,
        recurrencePattern: String,
        promise: Promise
    ) {
        try {
            // Validate recurrence pattern
            if (!RecurrenceHelper.validateRecurrencePattern(recurrenceType, recurrencePattern)) {
                promise.reject("E_INVALID_PATTERN", "Invalid recurrence pattern for type: $recurrenceType")
                return
            }

            // Generate request code if not provided
            val finalRequestCodeStr = AlarmStorageHelper.generateRequestCodeStr(requestCodeStr)
            val requestCode = AlarmStorageHelper.generateRequestCode(finalRequestCodeStr)
            val finalTitle = title.ifEmpty { "Alarm" }

            // Schedule the alarm with storage
            AlarmScheduler.scheduleAlarm(
                reactContext,
                timestamp.toLong(),
                requestCode,
                finalRequestCodeStr,
                finalTitle,
                message,
                recurrenceType,
                recurrencePattern
            )

            promise.resolve(finalRequestCodeStr)
        } catch (e: Exception) {
            promise.reject("E_ALARM", e)
        }
    }

    @ReactMethod
    fun updateAlarm(
        requestCodeStr: String,
        timestamp: Double,
        title: String,
        message: String,
        recurrenceType: String,
        recurrencePattern: String,
        promise: Promise
    ) {
        try {
            // Find the existing alarm to get the exact requestCode
            val existingAlarm = AlarmStorageHelper.getAlarmByRequestCodeStr(reactContext, requestCodeStr)

            if (existingAlarm == null) {
                promise.reject("E_ALARM_NOT_FOUND", "Alarm with requestCodeStr $requestCodeStr not found")
                return
            }

            val requestCode = existingAlarm.requestCode

            // Cancel existing alarm
            AlarmScheduler.cancelAlarm(reactContext, requestCode)

            // Schedule updated alarm with storage using the SAME requestCode
            val finalTitle = title.ifEmpty { "Alarm" }

            AlarmScheduler.scheduleAlarm(
                reactContext,
                timestamp.toLong(),
                requestCode, // Use the same requestCode
                requestCodeStr,
                finalTitle,
                message,
                recurrenceType,
                recurrencePattern
            )

            promise.resolve(requestCodeStr)
        } catch (e: Exception) {
            promise.reject("E_UPDATE_ALARM", e)
        }
    }

    @ReactMethod
    fun cancelAlarm(requestCodeStr: String, promise: Promise) {
        try {
            // First, find the stored alarm to get the exact requestCode that was used
            val alarm = AlarmStorageHelper.getAlarmByRequestCodeStr(reactContext, requestCodeStr)

            if (alarm == null) {
                promise.resolve(false) // Alarm not found, but don't treat as error
                return
            }

            val requestCode = alarm.requestCode // Use the EXACT requestCode from storage

            // Remove from storage
            AlarmStorageHelper.removeAlarm(reactContext, requestCode)

            // Cancel the alarm using the exact same requestCode that was used to schedule it
            AlarmScheduler.cancelAlarm(reactContext, requestCode)
            AlarmNotificationHelper.cancelAlarmNotification(reactContext)

            // Also attempt to stop the foreground service if running
            try {
                reactContext.stopService(Intent(reactContext, AlarmSoundService::class.java))
            } catch (e: Exception) {
                // ignore if not running
            }

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("E_CANCEL_ALARM", e)
        }
    }

    @ReactMethod
    fun cancelAllAlarms(promise: Promise) {
        try {
            val alarms = AlarmStorageHelper.getAllAlarms(reactContext)
            
            // Cancel each alarm
            alarms.forEach { alarm ->
                AlarmScheduler.cancelAlarm(reactContext, alarm.requestCode)
            }
            
            // Clear all from storage
            AlarmStorageHelper.clearAllAlarms(reactContext)
            
            // Stop any running service
            try {
                reactContext.stopService(Intent(reactContext, AlarmSoundService::class.java))
                AlarmNotificationHelper.cancelAlarmNotification(reactContext)
            } catch (e: Exception) {
                // ignore if not running
            }

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("E_CANCEL_ALL_ALARMS", e)
        }
    }

    @ReactMethod
    fun getAllScheduledAlarms(promise: Promise) {
        try {
            val alarms = AlarmStorageHelper.getAllAlarms(reactContext)
            val alarmsArray = Arguments.createArray()
            
            alarms.forEach { alarm ->
                val alarmMap = Arguments.createMap().apply {
                    putString("requestCodeStr", alarm.requestCodeStr)
                    putDouble("timestamp", alarm.timestamp.toDouble())
                    putString("title", alarm.title)
                    putString("message", alarm.message)
                    putString("recurrenceType", alarm.recurrenceType)
                    putString("recurrencePattern", alarm.recurrencePattern)
                    putBoolean("isActive", alarm.isActive)
                }
                alarmsArray.pushMap(alarmMap)
            }
            
            promise.resolve(alarmsArray)
        } catch (e: Exception) {
            promise.reject("E_GET_ALARMS", e)
        }
    }

    @ReactMethod
    fun getAlarm(requestCodeStr: String, promise: Promise) {
        try {
            val alarm = AlarmStorageHelper.getAlarmByRequestCodeStr(reactContext, requestCodeStr)
            
            if (alarm != null) {
                val alarmMap = Arguments.createMap().apply {
                    putString("requestCodeStr", alarm.requestCodeStr)
                    putDouble("timestamp", alarm.timestamp.toDouble())
                    putString("title", alarm.title)
                    putString("message", alarm.message)
                    putString("recurrenceType", alarm.recurrenceType)
                    putString("recurrencePattern", alarm.recurrencePattern)
                    putBoolean("isActive", alarm.isActive)
                }
                promise.resolve(alarmMap)
            } else {
                promise.resolve(null)
            }
        } catch (e: Exception) {
            promise.reject("E_GET_ALARM", e)
        }
    }

    @ReactMethod
    fun generateRequestCode(promise: Promise) {
        try {
            val requestCodeStr = AlarmStorageHelper.generateRequestCodeStr()
            promise.resolve(requestCodeStr)
        } catch (e: Exception) {
            promise.reject("E_GENERATE_CODE", e)
        }
    }

    @ReactMethod
    fun isAlarmScheduled(requestCodeStr: String, promise: Promise) {
        try {
            val alarm = AlarmStorageHelper.getAlarmByRequestCodeStr(reactContext, requestCodeStr)
            promise.resolve(alarm != null)
        } catch (e: Exception) {
            promise.reject("E_CHECK_ALARM", e)
        }
    }
}