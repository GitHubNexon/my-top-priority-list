package com.mypriorities.alarm

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.tencent.mmkv.MMKV
import java.util.UUID

object EncryptionHelper {
    private const val PREF_FILE_NAME = "encrypted_mmkv_prefs"
    private const val KEY_ALIAS = "mmkv_encryption_key"
    private var isInitialized = false

    /**
     * Initialize encryption helper and ensure MMKV key exists.
     * Should be called once at app startup (e.g., MainApplication.onCreate()).
     */
    fun initialize(context: Context) {
        if (isInitialized) return

        try {
            val key = getOrCreateMMKVKey(context)

            // Initialize MMKV with the encrypted key
            val mmkvRoot = MMKV.initialize(context)
            MMKV.mmkvWithID("encrypted_alarms", MMKV.SINGLE_PROCESS_MODE, key)

            Log.d("EncryptionHelper", "MMKV initialized at: $mmkvRoot with encrypted key.")
            isInitialized = true
        } catch (e: Exception) {
            Log.e("EncryptionHelper", "Initialization failed: ${e.message}", e)
        }
    }

    private fun getEncryptedPrefs(context: Context): SharedPreferences {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        return EncryptedSharedPreferences.create(
            context,
            PREF_FILE_NAME,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    /**
     * Returns an encryption key for MMKV.
     * If none exists yet, creates a new random UUID-based key.
     * The key is stored securely inside EncryptedSharedPreferences.
     */
    fun getOrCreateMMKVKey(context: Context): String {
        val prefs = getEncryptedPrefs(context)
        var key = prefs.getString(KEY_ALIAS, null)

        if (key == null) {
            key = UUID.randomUUID().toString()
            prefs.edit().putString(KEY_ALIAS, key).apply()
            Log.d("EncryptionHelper", "Generated new MMKV encryption key.")
        }

        return key
    }

    /**
     * Completely resets encryption keys and clears all alarm-related storage.
     * 
     * ⚠️ WARNING: This will remove all alarm data and encryption keys.
     * Do NOT call this during normal runtime except for:
     *   - Full app factory reset
     *   - User-initiated "reset alarms" action
     *
     * It will NOT affect login or global MMKV data.
     */
    fun resetKeys(context: Context) {
        try {
            Log.w("EncryptionHelper", "Resetting all encryption keys and alarm storage...")

            // 1️⃣ Clear only the encrypted alarms MMKV instance
            try {
                val mmkv = MMKV.mmkvWithID("encrypted_alarms")
                mmkv?.clearAll()
                Log.i("EncryptionHelper", "Cleared MMKV: encrypted_alarms")
            } catch (e: Exception) {
                Log.w("EncryptionHelper", "Failed to clear MMKV encrypted_alarms: ${e.message}")
            }

            // 2️⃣ Clear EncryptedSharedPreferences (used for MMKV key)
            try {
                val masterKey = MasterKey.Builder(context)
                    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                    .build()

                val encryptedPrefs = EncryptedSharedPreferences.create(
                    context,
                    PREF_FILE_NAME, // same name used for alarm encryption key
                    masterKey,
                    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
                )

                encryptedPrefs.edit().clear().apply()
                Log.i("EncryptionHelper", "Cleared EncryptedSharedPreferences: $PREF_FILE_NAME")
            } catch (e: Exception) {
                Log.w("EncryptionHelper", "Failed to clear EncryptedSharedPreferences: ${e.message}")
            }

            // 3️⃣ Clear alarm-related SharedPreferences (ScheduledAlarms, EncryptionPrefs, AlarmConfig)
            val alarmPrefsList = listOf("ScheduledAlarms", "EncryptionPrefs", "AlarmConfig")
            alarmPrefsList.forEach { name ->
                try {
                    context.getSharedPreferences(name, Context.MODE_PRIVATE)
                        .edit().clear().apply()
                    Log.i("EncryptionHelper", "Cleared SharedPreferences: $name")
                } catch (e: Exception) {
                    Log.w("EncryptionHelper", "Failed to clear SharedPreferences $name: ${e.message}")
                }
            }

            Log.i("EncryptionHelper", "✅ Alarm encryption and MMKV data cleared successfully.")
        } catch (e: Exception) {
            Log.e("EncryptionHelper", "Error during resetKeys: ${e.message}", e)
        }
    }
}