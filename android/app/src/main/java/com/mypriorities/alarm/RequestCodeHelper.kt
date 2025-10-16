package com.mypriorities.alarm

object RequestCodeHelper {
    
    /**
     * Generates a unique request code from a string identifier
     */
    fun generateRequestCode(identifier: String): Int {
        return identifier.hashCode() and 0x7FFFFFFF // Ensure positive integer
    }
    
    /**
     * Generates a request code for snooze functionality
     */
    fun generateSnoozeRequestCode(baseRequestCode: Int, uniqueId: Long? = null): Int {
        val identifier = if (uniqueId != null)
            "${baseRequestCode}_snooze_$uniqueId"
        else
            "${baseRequestCode}_snooze"
        return generateRequestCode(identifier)
    }

    
    /**
     * Generates a request code for notification actions
     */
    fun generateActionRequestCode(baseRequestCode: Int, actionType: Int): Int {
        return generateRequestCode("${baseRequestCode}_action_$actionType")
    }
    
    /**
     * Generates a unique request code string
     */
    fun generateRequestCodeStr(base: String? = null): String {
        return if (base.isNullOrEmpty()) java.util.UUID.randomUUID().toString() else base
    }
}