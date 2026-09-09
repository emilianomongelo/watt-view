// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "GrowattPlusMenuBar",
    platforms: [
        .macOS(.v13)
    ],
    targets: [
        .executableTarget(
            name: "GrowattPlusMenuBar",
            path: "Sources/GrowattPlusMenuBar",
            exclude: [
                "App/Info.plist"
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]
        )
    ]
)
