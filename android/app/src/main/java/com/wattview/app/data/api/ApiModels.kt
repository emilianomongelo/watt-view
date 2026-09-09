package com.wattview.app.data.api

import kotlinx.serialization.Serializable

@Serializable
data class SolarStatusResponse(
    val timestamp: String,
    val solar: SolarInfo,
    val weather: WeatherInfo? = null,
    val growatt: GrowattInfo,
    val uptime: Int
)

@Serializable
data class SolarInfo(
    val latitude: Double,
    val longitude: Double,
    val date: String,
    val sunrise: String,
    val sunset: String,
    val daylightHours: Double,
    val solarNoon: String
)

@Serializable
data class WeatherInfo(
    val temperature: Double,
    val humidity: Double,
    val windSpeed: Double,
    val windDirection: Double,
    val cloudCover: Double,
    val precipitation: Double,
    val weatherCode: Int,
    val timestamp: String
)

@Serializable
data class GrowattInfo(
    val plantId: String,
    val status: String,
    val inverterData: InverterData? = null
)

@Serializable
data class InverterData(
    val inverterId: String,
    val deviceModel: String,
    val batterySoc: Double,
    val pvPower: Double,
    val batteryPower: Double,
    val loadPower: Double,
    val batteryVoltage: Double,
    val dailyYield: Double,
    val dailyConsumption: Double,
    val totalYield: Double,
    val recordedAt: String
)

@Serializable
data class ReadingDto(
    val id: Int,
    val timestamp: String,
    val pvPower: Double,
    val batteryPower: Double,
    val loadPower: Double,
    val batterySoc: Double,
    val batteryVoltage: Double,
    val dailyYield: Double,
    val dailyConsumption: Double,
    val totalYield: Double,
    val gridPower: Double? = null,
    val temperature: Double? = null
)
