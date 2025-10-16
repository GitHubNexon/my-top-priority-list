package com.mypriorities.alarm

import android.content.Context
import com.tencent.mmkv.MMKV
import com.google.gson.Gson

object EncryptedStorageHelper {
    private const val ENCRYPTED_PREFS_NAME = "encrypted_alarms"

    private fun getMMKV(context: Context): MMKV {
        val encryptionKey = EncryptionHelper.getOrCreateMMKVKey(context)
        return MMKV.mmkvWithID(ENCRYPTED_PREFS_NAME, MMKV.MULTI_PROCESS_MODE, encryptionKey)
            ?: throw IllegalStateException("Failed to initialize MMKV with encryption")
    }

    fun saveEncryptedAlarm(context: Context, alarmItem: AlarmItem) {
        val gson = Gson()
        val alarmJson = gson.toJson(alarmItem)

        val mmkv = getMMKV(context)
        mmkv.encode(alarmItem.requestCodeStr, alarmJson)

        // Maintain list of IDs for retrieval
        val ids = getAlarmIdList(context).toMutableList()
        if (!ids.contains(alarmItem.requestCodeStr)) {
            ids.add(alarmItem.requestCodeStr)
            saveAlarmIdList(context, ids)
        }
    }

    fun getEncryptedAlarm(context: Context, requestCodeStr: String): AlarmItem? {
        return try {
            val mmkv = getMMKV(context)
            val json = mmkv.decodeString(requestCodeStr) ?: return null
            Gson().fromJson(json, AlarmItem::class.java)
        } catch (e: Exception) {
            null
        }
    }

    fun getAllEncryptedAlarms(context: Context): List<AlarmItem> {
        val mmkv = getMMKV(context)
        val ids = getAlarmIdList(context)
        val gson = Gson()

        return ids.mapNotNull { id ->
            mmkv.decodeString(id)?.let { json -> gson.fromJson(json, AlarmItem::class.java) }
        }
    }

    fun removeEncryptedAlarm(context: Context, requestCodeStr: String) {
        val mmkv = getMMKV(context)
        mmkv.removeValueForKey(requestCodeStr)

        val ids = getAlarmIdList(context).toMutableList()
        ids.remove(requestCodeStr)
        saveAlarmIdList(context, ids)
    }

    fun clearAllEncryptedAlarms(context: Context) {
        try {
            // Reset everything related to encryption and MMKV
            EncryptionHelper.resetKeys(context)
        } catch (_: Exception) {}
    }

    private fun getAlarmIdList(context: Context): List<String> {
        val mmkv = getMMKV(context)
        val idsJson = mmkv.decodeString("alarm_ids")
        return if (idsJson != null) {
            Gson().fromJson(idsJson, Array<String>::class.java).toList()
        } else {
            emptyList()
        }
    }

    private fun saveAlarmIdList(context: Context, ids: List<String>) {
        val mmkv = getMMKV(context)
        val json = Gson().toJson(ids)
        mmkv.encode("alarm_ids", json)
    }
}