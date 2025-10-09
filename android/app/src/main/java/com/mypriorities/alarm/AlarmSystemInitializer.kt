package com.mypriorities.alarm

import android.content.Context

object AlarmSystemInitializer {
    
    /**
     * Initialize all alarm system components
     */
    fun initialize(context: Context): InitializationResult {
        return try {
            // 1. Initialize encryption system
            AlarmStorageHelper.initializeEncryption(context)
            
            // 2. Ensure notification channel exists
            AlarmNotificationHelper.ensureNotificationChannel(context)
            
            // 3. Check exact alarm permissions
            val canScheduleExactAlarms = PermissionHelper.canScheduleExactAlarms(context)
            
            InitializationResult(
                isSuccess = true,
                canScheduleExactAlarms = canScheduleExactAlarms,
                requiresExactAlarmPermission = !canScheduleExactAlarms && 
                    android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S
            )
        } catch (e: Exception) {
            InitializationResult(
                isSuccess = false,
                errorMessage = e.message ?: "Unknown initialization error",
                canScheduleExactAlarms = false,
                requiresExactAlarmPermission = false
            )
        }
    }
    
    /**
     * Data class for initialization results
     */
    data class InitializationResult(
        val isSuccess: Boolean,
        val errorMessage: String? = null,
        val canScheduleExactAlarms: Boolean = false,
        val requiresExactAlarmPermission: Boolean = false
    )
}