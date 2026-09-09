import Foundation

/// Response model matching the NestJS backend API.
struct SolarStatus: Codable {
    let timestamp: String
    let battery: BatteryStatus
    let solar: SolarInfo
    let weather: WeatherInfo?
}

extension SolarStatus {
    struct BatteryStatus: Codable {
        /// State of charge: 0–100.
        let soc: Double
        /// Power in watts. Positive = charging, negative = discharging.
        let power: Double
        /// Estimated hours until full / empty (depending on direction).
        let estimatedHours: Double?
    }

    struct SolarInfo: Codable {
        /// Current PV production in kW.
        let production: Double
        /// Current household consumption in kW.
        let consumption: Double
        /// Today's total yield in kWh.
        let dailyYield: Double?
    }

    struct WeatherInfo: Codable {
        let temperature: Double
        let cloudCover: Double
        let condition: String
    }
}
