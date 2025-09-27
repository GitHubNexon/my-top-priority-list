package com.mypriorities.alarm

import android.content.Context
import android.util.Base64
import com.tencent.mmkv.MMKV
import java.security.Key
import javax.crypto.Cipher
import javax.crypto.spec.SecretKeySpec

object EncryptionHelper {
    private const val ALGORITHM = "AES"
    private const val TRANSFORMATION = "AES/ECB/PKCS5Padding"
    private const val KEY_ALIAS = "alarm_encryption_key"
    
    private var mmkv: MMKV? = null
    
    fun initialize(context: Context) {
        MMKV.initialize(context)
        mmkv = MMKV.defaultMMKV()
    }
    
    private fun getOrCreateKey(): Key {
        val keyBytes = mmkv?.decodeBytes(KEY_ALIAS)
            ?: ByteArray(16).apply {
                java.security.SecureRandom().nextBytes(this)
                mmkv?.encode(KEY_ALIAS, this)
            }
        
        return SecretKeySpec(keyBytes, ALGORITHM)
    }
    
    fun encrypt(data: String): String {
        return try {
            val cipher = Cipher.getInstance(TRANSFORMATION)
            cipher.init(Cipher.ENCRYPT_MODE, getOrCreateKey())
            val encryptedBytes = cipher.doFinal(data.toByteArray(Charsets.UTF_8))
            Base64.encodeToString(encryptedBytes, Base64.NO_WRAP)
        } catch (e: Exception) {
            // Return original data if encryption fails
            data
        }
    }
    
    fun decrypt(encryptedData: String): String {
        return try {
            val cipher = Cipher.getInstance(TRANSFORMATION)
            cipher.init(Cipher.DECRYPT_MODE, getOrCreateKey())
            val encryptedBytes = Base64.decode(encryptedData, Base64.NO_WRAP)
            val decryptedBytes = cipher.doFinal(encryptedBytes)
            String(decryptedBytes, Charsets.UTF_8)
        } catch (e: Exception) {
            // Return original data if decryption fails (might be plain text)
            encryptedData
        }
    }
}