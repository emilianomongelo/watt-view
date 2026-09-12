import SwiftUI

/// Displays production vs. consumption with directional indicators.
struct PowerFlowView: View {
    let production: Double
    let consumption: Double
    let batteryPower: Double
    let dailyYield: Double?

    var body: some View {
        VStack(spacing: 12) {
            HStack(spacing: 24) {
                // Production
                VStack(spacing: 4) {
                    Image(systemName: "sun.max.fill")
                        .font(.title2)
                        .foregroundStyle(.yellow)

                    Text("Solar")
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    Text(String(format: "%.2f kW", production))
                        .font(.system(.body, design: .rounded, weight: .semibold))
                        .monospacedDigit()
                }
                .frame(maxWidth: .infinity)

                Divider()

                // Consumption
                VStack(spacing: 4) {
                    Image(systemName: "bolt.fill")
                        .font(.title2)
                        .foregroundStyle(.orange)

                    Text("Load")
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    Text(String(format: "%.2f kW", consumption))
                        .font(.system(.body, design: .rounded, weight: .semibold))
                        .monospacedDigit()
                }
                .frame(maxWidth: .infinity)

                Divider()

                // Net (production - consumption)
                VStack(spacing: 4) {
                    Image(systemName: production >= consumption ? "arrow.up.circle.fill" : "arrow.down.circle.fill")
                        .font(.title2)
                        .foregroundStyle(production >= consumption ? .green : .red)

                    Text("Net")
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    Text(String(format: "%@%.2f kW",
                                production >= consumption ? "+" : "",
                                production - consumption))
                        .font(.system(.body, design: .rounded, weight: .semibold))
                        .monospacedDigit()
                        .foregroundStyle(production >= consumption ? .green : .red)
                }
                .frame(maxWidth: .infinity)
            }

            // Battery power bar
            HStack {
                Image(systemName: batteryPower < 0 ? "arrow.down.circle.fill" : "arrow.up.circle.fill")
                    .foregroundStyle(batteryPower < 0 ? .green : .yellow)

                Text(batteryPower < 0
                     ? String(format: "Charging battery at %.0f W", abs(batteryPower))
                     : String(format: "Discharging battery at %.0f W", batteryPower))
                    .font(.caption.weight(.medium))
                    .monospacedDigit()
                    .foregroundStyle(batteryPower < 0 ? .green : .yellow)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(
                RoundedRectangle(cornerRadius: 6)
                    .fill((batteryPower < 0 ? Color.green : Color.yellow).opacity(0.1))
            )

            // Daily yield
            if let yield = dailyYield {
                HStack(spacing: 4) {
                    Image(systemName: "chart.bar.fill")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Text(String(format: "Today: %.1f kWh", yield))
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
    }
}
