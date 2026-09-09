import SwiftUI

/// Settings panel accessible from the gear icon or the app menu.
struct SettingsView: View {
    @EnvironmentObject private var model: SolarDataModel

    @AppStorage("apiBaseURL") private var apiBaseURL = "http://localhost:3000/api/status"
    @AppStorage("refreshInterval") private var refreshIntervalSeconds: Double = 300

    @State private var testResult: TestResult?
    @State private var isTesting = false

    private var refreshIntervalBinding: Binding<Double> {
        Binding(
            get: { refreshIntervalSeconds },
            set: { newValue in
                refreshIntervalSeconds = newValue
                model.refreshIntervalSeconds = newValue
                model.restartTimer()
            }
        )
    }

    var body: some View {
        Form {
            Section("Backend Connection") {
                TextField("API URL", text: $apiBaseURL)
                    .textFieldStyle(.roundedBorder)

                HStack {
                    Button {
                        testConnection()
                    } label: {
                        Label("Test Connection", systemImage: "network")
                    }
                    .disabled(isTesting)

                    if isTesting {
                        ProgressView()
                            .progressViewStyle(.circular)
                            .scaleEffect(0.6)
                    }

                    Spacer()

                    if let result = testResult {
                        switch result {
                        case .success:
                            Label("Connected", systemImage: "checkmark.circle.fill")
                                .foregroundStyle(.green)
                                .font(.caption)
                        case .failure(let error):
                            Label(error.localizedDescription, systemImage: "xmark.circle.fill")
                                .foregroundStyle(.red)
                                .font(.caption)
                                .lineLimit(2)
                        }
                    }
                }
            }

            Section("Refresh") {
                Picker("Interval", selection: refreshIntervalBinding) {
                    Text("1 minute").tag(60.0)
                    Text("5 minutes").tag(300.0)
                    Text("15 minutes").tag(900.0)
                    Text("30 minutes").tag(1800.0)
                }
                .pickerStyle(.segmented)
            }

            Section("About") {
                LabeledContent("Version", value: "0.1.0")
                LabeledContent("Target", value: "macOS 13.0+")

                Button("Reset to Defaults") {
                    apiBaseURL = "http://localhost:3000/api/status"
                    refreshIntervalSeconds = 300
                    model.refreshIntervalSeconds = 300
                    model.restartTimer()
                    testResult = nil
                }
                .foregroundStyle(.red)
            }
        }
        .formStyle(.grouped)
        .frame(width: 420, height: 320)
        .padding()
    }

    // MARK: - Actions

    private func testConnection() {
        isTesting = true
        testResult = nil

        Task {
            let client = SolarAPIClient()
            let result = await client.testConnection()
            isTesting = false
            switch result {
            case .success:
                testResult = .success
            case .failure(let error):
                testResult = .failure(error)
            }
        }
    }

    enum TestResult: Equatable {
        case success
        case failure(Error)

        static func == (lhs: TestResult, rhs: TestResult) -> Bool {
            switch (lhs, rhs) {
            case (.success, .success): return true
            case (.failure, .failure): return true
            default: return false
            }
        }
    }
}
