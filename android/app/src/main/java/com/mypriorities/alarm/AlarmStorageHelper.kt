package com.mypriorities.alarm

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.util.*

object AlarmStorageHelper {
    private const val PREFS_NAME = "ScheduledAlarms"
    private const val ALARMS_KEY = "alarms_list"
    private const val ENCRYPTED_ALARMS_KEY = "encrypted_alarms_list"
    private val gson = Gson()
    private var isInitialized = false

    // Initialize encryption (call this in your Application class)
    fun initializeEncryption(context: Context) {
        if (!isInitialized) {
            EncryptionHelper.initialize(context)
            migrateExistingAlarms(context)
            isInitialized = true
        }
    }

    // Add this method to check initialization status
    fun isInitialized(): Boolean {
        return isInitialized
    }

    private fun ensureInitialized(context: Context) {
        if (!isInitialized) {
            initializeEncryption(context)
        }
    }

    fun saveAlarm(context: Context, alarmItem: AlarmItem) {
        ensureInitialized(context)

        // Ensure encryption is initialized
        if (!isInitialized) {
            initializeEncryption(context)
        }

        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        
        // Convert alarm to JSON
        val alarmJson = gson.toJson(alarmItem)
        
        // Encrypt the JSON string
        val encryptedAlarmJson = EncryptionHelper.encrypt(alarmJson)
        
        // Get existing encrypted alarms
        val existingEncryptedAlarms = getEncryptedAlarmsList(prefs)
        
        // Remove existing alarm with same requestCode
        val updatedAlarms = existingEncryptedAlarms.toMutableList().apply {
            // Find and remove existing alarm by requestCode
            removeAll { encryptedAlarm ->
                try {
                    val decrypted = EncryptionHelper.decrypt(encryptedAlarm)
                    val existingAlarm = gson.fromJson(decrypted, AlarmItem::class.java)
                    existingAlarm.requestCode == alarmItem.requestCode
                } catch (e: Exception) {
                    false
                }
            }
            // Add the new encrypted alarm
            add(encryptedAlarmJson)
        }
        
        // Save the list of encrypted alarms
        saveEncryptedAlarmsList(prefs, updatedAlarms)
    }

    fun removeAlarm(context: Context, requestCode: Int) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val existingEncryptedAlarms = getEncryptedAlarmsList(prefs)
        
        val updatedAlarms = existingEncryptedAlarms.filter { encryptedAlarm ->
            try {
                val decrypted = EncryptionHelper.decrypt(encryptedAlarm)
                val alarm = gson.fromJson(decrypted, AlarmItem::class.java)
                alarm.requestCode != requestCode
            } catch (e: Exception) {
                true // Keep if we can't decrypt (shouldn't happen)
            }
        }
        
        saveEncryptedAlarmsList(prefs, updatedAlarms)
    }

    fun getAllAlarms(context: Context): List<AlarmItem> {
        ensureInitialized(context)

        // Ensure encryption is initialized
        if (!isInitialized) {
            initializeEncryption(context)
        }

        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val encryptedAlarmsList = getEncryptedAlarmsList(prefs)
        
        return encryptedAlarmsList.mapNotNull { encryptedAlarm ->
            try {
                val decrypted = EncryptionHelper.decrypt(encryptedAlarm)
                gson.fromJson(decrypted, AlarmItem::class.java)
            } catch (e: Exception) {
                null // Skip if we can't decrypt
            }
        }
    }

    fun getAlarmByRequestCode(context: Context, requestCode: Int): AlarmItem? {
        return getAllAlarms(context).find { it.requestCode == requestCode }
    }

    fun getAlarmByRequestCodeStr(context: Context, requestCodeStr: String): AlarmItem? {
        return getAllAlarms(context).find { it.requestCodeStr == requestCodeStr }
    }

    fun clearAllAlarms(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        saveEncryptedAlarmsList(prefs, emptyList())
    }

    fun generateRequestCode(requestCodeStr: String? = null): Int {
        val codeStr = requestCodeStr ?: UUID.randomUUID().toString()
        return codeStr.hashCode() and 0x7FFFFFFF // Ensure positive integer
    }

    fun generateRequestCodeStr(requestCodeStr: String? = null): String {
        return requestCodeStr ?: UUID.randomUUID().toString()
    }

    // Helper methods for encrypted list storage
    private fun getEncryptedAlarmsList(prefs: SharedPreferences): List<String> {
        val encryptedListJson = prefs.getString(ENCRYPTED_ALARMS_KEY, "[]") ?: "[]"
        return try {
            gson.fromJson(encryptedListJson, Array<String>::class.java)?.toList() ?: emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }

    private fun saveEncryptedAlarmsList(prefs: SharedPreferences, alarms: List<String>) {
        val encryptedListJson = gson.toJson(alarms)
        prefs.edit().putString(ENCRYPTED_ALARMS_KEY, encryptedListJson).apply()
    }

    // Migration method to encrypt existing plain text alarms
    fun migrateExistingAlarms(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        
        // Check if we already have encrypted data
        if (prefs.contains(ENCRYPTED_ALARMS_KEY)) {
            return // Already migrated
        }
        
        // Check if we have legacy plain text data
        val legacyAlarmsJson = prefs.getString(ALARMS_KEY, null)
        if (legacyAlarmsJson != null) {
            try {
                val type = object : TypeToken<List<AlarmItem>>() {}.type
                val legacyAlarms: List<AlarmItem> = gson.fromJson(legacyAlarmsJson, type) ?: emptyList()
                
                if (legacyAlarms.isNotEmpty()) {
                    // Encrypt each alarm and save to new storage
                    val encryptedAlarms = legacyAlarms.map { alarm ->
                        val alarmJson = gson.toJson(alarm)
                        EncryptionHelper.encrypt(alarmJson)
                    }
                    
                    saveEncryptedAlarmsList(prefs, encryptedAlarms)
                    
                    // Optional: Remove legacy data after migration
                    // prefs.edit().remove(ALARMS_KEY).apply()
                }
            } catch (e: Exception) {
                // Migration failed, start fresh
                saveEncryptedAlarmsList(prefs, emptyList())
            }
        }
    }
}