import Foundation

/// Response model matching the Watt View NestJS backend API.
struct SolarStatus: Codable {
    let timestamp: String
    let solar: SolarInfo
    let weather: WeatherInfo?
    let growatt: GrowattInfo
    let uptime: Int
}

extension SolarStatus {
    struct SolarInfo: Codable {
        let latitude: Double
        let longitude: Double
        let date: String
        let sunrise: String
        let sunset: String
        let daylightHours: Double
        let solarNoon: String
    }

    struct WeatherInfo: Codable {
        let temperature: Double
        let humidity: Double
        let windSpeed: Double
        let windDirection: Double
        let cloudCover: Double
        let precipitation: Double
        let weatherCode: Int
        let timestamp: String
    }

    struct GrowattInfo: Codable {
        let plantId: String
        let status: String
        let inverterData: InverterData?
    }

    struct InverterData: Codable {
        let inverterId: String
        let deviceModel: String
        let datalogSn: String
        let datalogType: String
        let nominalPower: Double
        let batterySoc: Double
        let pvPower: Double
        let batteryPower: Double
        let loadPower: Double
        let batteryVoltage: Double
        let acOutputVoltage: Double
        let gridPower: Double
        let pvVoltage: Double
        let pvCurrent: Double
        let dailyYield: Double
        let dailyConsumption: Double
        let dailyCharge: Double
        let dailyDischarge: Double
        let totalYield: Double
        let totalConsumption: Double
        let totalDischarge: Double
        let recordedAt: String
    }
}
