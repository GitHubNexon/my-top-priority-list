package com.mypriorities.alarm

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import java.util.*

object AlarmStorageHelper {
    private const val PREFS_NAME = "ScheduledAlarms"
    private const val ENCRYPTED_ALARMS_KEY = "encrypted_alarms_list"
    private val gson = Gson()
    private var isInitialized = false

    // Initialize encryption (call this in your Application class)
    fun initializeEncryption(context: Context) {
        if (!isInitialized) {
            EncryptionHelper.initialize(context)
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

        // Save the alarm securely in MMKV
        EncryptedStorageHelper.saveEncryptedAlarm(context, alarmItem)

        // Maintain list of request codes in SharedPreferences for reference
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val ids = getEncryptedAlarmsList(prefs).toMutableList()
        if (!ids.contains(alarmItem.requestCodeStr)) {
            ids.add(alarmItem.requestCodeStr)
            saveEncryptedAlarmsList(prefs, ids)
        }
    }

    fun removeAlarm(context: Context, requestCode: Int) {
        ensureInitialized(context)

        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val allIds = getEncryptedAlarmsList(prefs).toMutableList()

        // Find alarm by requestCode
        val alarmToRemove = getAllAlarms(context).find { it.requestCode == requestCode }
        if (alarmToRemove != null) {
            EncryptedStorageHelper.removeEncryptedAlarm(context, alarmToRemove.requestCodeStr)
            allIds.remove(alarmToRemove.requestCodeStr)
            saveEncryptedAlarmsList(prefs, allIds)
        }
    }

    fun getAllAlarms(context: Context): List<AlarmItem> {
        ensureInitialized(context)
        return EncryptedStorageHelper.getAllEncryptedAlarms(context)
    }

    fun getAlarmByRequestCode(context: Context, requestCode: Int): AlarmItem? {
        return getAllAlarms(context).find { it.requestCode == requestCode }
    }

    fun getAlarmByRequestCodeStr(context: Context, requestCodeStr: String): AlarmItem? {
        return EncryptedStorageHelper.getEncryptedAlarm(context, requestCodeStr)
    }

    fun clearAllAlarms(context: Context) {
        ensureInitialized(context)
        EncryptedStorageHelper.clearAllEncryptedAlarms(context)

        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        saveEncryptedAlarmsList(prefs, emptyList())
    }

    private fun getEncryptedAlarmsList(prefs: SharedPreferences): List<String> {
        val json = prefs.getString(ENCRYPTED_ALARMS_KEY, "[]") ?: "[]"
        return try {
            gson.fromJson(json, Array<String>::class.java)?.toList() ?: emptyList()
        } catch (_: Exception) {
            emptyList()
        }
    }

    private fun saveEncryptedAlarmsList(prefs: SharedPreferences, ids: List<String>) {
        prefs.edit().putString(ENCRYPTED_ALARMS_KEY, gson.toJson(ids)).apply()
    }
}