package com.mypriorities.alarm

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.app.NotificationManager
import android.os.Vibrator
import android.os.VibratorManager
import com.facebook.react.bridge.*

class AlarmConfigModule(reactContext: ReactApplicationContext)
    : ReactContextBaseJavaModule(reactContext) {

        private val prefs: SharedPreferences =
            reactContext.getSharedPreferences("AlarmConfig", Context.MODE_PRIVATE)
        
        companion object {
            private const val PREFS_SNOOZE_MINUTES = "snooze_minutes"
            private const val PREFS_SOUND_URI = "sound_uri"
            private const val PREFS_VIBRATE = "vibrate"
            private const val PREFS_SMALL_ICON = "small_icon"
            private const val PREFS_BIG_ICON = "big_icon"
            
            private const val DEFAULT_SNOOZE_MINUTES = 5
            private const val DEFAULT_VIBRATE = true
            private const val DEFAULT_SMALL_ICON = "ic_alarm"
            private const val DEFAULT_BIG_ICON = "ic_alarm_big"

            private const val PREFS_MAX_ALARM_DURATION = "max_alarm_duration"
            private const val DEFAULT_MAX_ALARM_DURATION = 0 // 0 means infinite (default behavior)
            private const val PREFS_ALARM_TIMEOUT_ACTION = "alarm_timeout_action"
            private const val DEFAULT_ALARM_TIMEOUT_ACTION = "SNOOZE" // SNOOZE or STOP
        }
    
        override fun getName(): String = "AlarmConfig"
    
        // --- Snooze Minutes ---
        @ReactMethod
        fun setSnoozeMinutes(minutes: Int, promise: Promise) {
            try {
                if (minutes <= 0 || minutes > 60) {
                    promise.reject("INVALID_INPUT", "Snooze minutes must be between 1 and 60")
                    return
                }
                prefs.edit().putInt(PREFS_SNOOZE_MINUTES, minutes).apply()
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("SET_ERROR", e)
            }
        }
    
        @ReactMethod
        fun getSnoozeMinutes(promise: Promise) {
            try {
                val minutes = prefs.getInt(PREFS_SNOOZE_MINUTES, DEFAULT_SNOOZE_MINUTES)
                promise.resolve(minutes)
            } catch (e: Exception) {
                promise.reject("GET_ERROR", e)
            }
        }

        @ReactMethod
        fun setMaxAlarmDuration(seconds: Int, promise: Promise) {
            try {
                if (seconds < 0) {
                    promise.reject("INVALID_INPUT", "Max alarm duration cannot be negative")
                    return
                }
                prefs.edit().putInt(PREFS_MAX_ALARM_DURATION, seconds).apply()

                // Broadcast the change to running services
                val intent = Intent("ALARM_CONFIG_CHANGED").apply {
                    putExtra("max_alarm_duration", seconds)
                }
                reactApplicationContext.sendBroadcast(intent)

                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("SET_ERROR", e)
            }
        }

        @ReactMethod
        fun getMaxAlarmDuration(promise: Promise) {
            try {
                val seconds = prefs.getInt(PREFS_MAX_ALARM_DURATION, DEFAULT_MAX_ALARM_DURATION)
                promise.resolve(seconds)
            } catch (e: Exception) {
                promise.reject("GET_ERROR", e)
            }
        }

        @ReactMethod
        fun setAlarmTimeoutAction(action: String, promise: Promise) {
            try {
                val normalized = action.trim().uppercase()
                if (normalized != "SNOOZE" && normalized != "STOP") {
                    promise.reject("INVALID_ACTION", "Valid values are 'SNOOZE' or 'STOP'")
                    return
                }
                prefs.edit().putString(PREFS_ALARM_TIMEOUT_ACTION, normalized).apply()
            
                // Broadcast change so running services update behavior immediately
                val intent = Intent("ALARM_CONFIG_CHANGED").apply {
                    putExtra("alarm_timeout_action", normalized)
                }
                reactApplicationContext.sendBroadcast(intent)
            
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("SET_ERROR", e)
            }
        }
        
        @ReactMethod
        fun getAlarmTimeoutAction(promise: Promise) {
            try {
                val action = prefs.getString(PREFS_ALARM_TIMEOUT_ACTION, DEFAULT_ALARM_TIMEOUT_ACTION)
                promise.resolve(action)
            } catch (e: Exception) {
                promise.reject("GET_ERROR", e)
            }
        }

        // --- Ringtone ---
        @ReactMethod
        fun setRingtone(uri: String?, promise: Promise) {
            try {
                // Validate URI format if provided
                if (!uri.isNullOrEmpty()) {
                    try {
                        Uri.parse(uri)
                    } catch (e: Exception) {
                        promise.reject("INVALID_URI", "Invalid ringtone URI format")
                        return
                    }
                }
                
                prefs.edit().putString(PREFS_SOUND_URI, uri).apply()
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("SET_ERROR", e)
            }
        }
    
        @ReactMethod
        fun getSelectedRingtone(promise: Promise) {
            try {
                val uri = prefs.getString(PREFS_SOUND_URI, null)
                if (uri != null) {
                    val ringtone = RingtoneManager.getRingtone(reactApplicationContext, Uri.parse(uri))
                    if (ringtone != null) {
                        val ringtoneInfo = Arguments.createMap().apply {
                            putString("title", ringtone.getTitle(reactApplicationContext))
                            putString("uri", uri)
                        }
                        promise.resolve(ringtoneInfo)
                    } else {
                        // Invalid URI or ringtone not found - clear the invalid preference
                        prefs.edit().remove(PREFS_SOUND_URI).apply()
                        promise.resolve(null)
                    }
                } else {
                    promise.resolve(null) // no ringtone saved yet
                }
            } catch (e: Exception) {
                promise.reject("E_GET_RINGTONE", e)
            }
        }
    
        @ReactMethod
        fun getAllRingtones(promise: Promise) {
            var cursor: android.database.Cursor? = null
            try {
                val ringtoneManager = RingtoneManager(reactApplicationContext)
                ringtoneManager.setType(RingtoneManager.TYPE_ALARM)
                cursor = ringtoneManager.cursor
            
                val ringtonesList = Arguments.createArray()
                cursor?.let {
                    for (i in 0 until it.count) {
                        it.moveToPosition(i)
                        val title = it.getString(RingtoneManager.TITLE_COLUMN_INDEX)
                        val uri = ringtoneManager.getRingtoneUri(i)
                    
                        val ringtoneInfo = Arguments.createMap().apply {
                            putString("title", title)
                            putString("uri", uri.toString())
                        }
                        ringtonesList.pushMap(ringtoneInfo)
                    }
                }
                promise.resolve(ringtonesList)
            } catch (e: Exception) {
                promise.reject("E_GET_ALL_RINGTONES", e)
            } finally {
                cursor?.close()
            }
        }

        @ReactMethod
        fun setVibrate(enabled: Boolean, promise: Promise) {
            try {
                prefs.edit().putBoolean(PREFS_VIBRATE, enabled).apply()
                
                // Broadcast the change to running services/activities
                val intent = Intent("ALARM_CONFIG_CHANGED").apply {
                    putExtra("vibrate", enabled)
                }
                reactApplicationContext.sendBroadcast(intent)
                
                // Recreate notification channel with updated vibration setting
                val context = reactApplicationContext
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                    nm.deleteNotificationChannel(AlarmNotificationHelper.CHANNEL_ID)
                    AlarmNotificationHelper.ensureNotificationChannel(context)
                }
                
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("SET_ERROR", e)
            }
        }
    
        @ReactMethod
        fun getVibrate(promise: Promise) {
            try {
                val enabled = prefs.getBoolean(PREFS_VIBRATE, DEFAULT_VIBRATE)
                promise.resolve(enabled)
            } catch (e: Exception) {
                promise.reject("GET_ERROR", e)
            }
        }
    
        // --- Icons ---
        @ReactMethod
        fun setSmallIcon(name: String?, promise: Promise) {
            try {
                if (name.isNullOrEmpty()) {
                    promise.reject("INVALID_INPUT", "Icon name cannot be empty")
                    return
                }
                prefs.edit().putString(PREFS_SMALL_ICON, name).apply()
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("SET_ERROR", e)
            }
        }
    
        @ReactMethod
        fun getSmallIcon(promise: Promise) {
            try {
                val icon = prefs.getString(PREFS_SMALL_ICON, DEFAULT_SMALL_ICON)
                promise.resolve(icon)
            } catch (e: Exception) {
                promise.reject("GET_ERROR", e)
            }
        }
    
        @ReactMethod
        fun setBigIcon(name: String?, promise: Promise) {
            try {
                if (name.isNullOrEmpty()) {
                    promise.reject("INVALID_INPUT", "Icon name cannot be empty")
                    return
                }
                prefs.edit().putString(PREFS_BIG_ICON, name).apply()
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("SET_ERROR", e)
            }
        }
    
        @ReactMethod
        fun getBigIcon(promise: Promise) {
            try {
                val icon = prefs.getString(PREFS_BIG_ICON, DEFAULT_BIG_ICON)
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
                    putInt("snoozeMinutes", prefs.getInt(PREFS_SNOOZE_MINUTES, DEFAULT_SNOOZE_MINUTES))

                    val soundUri = prefs.getString(PREFS_SOUND_URI, null)

                    putString("soundUri", soundUri)
                    putBoolean("vibrate", prefs.getBoolean(PREFS_VIBRATE, DEFAULT_VIBRATE))
                    putString("smallIcon", prefs.getString(PREFS_SMALL_ICON, DEFAULT_SMALL_ICON))
                    putString("bigIcon", prefs.getString(PREFS_BIG_ICON, DEFAULT_BIG_ICON))
                    putInt("maxAlarmDuration", prefs.getInt(PREFS_MAX_ALARM_DURATION, DEFAULT_MAX_ALARM_DURATION))
                    putString("alarmTimeoutAction", prefs.getString(PREFS_ALARM_TIMEOUT_ACTION, DEFAULT_ALARM_TIMEOUT_ACTION))
                }
                promise.resolve(config)
            } catch (e: Exception) {
                promise.reject("GET_ERROR", e)
            }
        }
    
        // --- Clear All Settings (Optional) ---
        @ReactMethod
        fun clearAllSettings(promise: Promise) {
            try {
                prefs.edit().clear().apply()
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("CLEAR_ERROR", e)
            }
        }

        // --- Debugging Helper ---
        @ReactMethod
        fun getCurrentVibrationStatus(promise: Promise) {
            try {
                val prefs = reactApplicationContext.getSharedPreferences("AlarmConfig", Context.MODE_PRIVATE)
                val vibrateSetting = prefs.getBoolean("vibrate", true)
                val hasVibrator = hasVibrator()
                val status = Arguments.createMap().apply {
                    putBoolean("vibrateSetting", vibrateSetting)
                    putBoolean("hasVibrator", hasVibrator())
                    putBoolean("willVibrate", vibrateSetting && hasVibrator)
                }
                promise.resolve(status)
            } catch (e: Exception) {
                promise.reject("GET_STATUS_ERROR", e)
            }
        }

        private fun hasVibrator(): Boolean {
            return try {
                val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    val vibratorManager = reactApplicationContext.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
                    vibratorManager.defaultVibrator
                } else {
                    @Suppress("DEPRECATION")
                    reactApplicationContext.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
                }
                vibrator.hasVibrator()
            } catch (e: Exception) {
                false
            }
        }
}