package com.mypriorities.alarm

import android.Manifest
import android.app.Activity
import android.app.AlarmManager
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import org.json.JSONObject

class AlarmModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val prefs: SharedPreferences by lazy {
        reactContext.getSharedPreferences("AlarmConfig", Context.MODE_PRIVATE)
    }

    private val REQUEST_POST_NOTIFICATIONS = 2345
    private var pendingPermissionPromise: Promise? = null

    // Must be declared before init block
    private val activityEventListener = object : BaseActivityEventListener() {
        override fun onActivityResult(
            activity: Activity,
            requestCode: Int,
            resultCode: Int,
            data: Intent?
        ) {
            // Handle results if needed
        }
    }

    init {
        reactContext.addActivityEventListener(activityEventListener)
    }

    override fun getName() = "AlarmModule"

    // Alarm initialization & system info
    @ReactMethod
    fun initializeAlarmSystem(promise: Promise) {
        try {
            val result = AlarmSystemInitializer.initialize(reactContext)
            when {
                result.isSuccess && result.requiresExactAlarmPermission ->
                    promise.resolve("PERMISSION_NEEDED")

                result.isSuccess ->
                    promise.resolve("INITIALIZED")

                else -> promise.reject("E_INIT_ERROR", "Failed to initialize: ${result.errorMessage}")
            }
        } catch (e: Exception) {
            promise.reject("E_INIT_ERROR", e.message)
        }
    }

    @ReactMethod
    fun ensureFullScreenIntentPermission(promise: Promise) {
        try {
            PermissionHelper.requestFullScreenIntentPermission(reactContext)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("E_FSI_PERMISSION", e.message)
        }
    }

    @ReactMethod
    fun canScheduleExactAlarms(promise: Promise) {
        try {
            promise.resolve(PermissionHelper.canScheduleExactAlarms(reactContext))
        } catch (e: Exception) {
            promise.reject("E_PERMISSION_CHECK", e.message)
        }
    }

    @ReactMethod
    fun openAppSettings(promise: Promise) {
        try {
            PermissionHelper.openAppSettings(reactContext)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("E_OPEN_SETTINGS", e.message)
        }
    }

    @ReactMethod
    fun getSystemInfo(promise: Promise) {
        try {
            val systemInfo = Arguments.createMap().apply {
                putInt("sdkVersion", Build.VERSION.SDK_INT)
                putString("manufacturer", Build.MANUFACTURER)
                putString("model", Build.MODEL)
                putBoolean("canScheduleExactAlarms",
                    PermissionHelper.canScheduleExactAlarms(reactContext))
            }
            promise.resolve(systemInfo)
        } catch (e: Exception) {
            promise.reject("E_SYSTEM_INFO", e.message)
        }
    }

    // Notification Permission Handling
    @ReactMethod
    fun requestNotificationPermission(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                val activity = getCurrentActivity() ?: reactContext.currentActivity
                if (ContextCompat.checkSelfPermission(
                        reactContext,
                        Manifest.permission.POST_NOTIFICATIONS
                    ) == PackageManager.PERMISSION_GRANTED
                ) {
                    promise.resolve("GRANTED")
                    return
                }

                if (activity == null) {
                    val intent = Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply {
                        putExtra(Settings.EXTRA_APP_PACKAGE, reactContext.packageName)
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    reactContext.startActivity(intent)
                    promise.resolve("REQUESTED")
                    return
                }

                pendingPermissionPromise = promise
                ActivityCompat.requestPermissions(
                    activity,
                    arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                    REQUEST_POST_NOTIFICATIONS
                )
            } else {
                promise.resolve("GRANTED")
            }
        } catch (e: Exception) {
            pendingPermissionPromise = null
            promise.reject("PERMISSION_ERROR", e.message)
        }
    }

    @ReactMethod
    fun checkNotificationPermission(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                val manager =
                    reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                promise.resolve(if (manager.areNotificationsEnabled()) "GRANTED" else "DENIED")
            } else {
                promise.resolve("GRANTED")
            }
        } catch (e: Exception) {
            promise.reject("PERMISSION_ERROR", e.message)
        }
    }

    @ReactMethod
    fun getInitializationStatus(promise: Promise) {
        try {
            val result = AlarmSystemInitializer.initialize(reactContext)
            val status = Arguments.createMap().apply {
                putBoolean("isInitialized", result.isSuccess)
                putBoolean("canScheduleExactAlarms", result.canScheduleExactAlarms)
                putBoolean("requiresExactAlarmPermission", result.requiresExactAlarmPermission)
                putString("errorMessage", result.errorMessage)
            }
            promise.resolve(status)
        } catch (e: Exception) {
            promise.reject("E_STATUS_CHECK", "Failed to get initialization status: ${e.message}")
        }
    }

    @ReactMethod
    fun generateRequestCode(promise: Promise) {
        try {
            val requestCodeStr = RequestCodeHelper.generateRequestCodeStr()
            promise.resolve(requestCodeStr)
        } catch (e: Exception) {
            promise.reject("E_GENERATE_CODE", e)
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
            // Validate recurrence pattern
            if (!RecurrenceHelper.validateRecurrencePattern(recurrenceType, recurrencePattern)) {
                promise.reject("E_INVALID_PATTERN", "Invalid recurrence pattern for type: $recurrenceType")
                return
            }

            // Generate request code if not provided
            val finalRequestCodeStr = RequestCodeHelper.generateRequestCodeStr(requestCodeStr)
            val requestCode = RequestCodeHelper.generateRequestCode(finalRequestCodeStr)
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

            AlarmStorageHelper.removeAlarm(reactContext, existingAlarm.requestCode)

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
    fun isAlarmScheduled(requestCodeStr: String, promise: Promise) {
        try {
            val alarm = AlarmStorageHelper.getAlarmByRequestCodeStr(reactContext, requestCodeStr)
            promise.resolve(alarm != null)
        } catch (e: Exception) {
            promise.reject("E_CHECK_ALARM", e)
        }
    }

        /**
     * Deletes a specific alarm from all storages (MMKV, SharedPreferences, EncryptedSharedPreferences)
     * and cancels its scheduled alarm.
     */
    @ReactMethod
    fun clearAlarm(requestCodeStr: String, promise: Promise) {
        try {
            // Try to find the alarm in either storage
            val alarm = AlarmStorageHelper.getAlarmByRequestCodeStr(reactContext, requestCodeStr)
                ?: EncryptedStorageHelper.getEncryptedAlarm(reactContext, requestCodeStr)

            if (alarm == null) {
                promise.resolve(false)
                return
            }

            // Cancel scheduled alarm
            AlarmScheduler.cancelAlarm(reactContext, alarm.requestCode)

            // Remove alarm from all storage layers
            AlarmStorageHelper.removeAlarm(reactContext, alarm.requestCode)

            // Stop any running alarm services or notifications
            try {
                AlarmNotificationHelper.cancelAlarmNotification(reactContext)
                reactContext.stopService(Intent(reactContext, AlarmSoundService::class.java))
            } catch (_: Exception) { }

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("E_CLEAR_ALARM", e)
        }
    }

    /**
     * Completely wipes all stored alarms, preferences, MMKV data,
     * encrypted files, and resets encryption keys.
     * This is effectively a full local alarm data reset.
     */
    @ReactMethod
    fun clearAllAlarms(promise: Promise) {
        try {
            val intent = Intent("ALARM_CONFIG_CLEARED")

            // Cancel all scheduled alarms first
            val alarms = AlarmStorageHelper.getAllAlarms(reactContext)
            alarms.forEach { alarm ->
                AlarmScheduler.cancelAlarm(reactContext, alarm.requestCode)
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val nm = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                nm.deleteNotificationChannel(AlarmNotificationHelper.CHANNEL_ID)
                AlarmNotificationHelper.ensureNotificationChannel(reactContext)
            }

            // Clear all local storages
            AlarmStorageHelper.clearAllAlarms(reactContext)

            // Clear general SharedPreferences or EncryptedSharedPreferences
            try {
                val encPrefs = reactContext.getSharedPreferences("AlarmConfig", Context.MODE_PRIVATE)
                encPrefs.edit().clear().apply()
            } catch (_: Exception) { }

            // Reset encryption keys (optional, full wipe)
            try {
                EncryptionHelper.resetKeys(reactContext)
            } catch (_: Exception) { }

            // Stop running services and remove notifications
            try {
                reactContext.stopService(Intent(reactContext, AlarmSoundService::class.java))
                AlarmNotificationHelper.cancelAlarmNotification(reactContext)
            } catch (_: Exception) { }

            reactContext.sendBroadcast(intent)

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("E_CLEAR_ALL_ALARMS", e)
        }
    }
}