import Foundation

extension Date {
    /// Human-friendly relative string: "just now", "2 min ago", "1 hr ago".
    var relativeString: String {
        let diff = Date().timeIntervalSince(self)
        if diff < 1 { return "just now" }
        if diff < 60 { return "\(Int(diff))s ago" }
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: self, relativeTo: Date())
    }
}

extension Optional where Wrapped == Date {
    /// Safe display wrapper — returns "Never" when no fetch has succeeded yet.
    var displayString: String {
        guard let self else { return "Never" }
        return self.relativeString
    }
}
