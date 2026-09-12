import SwiftUI

/// Main popover content shown when the user clicks the menu bar icon.
struct SolarPopoverView: View {
    @EnvironmentObject private var model: SolarDataModel
    @State private var showingSettings = false

    var body: some View {
        VStack(spacing: 16) {
            // Header
            header

            Divider()

            if model.isLoading && model.lastUpdated == nil {
                loadingView
            } else if let error = model.errorMessage, model.lastUpdated == nil {
                errorView(error)
            } else {
                // Battery
                BatteryIndicator(soc: model.batterySOC)

                Divider()

                // Power flow
                PowerFlowView(
                    production: model.production,
                    consumption: model.consumption,
                    batteryPower: model.batteryPower,
                    dailyYield: model.dailyYield
                )

                Divider()

                // Weather (if available)
                if let weather = model.weather {
                    weatherView(weather)
                    Divider()
                }

                // Footer
                footer
            }
        }
        .padding(16)
        .frame(width: 340)
    }

    // MARK: - Subviews

    private var header: some View {
        HStack {
            Image(systemName: "sun.max.fill")
                .foregroundStyle(.yellow)
                .font(.title3)

            Text("Watt View")
                .font(.headline)

            Spacer()

            // Settings gear
            Button {
                showingSettings = true
                NSApp.sendAction(Selector(("showSettingsWindow:")), to: nil, from: nil)
            } label: {
                Image(systemName: "gear")
                    .font(.body)
                    .foregroundStyle(.secondary)
            }
            .buttonStyle(.plain)
            .help("Settings")

            // Quit
            Button {
                NSApplication.shared.terminate(nil)
            } label: {
                Image(systemName: "power")
                    .font(.body)
                    .foregroundStyle(.secondary)
            }
            .buttonStyle(.plain)
            .help("Quit")
        }
    }

    private var loadingView: some View {
        VStack(spacing: 12) {
            ProgressView()
                .progressViewStyle(.circular)
            Text("Fetching solar data…")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, minHeight: 200)
    }

    private func errorView(_ message: String) -> some View {
        VStack(spacing: 12) {
            Image(systemName: "wifi.exclamationmark")
                .font(.largeTitle)
                .foregroundStyle(.red)

            Text("Connection Error")
                .font(.headline)

            Text(message)
                .font(.caption)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            Button {
                model.manualRefresh()
            } label: {
                Label("Retry", systemImage: "arrow.clockwise")
            }
            .buttonStyle(.bordered)
        }
        .frame(maxWidth: .infinity, minHeight: 200)
    }

    private func weatherView(_ weather: SolarStatus.WeatherInfo) -> some View {
        HStack(spacing: 12) {
            Image(systemName: weatherIcon(for: weather.weatherCode))
                .font(.title2)
                .foregroundStyle(.cyan)

            VStack(alignment: .leading, spacing: 2) {
                Text(weatherCondition(for: weather.weatherCode))
                    .font(.subheadline.weight(.medium))
                Text(String(format: "%.0f°C", weather.temperature))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                Text("Cloud cover")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(String(format: "%.0f%%", weather.cloudCover))
                    .font(.caption.weight(.medium))
            }
        }
    }

    private var footer: some View {
        HStack {
            Label(model.lastUpdated.displayString, systemImage: "clock")
                .font(.caption)
                .foregroundStyle(.secondary)

            Spacer()

            if model.isLoading {
                ProgressView()
                    .progressViewStyle(.circular)
                    .scaleEffect(0.6)
            } else {
                Button {
                    model.manualRefresh()
                } label: {
                    Image(systemName: "arrow.clockwise")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .buttonStyle(.plain)
                .help("Refresh now")
            }
        }
    }

    // MARK: - Helpers

    private func weatherCondition(for code: Int) -> String {
        switch code {
        case 0: return "Clear"
        case 1, 2, 3: return "Partly Cloudy"
        case 45, 48: return "Foggy"
        case 51...67: return "Drizzle"
        case 71...77: return "Snow"
        case 80...82: return "Rain"
        case 95...99: return "Thunderstorm"
        default: return "Cloudy"
        }
    }

    private func weatherIcon(for code: Int) -> String {
        switch code {
        case 0: return "sun.max.fill"
        case 1, 2, 3: return "cloud.sun.fill"
        case 45, 48: return "cloud.fog.fill"
        case 51...67: return "cloud.drizzle.fill"
        case 71...77: return "cloud.snow.fill"
        case 80...82: return "cloud.rain.fill"
        case 95...99: return "cloud.bolt.fill"
        default: return "cloud.fill"
        }
    }
}
