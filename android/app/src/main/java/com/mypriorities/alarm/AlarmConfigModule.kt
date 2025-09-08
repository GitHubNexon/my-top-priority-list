package com.mypriorities.alarm

import android.content.Context
import android.content.SharedPreferences
import android.media.RingtoneManager
import android.net.Uri
import com.facebook.react.bridge.*

class AlarmConfigModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val prefs: SharedPreferences =
        reactContext.getSharedPreferences("AlarmConfig", Context.MODE_PRIVATE)

    override fun getName(): String = "AlarmConfig"

    // --- Snooze Minutes ---
    @ReactMethod
    fun setSnoozeMinutes(minutes: Int, promise: Promise) {
        try {
            prefs.edit().putInt("snooze_minutes", minutes).apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SET_ERROR", e)
        }
    }

    @ReactMethod
    fun getSnoozeMinutes(promise: Promise) {
        try {
            val minutes = prefs.getInt("snooze_minutes", 5) // default 5
            promise.resolve(minutes)
        } catch (e: Exception) {
            promise.reject("GET_ERROR", e)
        }
    }

    @ReactMethod
    fun setRingtone(uri: String?, promise: Promise) {
        try {
            prefs.edit().putString("sound_uri", uri).apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SET_ERROR", e)
        }
    }

    @ReactMethod
    fun getSelectedRingtone(promise: Promise) {
        try {
            val uri = prefs.getString("sound_uri", null)
            if (uri != null) {
                val ringtone = RingtoneManager.getRingtone(reactApplicationContext, Uri.parse(uri))
                val ringtoneInfo = Arguments.createMap().apply {
                    putString("title", ringtone.getTitle(reactApplicationContext))
                    putString("uri", uri)
                }
                promise.resolve(ringtoneInfo)
            } else {
                promise.resolve(null) // no ringtone saved yet
            }
        } catch (e: Exception) {
            promise.reject("E_GET_RINGTONE", e)
        }
    }

    @ReactMethod
    fun getAllRingtones(promise: Promise) {
        try {
            val ringtoneManager = RingtoneManager(reactApplicationContext)
            ringtoneManager.setType(RingtoneManager.TYPE_ALARM)
            val cursor = ringtoneManager.cursor

            val ringtonesList = Arguments.createArray()
            if (cursor != null) {
                while (cursor.moveToNext()) {
                    val title = cursor.getString(RingtoneManager.TITLE_COLUMN_INDEX)
                    val uri = ringtoneManager.getRingtoneUri(cursor.position)

                    val ringtoneInfo = Arguments.createMap().apply {
                        putString("title", title)
                        putString("uri", uri.toString())
                    }
                    ringtonesList.pushMap(ringtoneInfo)
                }
                cursor.close()
            }
            promise.resolve(ringtonesList)
        } catch (e: Exception) {
            promise.reject("E_GET_ALL_RINGTONES", e)
        }
    }

    // --- Vibrate ---
    @ReactMethod
    fun setVibrate(enabled: Boolean, promise: Promise) {
        try {
            prefs.edit().putBoolean("vibrate", enabled).apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SET_ERROR", e)
        }
    }

    @ReactMethod
    fun getVibrate(promise: Promise) {
        try {
            val enabled = prefs.getBoolean("vibrate", true) // default true
            promise.resolve(enabled)
        } catch (e: Exception) {
            promise.reject("GET_ERROR", e)
        }
    }

    // --- Icons ---
    @ReactMethod
    fun setSmallIcon(name: String?, promise: Promise) {
        try {
            prefs.edit().putString("small_icon", name).apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SET_ERROR", e)
        }
    }

    @ReactMethod
    fun getSmallIcon(promise: Promise) {
        try {
            val icon = prefs.getString("small_icon", "ic_alarm") // default
            promise.resolve(icon)
        } catch (e: Exception) {
            promise.reject("GET_ERROR", e)
        }
    }

    @ReactMethod
    fun setBigIcon(name: String?, promise: Promise) {
        try {
            prefs.edit().putString("big_icon", name).apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SET_ERROR", e)
        }
    }

    @ReactMethod
    fun getBigIcon(promise: Promise) {
        try {
            val icon = prefs.getString("big_icon", "ic_alarm_big") // default
            promise.resolve(icon)
        } catch (e: Exception) {
            promise.reject("GET_ERROR", e)
        }
    }

    // --- Full Config ---
    @ReactMethod
    fun getConfig(promise: Promise) {
        try {
            val config = Arguments.createMap().apply {
                putInt("snoozeMinutes", prefs.getInt("snooze_minutes", 5))
                putString("soundUri", prefs.getString("sound_uri", null))
                putBoolean("vibrate", prefs.getBoolean("vibrate", true))
                putString("smallIcon", prefs.getString("small_icon", "ic_alarm"))
                putString("bigIcon", prefs.getString("big_icon", "ic_alarm_big"))
            }
            promise.resolve(config)
        } catch (e: Exception) {
            promise.reject("GET_ERROR", e)
        }
    }
}