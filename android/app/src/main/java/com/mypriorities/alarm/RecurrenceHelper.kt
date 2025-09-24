package com.mypriorities.alarm

import org.json.JSONObject
import java.util.Calendar

object RecurrenceHelper {
    
    const val TYPE_ONCE = "ONCE"
    const val TYPE_DAILY = "DAILY"
    const val TYPE_WEEKLY = "WEEKLY"
    const val TYPE_MONTHLY = "MONTHLY"
    const val TYPE_YEARLY = "YEARLY"
    const val TYPE_CUSTOM = "CUSTOM"
    
    fun calculateNextTriggerTime(
        currentTime: Long,
        recurrenceType: String,
        recurrencePattern: String,
        daysOfWeek: List<Int>,
        dayOfMonth: Int,
        interval: Int,
        startDate: Long
    ): Long {
        val calendar = Calendar.getInstance().apply {
            timeInMillis = currentTime
            add(Calendar.MINUTE, 1) // Ensure next trigger is at least 1 minute in future
        }
        
        return when (recurrenceType) {
            TYPE_DAILY -> {
                calendar.add(Calendar.DAY_OF_YEAR, interval)
                calendar.timeInMillis
            }
            
            TYPE_WEEKLY -> {
                if (daysOfWeek.isNotEmpty()) {
                    // Find next occurrence based on specific days of week
                    val currentDayOfWeek = calendar.get(Calendar.DAY_OF_WEEK) - 1 // Convert to 0-6 (Sun=0)
                    
                    // Sort days and find the next one
                    val sortedDays = daysOfWeek.sorted()
                    var nextDay = sortedDays.find { it > currentDayOfWeek }
                    
                    if (nextDay == null) {
                        // If no day found in current week, take first day of next week
                        nextDay = sortedDays.first()
                        calendar.add(Calendar.WEEK_OF_YEAR, 1)
                    }
                    
                    // Set to the next day
                    val daysToAdd = if (nextDay > currentDayOfWeek) {
                        nextDay - currentDayOfWeek
                    } else {
                        7 - currentDayOfWeek + nextDay
                    }
                    
                    calendar.add(Calendar.DAY_OF_YEAR, daysToAdd)
                } else {
                    // Weekly with interval
                    calendar.add(Calendar.WEEK_OF_YEAR, interval)
                }
                calendar.timeInMillis
            }
            
            TYPE_MONTHLY -> {
                if (dayOfMonth > 0) {
                    // Specific day of month
                    calendar.set(Calendar.DAY_OF_MONTH, dayOfMonth)
                    if (calendar.timeInMillis <= currentTime) {
                        calendar.add(Calendar.MONTH, 1)
                        // Handle cases where day doesn't exist in next month
                        val maxDaysInMonth = calendar.getActualMaximum(Calendar.DAY_OF_MONTH)
                        if (dayOfMonth > maxDaysInMonth) {
                            calendar.set(Calendar.DAY_OF_MONTH, maxDaysInMonth)
                        } else {
                            calendar.set(Calendar.DAY_OF_MONTH, dayOfMonth)
                        }
                    }
                } else {
                    // Monthly with interval (same day of month)
                    calendar.add(Calendar.MONTH, interval)
                }
                calendar.timeInMillis
            }
            
            TYPE_YEARLY -> {
                calendar.add(Calendar.YEAR, 1)
                calendar.timeInMillis
            }
            
            TYPE_CUSTOM -> {
                calendar.add(Calendar.DAY_OF_YEAR, interval)
                calendar.timeInMillis
            }
            
            else -> 0L // TYPE_ONCE - no rescheduling
        }
    }
    
    fun shouldReschedule(recurrenceType: String): Boolean {
        return recurrenceType != TYPE_ONCE
    }
    
    fun parseRecurrencePattern(pattern: String): Map<String, Any> {
        return try {
            val json = JSONObject(pattern)
            val result = mutableMapOf<String, Any>()
            
            if (json.has("daysOfWeek")) {
                val daysArray = json.getJSONArray("daysOfWeek")
                val daysList = mutableListOf<Int>()
                for (i in 0 until daysArray.length()) {
                    daysList.add(daysArray.getInt(i))
                }
                result["daysOfWeek"] = daysList.toTypedArray()
            }
            
            if (json.has("dayOfMonth")) {
                result["dayOfMonth"] = json.getInt("dayOfMonth")
            }
            
            if (json.has("interval")) {
                result["interval"] = json.getInt("interval")
            }
            
            result
        } catch (e: Exception) {
            emptyMap()
        }
    }
    
    fun validateRecurrencePattern(recurrenceType: String, pattern: String): Boolean {
        return when (recurrenceType) {
            TYPE_WEEKLY -> {
                val patternMap = parseRecurrencePattern(pattern)
                val daysOfWeek = (patternMap["daysOfWeek"] as? Array<*>)?.filterIsInstance<Int>() ?: emptyList()
                daysOfWeek.isNotEmpty() && daysOfWeek.all { it in 0..6 }
            }
            TYPE_MONTHLY -> {
                val patternMap = parseRecurrencePattern(pattern)
                val dayOfMonth = patternMap["dayOfMonth"] as? Int ?: 0
                dayOfMonth in 1..31
            }
            TYPE_CUSTOM -> {
                val patternMap = parseRecurrencePattern(pattern)
                val interval = patternMap["interval"] as? Int ?: 0
                interval > 0
            }
            else -> true
        }
    }
}