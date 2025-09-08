package com.mypriorities.navigation

import android.content.Context
import android.provider.Settings
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class AndroidNavigationModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "AndroidNavigation"

    @ReactMethod
    fun getNavigationMode(promise: Promise) {
        try {
            val context: Context = reactApplicationContext
            val mode = Settings.Secure.getInt(
                context.contentResolver,
                "navigation_mode",
                0
            )
            val navType = when (mode) {
                0 -> "3-button"
                1 -> "2-button"
                2 -> "gesture"
                else -> "3-button"
            }
            promise.resolve(navType)
        } catch (e: Exception) {
            promise.reject("ERR_NAV_MODE", e)
        }
    }
}