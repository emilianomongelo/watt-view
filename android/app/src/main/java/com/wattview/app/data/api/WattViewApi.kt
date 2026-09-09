package com.wattview.app.data.api

import retrofit2.http.GET
import retrofit2.http.Query

interface WattViewApi {

    @GET("status")
    suspend fun getStatus(): SolarStatusResponse

    @GET("readings")
    suspend fun getReadings(@Query("limit") limit: Int = 100): List<ReadingDto>

    @GET("readings/latest")
    suspend fun getLatestReading(): ReadingDto
}
