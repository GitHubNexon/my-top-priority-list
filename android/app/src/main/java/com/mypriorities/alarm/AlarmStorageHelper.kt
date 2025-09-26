package com.mypriorities.alarm

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.util.*

object AlarmStorageHelper {
    private const val PREFS_NAME = "ScheduledAlarms"
    private const val ALARMS_KEY = "alarms_list"
    private val gson = Gson()

    fun saveAlarm(context: Context, alarmItem: AlarmItem) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val alarms = getAllAlarms(context).toMutableList()
        
        // Remove existing alarm with same requestCode
        alarms.removeAll { it.requestCode == alarmItem.requestCode }
        
        // Add new/updated alarm
        alarms.add(alarmItem)
        
        val alarmsJson = gson.toJson(alarms)
        prefs.edit().putString(ALARMS_KEY, alarmsJson).apply()
    }

    fun removeAlarm(context: Context, requestCode: Int) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val alarms = getAllAlarms(context).toMutableList()
        
        alarms.removeAll { it.requestCode == requestCode }
        
        val alarmsJson = gson.toJson(alarms)
        prefs.edit().putString(ALARMS_KEY, alarmsJson).apply()
    }

    fun getAllAlarms(context: Context): List<AlarmItem> {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val alarmsJson = prefs.getString(ALARMS_KEY, "[]") ?: "[]"
        
        val type = object : TypeToken<List<AlarmItem>>() {}.type
        return gson.fromJson(alarmsJson, type) ?: emptyList()
    }

    fun getAlarmByRequestCode(context: Context, requestCode: Int): AlarmItem? {
        return getAllAlarms(context).find { it.requestCode == requestCode }
    }

    fun getAlarmByRequestCodeStr(context: Context, requestCodeStr: String): AlarmItem? {
        return getAllAlarms(context).find { it.requestCodeStr == requestCodeStr }
    }

    fun clearAllAlarms(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().remove(ALARMS_KEY).apply()
    }

    fun generateRequestCode(requestCodeStr: String? = null): Int {
        val codeStr = requestCodeStr ?: UUID.randomUUID().toString()
        return codeStr.hashCode() and 0x7FFFFFFF // Ensure positive integer
    }

    fun generateRequestCodeStr(requestCodeStr: String? = null): String {
        return requestCodeStr ?: UUID.randomUUID().toString()
    }
}