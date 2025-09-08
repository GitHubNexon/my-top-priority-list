package com.mypriorities.alarm

data class AlarmItem(
    val requestCode: Int,
    val timestamp: Long,
    val message: String,
    val recurrenceType: String = "ONCE", // ONCE, DAILY, WEEKLY, MONTHLY, CUSTOM
    val recurrencePattern: String = "", // JSON string or custom pattern
    val daysOfWeek: List<Int> = emptyList(), // 0=Sunday, 1=Monday, etc.
    val dayOfMonth: Int = 0,
    val interval: Int = 1, // for custom intervals
    val startDate: Long = 0
)