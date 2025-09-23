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
        }
        
        return when (recurrenceType) {
            TYPE_DAILY -> {
                calendar.add(Calendar.DAY_OF_YEAR, interval)
                calendar.timeInMillis
            }
            
            TYPE_WEEKLY -> {
                if (daysOfWeek.isNotEmpty()) {
                    val currentDay = calendar.get(Calendar.DAY_OF_WEEK) - 1
                    val sortedDays = daysOfWeek.sorted()
                    
                    val nextDay = sortedDays.find { it > currentDay } ?: sortedDays.first()
                    val daysToAdd = if (nextDay > currentDay) {
                        nextDay - currentDay
                    } else {
                        7 - currentDay + nextDay
                    }
                    
                    calendar.add(Calendar.DAY_OF_YEAR, daysToAdd)
                } else {
                    calendar.add(Calendar.WEEK_OF_YEAR, interval)
                }
                calendar.timeInMillis
            }
            
            TYPE_MONTHLY -> {
                if (dayOfMonth > 0) {
                    calendar.set(Calendar.DAY_OF_MONTH, dayOfMonth)
                    if (calendar.timeInMillis <= currentTime) {
                        calendar.add(Calendar.MONTH, 1)
                    }
                } else {
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
            
            else -> currentTime // TYPE_ONCE or unknown
        }
    }
    
    fun shouldReschedule(recurrenceType: String): Boolean {
        return recurrenceType != TYPE_ONCE
    }
    
    fun parseRecurrencePattern(pattern: String): Map<String, Any> {
        return try {
            val json = JSONObject(pattern)
            json.keys().asSequence().associate { key ->
                key to json.get(key)
            }
        } catch (e: Exception) {
            emptyMap()
        }
    }
}