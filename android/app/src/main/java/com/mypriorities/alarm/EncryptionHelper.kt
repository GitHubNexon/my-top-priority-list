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
     * Completely resets encryption keys and clears all related storage.
     * This wipes MMKV, EncryptedSharedPreferences, and alarm-related SharedPreferences.
     * Call this ONLY when performing a full data wipe (factory reset or user logout).
     */
    fun resetKeys(context: Context) {
        try {
            Log.w("EncryptionHelper", "Resetting all encryption keys and storage...")

            // 1. Clear MMKV encrypted alarms
            try {
                MMKV.mmkvWithID("encrypted_alarms")?.clearAll()
                MMKV.onExit()
            } catch (_: Exception) { }

            // Delete MMKV directory manually
            try {
                val mmkvDir = context.filesDir.resolve("mmkv")
                if (mmkvDir.exists() && mmkvDir.isDirectory) {
                    mmkvDir.deleteRecursively()
                }
            } catch (_: Exception) { }

            // 2. Clear encrypted SharedPreferences (the MMKV key)
            try {
                val masterKey = MasterKey.Builder(context)
                    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                    .build()

                val encryptedPrefs = EncryptedSharedPreferences.create(
                    context,
                    PREF_FILE_NAME,
                    masterKey,
                    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
                )
                encryptedPrefs.edit().clear().apply()
            } catch (_: Exception) { }

            // 3. Clear all alarm SharedPreferences
            try {
                val prefs = context.getSharedPreferences("ScheduledAlarms", Context.MODE_PRIVATE)
                prefs.edit().clear().apply()
            } catch (_: Exception) { }

            // 4. Clear encryption cache
            try {
                val cachePrefs = context.getSharedPreferences("EncryptionPrefs", Context.MODE_PRIVATE)
                cachePrefs.edit().clear().apply()
            } catch (_: Exception) { }

            // 5. Clear AlarmConfig prefs
            try {
                val alarmConfigPrefs = context.getSharedPreferences("AlarmConfig", Context.MODE_PRIVATE)
                alarmConfigPrefs.edit().clear().apply()
            } catch (_: Exception) { }

            Log.i("EncryptionHelper", "All encryption and MMKV data successfully cleared.")
        } catch (e: Exception) {
            Log.e("EncryptionHelper", "Error resetting keys: ${e.message}", e)
        }
    }
}