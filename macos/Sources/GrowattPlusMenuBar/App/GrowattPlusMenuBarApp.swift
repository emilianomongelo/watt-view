import SwiftUI

@main
struct GrowattPlusMenuBarApp: App {
    @StateObject private var model = SolarDataModel()

    var body: some Scene {
        MenuBarExtra {
            SolarPopoverView()
                .environmentObject(model)
        } label: {
            StatusBarLabel(model: model)
        }
        .menuBarExtraStyle(.window)
        .defaultSize(width: 340, height: 420)

        Settings {
            SettingsView()
                .environmentObject(model)
        }
    }
}
