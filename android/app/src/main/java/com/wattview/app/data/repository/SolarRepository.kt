package com.wattview.app.data.repository

import com.wattview.app.data.api.ReadingDto
import com.wattview.app.data.api.SolarStatusResponse

interface SolarRepository {
    suspend fun getStatus(): SolarStatusResponse
    suspend fun getReadings(limit: Int = 100): List<ReadingDto>
    suspend fun getLatestReading(): ReadingDto
}
