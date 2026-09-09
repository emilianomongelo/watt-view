import SwiftUI

/// Visual battery representation with SOC percentage, icon, and color coding.
struct BatteryIndicator: View {
    let soc: Double
    let power: Double

    /// SF Symbol name that maps to the current SOC range.
    private var batteryIcon: String {
        switch soc {
        case ..<10:  return "battery.0percent"
        case ..<25:  return "battery.25percent"
        case ..<50:  return "battery.50percent"
        case ..<75:  return "battery.75percent"
        default:     return "battery.100percent"
        }
    }

    /// Red < 20%, orange 20–50%, green > 50%.
    private var batteryColor: Color {
        switch soc {
        case ..<20: return .red
        case ..<50: return .orange
        default:    return .green
        }
    }

    /// Charge / discharge indicator text.
    private var powerLabel: String {
        if power > 0 {
            return String(format: "+%.0f W charging", power)
        } else if power < 0 {
            return String(format: "%.0f W discharging", abs(power))
        }
        return "idle"
    }

    var body: some View {
        VStack(spacing: 8) {
            ZStack {
                // Background ring
                Circle()
                    .stroke(Color.gray.opacity(0.2), lineWidth: 8)

                // Progress ring
                Circle()
                    .trim(from: 0, to: soc / 100)
                    .stroke(batteryColor, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                    .animation(.easeInOut(duration: 0.6), value: soc)

                // Center content
                VStack(spacing: 2) {
                    Image(systemName: batteryIcon)
                        .font(.title2)
                        .foregroundStyle(batteryColor)

                    Text("\(Int(soc))%")
                        .font(.system(.title, design: .rounded, weight: .bold))
                        .monospacedDigit()
                }
            }
            .frame(width: 90, height: 90)

            Text(powerLabel)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }
}
