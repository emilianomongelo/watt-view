package com.wattview.app.data.repository

import com.wattview.app.data.api.ReadingDto
import com.wattview.app.data.api.SolarStatusResponse
import com.wattview.app.data.api.WattViewApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SolarRepositoryImpl @Inject constructor(
    private val api: WattViewApi
) : SolarRepository {

    override suspend fun getStatus(): SolarStatusResponse = api.getStatus()

    override suspend fun getReadings(limit: Int): List<ReadingDto> = api.getReadings(limit)

    override suspend fun getLatestReading(): ReadingDto = api.getLatestReading()
}
