import SwiftUI

/// Displays production vs. consumption with directional indicators.
struct PowerFlowView: View {
    let production: Double
    let consumption: Double
    let dailyYield: Double?

    /// Net power: positive = surplus, negative = deficit.
    private var netPower: Double {
        production - consumption
    }

    var body: some View {
        VStack(spacing: 12) {
            HStack(spacing: 24) {
                // Production
                VStack(spacing: 4) {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.title2)
                        .foregroundStyle(.green)

                    Text("Production")
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
                    Image(systemName: "arrow.down.circle.fill")
                        .font(.title2)
                        .foregroundStyle(.orange)

                    Text("Consumption")
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    Text(String(format: "%.2f kW", consumption))
                        .font(.system(.body, design: .rounded, weight: .semibold))
                        .monospacedDigit()
                }
                .frame(maxWidth: .infinity)
            }

            // Net power bar
            HStack {
                Image(systemName: netPower >= 0 ? "bolt.fill" : "bolt")
                    .foregroundStyle(netPower >= 0 ? .green : .red)

                Text(netPower >= 0
                     ? String(format: "+%.2f kW surplus", netPower)
                     : String(format: "%.2f kW deficit", netPower))
                    .font(.caption.weight(.medium))
                    .monospacedDigit()
                    .foregroundStyle(netPower >= 0 ? .green : .red)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(
                RoundedRectangle(cornerRadius: 6)
                    .fill((netPower >= 0 ? Color.green : Color.red).opacity(0.1))
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
