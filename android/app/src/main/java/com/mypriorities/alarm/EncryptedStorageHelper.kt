package com.mypriorities.alarm

import android.content.Context
import android.content.SharedPreferences
import com.tencent.mmkv.MMKV

object EncryptedStorageHelper {
    private const val ENCRYPTED_PREFS_NAME = "encrypted_alarms"
    
    private fun getEncryptedMMKV(): MMKV {
        return MMKV.mmkvWithID(ENCRYPTED_PREFS_NAME, MMKV.MULTI_PROCESS_MODE)!!
    }
    
    fun saveEncryptedAlarm(context: Context, alarmItem: AlarmItem) {
        val gson = com.google.gson.Gson()
        val alarmJson = gson.toJson(alarmItem)
        val encryptedJson = EncryptionHelper.encrypt(alarmJson)
        
        val mmkv = getEncryptedMMKV()
        mmkv.encode(alarmItem.requestCodeStr, encryptedJson)
        
        // Also maintain a list of all alarm IDs for easy retrieval
        val alarmIds = getAlarmIdList(mmkv)
        if (!alarmIds.contains(alarmItem.requestCodeStr)) {
            alarmIds.add(alarmItem.requestCodeStr)
            saveAlarmIdList(mmkv, alarmIds)
        }
    }
    
    fun getEncryptedAlarm(requestCodeStr: String): AlarmItem? {
        return try {
            val mmkv = getEncryptedMMKV()
            val encryptedJson = mmkv.decodeString(requestCodeStr) ?: return null
            val decryptedJson = EncryptionHelper.decrypt(encryptedJson)
            com.google.gson.Gson().fromJson(decryptedJson, AlarmItem::class.java)
        } catch (e: Exception) {
            null
        }
    }
    
    fun getAllEncryptedAlarms(): List<AlarmItem> {
        val alarms = mutableListOf<AlarmItem>()
        val mmkv = getEncryptedMMKV()
        val alarmIds = getAlarmIdList(mmkv)
        
        alarmIds.forEach { id ->
            getEncryptedAlarm(id)?.let { alarm ->
                alarms.add(alarm)
            }
        }
        
        return alarms
    }
    
    fun removeEncryptedAlarm(requestCodeStr: String) {
        val mmkv = getEncryptedMMKV()
        mmkv.removeValueForKey(requestCodeStr)
        
        // Update the ID list
        val alarmIds = getAlarmIdList(mmkv)
        alarmIds.remove(requestCodeStr)
        saveAlarmIdList(mmkv, alarmIds)
    }
    
    fun clearAllEncryptedAlarms() {
        val mmkv = getEncryptedMMKV()
        val alarmIds = getAlarmIdList(mmkv)
        
        alarmIds.forEach { id ->
            mmkv.removeValueForKey(id)
        }
        
        mmkv.removeValueForKey("alarm_ids")
    }
    
    private fun getAlarmIdList(mmkv: MMKV): MutableList<String> {
        val encryptedIds = mmkv.decodeString("alarm_ids")
        return if (encryptedIds != null) {
            val decryptedIds = EncryptionHelper.decrypt(encryptedIds)
            com.google.gson.Gson().fromJson(decryptedIds, Array<String>::class.java).toMutableList()
        } else {
            mutableListOf()
        }
    }
    
    private fun saveAlarmIdList(mmkv: MMKV, ids: List<String>) {
        val idsJson = com.google.gson.Gson().toJson(ids)
        val encryptedIds = EncryptionHelper.encrypt(idsJson)
        mmkv.encode("alarm_ids", encryptedIds)
    }
}