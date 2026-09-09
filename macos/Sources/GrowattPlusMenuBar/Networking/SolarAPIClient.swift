import Foundation

/// Thin wrapper around URLSession for the Watt View solar backend.
struct SolarAPIClient {
    /// Base URL stored in UserDefaults so the user can change it from Settings.
    var baseURL: URL {
        let raw = UserDefaults.standard.string(forKey: "apiBaseURL")
            ?? "http://209.46.125.190/api/status"
        return URL(string: raw) ?? URL(string: "http://209.46.125.190/api/status")!
    }

    /// API token stored in UserDefaults for Bearer authentication.
    var apiToken: String {
        UserDefaults.standard.string(forKey: "apiToken") ?? ""
    }

    /// Fetch the latest solar status from the backend.
    func fetchStatus() async throws -> SolarStatus {
        var request = URLRequest(url: baseURL)
        request.timeoutInterval = 10
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        if !apiToken.isEmpty {
            request.setValue("Bearer \(apiToken)", forHTTPHeaderField: "Authorization")
        }

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            if httpResponse.statusCode == 401 {
                throw APIError.unauthorized
            }
            throw APIError.httpError(statusCode: httpResponse.statusCode)
        }

        do {
            let decoder = JSONDecoder()
            return try decoder.decode(SolarStatus.self, from: data)
        } catch {
            throw APIError.decodingFailed(error)
        }
    }

    /// Quick connectivity check — returns true if the backend responds 2xx.
    func testConnection() async -> Result<Void, Error> {
        do {
            _ = try await fetchStatus()
            return .success(())
        } catch {
            return .failure(error)
        }
    }
}

// MARK: - Errors

enum APIError: LocalizedError {
    case invalidResponse
    case unauthorized
    case httpError(statusCode: Int)
    case decodingFailed(Error)

    var errorDescription: String? {
        switch self {
        case .invalidResponse:
            return "Invalid response from server."
        case .unauthorized:
            return "Invalid API token. Check your token in Settings."
        case .httpError(let code):
            return "Server returned HTTP \(code)."
        case .decodingFailed(let underlying):
            return "Failed to decode response: \(underlying.localizedDescription)"
        }
    }
}
