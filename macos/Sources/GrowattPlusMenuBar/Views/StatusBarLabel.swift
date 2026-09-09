import SwiftUI

/// The always-visible label in the macOS menu bar.
struct StatusBarLabel: View {
    @ObservedObject var model: SolarDataModel

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: "sun.max.fill")
                .foregroundStyle(.yellow)

            Text("\(Int(model.batterySOC))%")
                .font(.caption)
                .monospacedDigit()

            Text(String(format: "%.1fkW", model.production))
                .font(.caption)
                .monospacedDigit()
        }
    }
}
