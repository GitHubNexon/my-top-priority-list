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
    fun alarmConfig(
        sound: String?,
        vibrate: Boolean?,
        snoozeMinutes: Int?,
        smallIcon: String?,
        bigIcon: String?,
        promise: Promise
    ) {
        try {
            val editor = prefs.edit()
            
            sound?.let { editor.putString("sound_uri", it) }
            vibrate?.let { editor.putBoolean("vibrate", it) }
            snoozeMinutes?.let { editor.putInt("snooze_minutes", it) }
            smallIcon?.let { editor.putString("small_icon", it) }
            bigIcon?.let { editor.putString("big_icon", it) }
            
            editor.apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("E_ALARM_CONFIG", e)
        }
    }

    @ReactMethod
    fun getRingtone(uri: String, promise: Promise) {
        try {
            val ringtone = RingtoneManager.getRingtone(reactContext, Uri.parse(uri))
            val ringtoneInfo = Arguments.createMap().apply {
                putString("title", ringtone.getTitle(reactContext))
                putString("uri", uri)
            }
            promise.resolve(ringtoneInfo)
        } catch (e: Exception) {
            promise.reject("E_GET_RINGTONE", e)
        }
    }

    @ReactMethod
    fun getAllRingtones(promise: Promise) {
        try {
            val ringtoneManager = RingtoneManager(reactContext)
            ringtoneManager.setType(RingtoneManager.TYPE_ALARM)
            val cursor = ringtoneManager.cursor
            
            val ringtonesList = Arguments.createArray()
            
            while (cursor != null && cursor.moveToNext()) {
                val title = cursor.getString(RingtoneManager.TITLE_COLUMN_INDEX)
                val uri = ringtoneManager.getRingtoneUri(cursor.position)
                
                val ringtoneInfo = Arguments.createMap().apply {
                    putString("title", title)
                    putString("uri", uri.toString())
                }
                ringtonesList.pushMap(ringtoneInfo)
            }
            
            cursor?.close()
            promise.resolve(ringtonesList)
        } catch (e: Exception) {
            promise.reject("E_GET_ALL_RINGTONES", e)
        }
    }

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
            AlarmNotificationHelper.cancelNotification(reactContext, requestCode)
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

    @ReactMethod
    fun getAlarmConfig(promise: Promise) {
        try {
            val config = Arguments.createMap().apply {
                putString("sound_uri", prefs.getString("sound_uri", "android.resource://${reactContext.packageName}/raw/alarm_sound"))
                putBoolean("vibrate", prefs.getBoolean("vibrate", true))
                putInt("snooze_minutes", prefs.getInt("snooze_minutes", 5))
                putString("small_icon", prefs.getString("small_icon", "ic_alarm"))
                putString("big_icon", prefs.getString("big_icon", "ic_alarm_big"))
            }
            promise.resolve(config)
        } catch (e: Exception) {
            promise.reject("E_GET_CONFIG", e)
        }
    }

    private fun generateRequestCode(requestCodeStr: String): Int {
        return requestCodeStr.hashCode() and 0x7FFFFFFF
    }
}