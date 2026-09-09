import Foundation
import Combine
import SwiftUI

/// Central data model driving the menu bar label and popover.
@MainActor
final class SolarDataModel: ObservableObject {
    // MARK: - Published State

    @Published var batterySOC: Double = 0
    @Published var batteryPower: Double = 0
    @Published var production: Double = 0
    @Published var consumption: Double = 0
    @Published var dailyYield: Double?
    @Published var weather: SolarStatus.WeatherInfo?
    @Published var lastUpdated: Date?
    @Published var isLoading = false
    @Published var errorMessage: String?

    // MARK: - Config

    /// Re-fetch interval in seconds. Updated from Settings.
    @AppStorage("refreshInterval") var refreshIntervalSeconds: Double = 300

    // MARK: - Private

    private let apiClient = SolarAPIClient()
    private var refreshTimer: Timer?

    // MARK: - Init

    init() {
        // Start fetching immediately on app launch
        Task { @MainActor in
            self.startAutoRefresh()
        }
    }

    // MARK: - Public API

    /// Kick off automatic polling. Call once from the app entry point.
    func startAutoRefresh() {
        scheduleTimer()
        Task { await fetchData() }
    }

    /// Immediate user-triggered refresh.
    func manualRefresh() {
        Task { await fetchData() }
    }

    /// Core network call. Applies results to @Published properties.
    func fetchData() async {
        isLoading = true
        errorMessage = nil

        do {
            let status = try await apiClient.fetchStatus()

            if let inverter = status.growatt.inverterData {
                batterySOC = inverter.batterySoc
                batteryPower = inverter.batteryPower
                production = inverter.pvPower / 1000.0  // Convert W to kW
                consumption = inverter.loadPower / 1000.0  // Convert W to kW
                dailyYield = inverter.dailyYield
            }

            weather = status.weather
            lastUpdated = Date()
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    /// Restart the auto-refresh timer (e.g. after the user changes the interval).
    func restartTimer() {
        refreshTimer?.invalidate()
        scheduleTimer()
    }

    // MARK: - Private Helpers

    private func scheduleTimer() {
        refreshTimer?.invalidate()
        refreshTimer = Timer.scheduledTimer(withTimeInterval: refreshIntervalSeconds, repeats: true) { [weak self] _ in
            Task { @MainActor [weak self] in
                await self?.fetchData()
            }
        }
    }
}
