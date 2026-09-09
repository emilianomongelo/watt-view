import SwiftUI

/// The always-visible label in the macOS menu bar.
struct StatusBarLabel: View {
    @ObservedObject var model: SolarDataModel

    private var hasData: Bool {
        model.lastUpdated != nil
    }

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: "sun.max.fill")
                .foregroundStyle(.yellow)

            if hasData {
                Text("\(Int(model.batterySOC))%")
                    .font(.caption)
                    .monospacedDigit()

                Text(String(format: "%.1fkW", model.production))
                    .font(.caption)
                    .monospacedDigit()
            } else {
                Text("—")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }
}
