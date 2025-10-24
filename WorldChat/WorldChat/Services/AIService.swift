import Foundation
import FirebaseAuth

struct AIResponse: Codable {
    let answer: String
    let latencyMs: Int?
    let cached: Bool?
}

struct SmartReply: Codable, Hashable {
    let original: String
    let translated: String
}

final class AIService {
    private let baseURL: URL?
    private let jsonEncoder = JSONEncoder()
    
    private func fetchIDToken() async -> String? {
        guard let user = Auth.auth().currentUser else { return nil }
        return await withCheckedContinuation { (continuation: CheckedContinuation<String?, Never>) in
            user.getIDToken { token, _ in
                continuation.resume(returning: token)
            }
        }
    }

    init() {
        if let s = Bundle.main.infoDictionary?["FunctionsBaseURL"] as? String, let url = URL(string: s) {
            self.baseURL = url
        } else {
            self.baseURL = nil
        }
    }

    private func post<T: Decodable>(path: String, body: [String: Any]) async throws -> T {
        guard let base = baseURL else {
            throw NSError(domain: "AIService", code: -2, userInfo: [NSLocalizedDescriptionKey: "FunctionsBaseURL not configured"])
        }
        var req = URLRequest(url: base.appendingPathComponent(path.trimmingCharacters(in: CharacterSet(charactersIn: "/"))))
        req.httpMethod = "POST"
        req.timeoutInterval = 12
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token = await fetchIDToken(), !token.isEmpty {
            req.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        req.httpBody = try JSONSerialization.data(withJSONObject: body, options: [])
        let (data, resp) = try await URLSession.shared.data(for: req)
        guard let http = resp as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
            let text = String(data: data, encoding: .utf8) ?? ""
            throw NSError(domain: "AIServiceHTTP", code: (resp as? HTTPURLResponse)?.statusCode ?? -1, userInfo: [NSLocalizedDescriptionKey: text])
        }
        return try JSONDecoder().decode(T.self, from: data)
    }

    func askAI(conversationId: String, question: String) async throws -> AIResponse {
        let body: [String: Any] = [
            "conversationId": conversationId,
            "question": question,
            "lastN": 20
        ]
        return try await post(path: "/askAI", body: body)
    }

    func generateSmartReplies(conversationId: String, tone: String) async throws -> [SmartReply] {
        let body: [String: Any] = [
            "conversationId": conversationId,
            "tone": tone,
            "lastN": 10
        ]
        struct Response: Codable { let suggestions: [SmartReply] }
        let r: Response = try await post(path: "/generateSmartReplies", body: body)
        return r.suggestions
    }
}


