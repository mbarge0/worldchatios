import Foundation
import FirebaseAuth

struct AISuggestion: Hashable {
    let original: String
    let translated: String
}

enum AITone: String {
    case casual
    case neutral
    case formal
}

final class AIService {
    private let queue = DispatchQueue(label: "ai.service.queue", qos: .userInitiated)

    // Functions base URL is read from Info.plist (key: FunctionsBaseURL). If absent, use mocks.
    private let functionsBaseURL: String? = Bundle.main.infoDictionary?["FunctionsBaseURL"] as? String
    private var useMocks: Bool { (functionsBaseURL ?? "").isEmpty }

    private func postJSON<T: Encodable>(path: String, body: T, timeout: TimeInterval = 10.0, completion: @escaping (Result<Data, Error>) -> Void) {
        guard let base = functionsBaseURL, let url = URL(string: base + path) else {
            completion(.failure(NSError(domain: "AIService", code: -2, userInfo: [NSLocalizedDescriptionKey: "FunctionsBaseURL not configured"]))); return
        }
        Auth.auth().currentUser?.getIDToken(completion: { token, tokenErr in
            if let tokenErr = tokenErr { completion(.failure(tokenErr)); return }
            var req = URLRequest(url: url)
            req.httpMethod = "POST"
            req.timeoutInterval = timeout
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")
            if let token = token { req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }
            do { req.httpBody = try JSONEncoder().encode(body) } catch { completion(.failure(error)); return }
            URLSession.shared.dataTask(with: req) { data, resp, err in
                if let err = err { completion(.failure(err)); return }
                guard let http = resp as? HTTPURLResponse else {
                    completion(.failure(NSError(domain: "AIServiceHTTP", code: -1, userInfo: [NSLocalizedDescriptionKey: "No response"]))); return
                }
                if !(200..<300).contains(http.statusCode) {
                    let message: String
                    if let data = data, let text = String(data: data, encoding: .utf8) { message = text } else { message = "HTTP \(http.statusCode)" }
                    completion(.failure(NSError(domain: "AIServiceHTTP", code: http.statusCode, userInfo: [NSLocalizedDescriptionKey: message])))
                    return
                }
                guard let data = data else {
                    completion(.failure(NSError(domain: "AIServiceHTTP", code: -2, userInfo: [NSLocalizedDescriptionKey: "Empty body"]))); return
                }
                completion(.success(data))
            }.resume()
        })
    }

    func askAI(conversationId: String, question: String, lastN: Int = 20, completion: @escaping (Result<String, Error>) -> Void) {
        if useMocks {
            queue.asyncAfter(deadline: .now() + 0.8) {
                completion(.success("‘Stai’ is the informal ‘you are’ (from ‘stare’). Used in ‘come stai?’ = ‘how are you?’"))
            }
            return
        }
        struct Payload: Encodable { let conversationId: String; let question: String; let lastN: Int }
        postJSON(path: "/askAI", body: Payload(conversationId: conversationId, question: question, lastN: lastN)) { result in
            switch result {
            case .failure(let e): completion(.failure(e))
            case .success(let data):
                do {
                    if let dict = try JSONSerialization.jsonObject(with: data) as? [String: Any], let answer = dict["answer"] as? String {
                        completion(.success(answer))
                    } else { completion(.failure(NSError(domain: "AIService", code: -4, userInfo: [NSLocalizedDescriptionKey: "Parse error"]))) }
                } catch { completion(.failure(error)) }
            }
        }
    }

    func generateSmartReplies(conversationId: String, tone: AITone = .neutral, lastN: Int = 10, completion: @escaping (Result<[AISuggestion], Error>) -> Void) {
        if useMocks {
            queue.asyncAfter(deadline: .now() + 0.5) {
                switch tone {
                case .casual:
                    completion(.success([
                        AISuggestion(original: "Yeah, what time?", translated: "Sì, a che ora?"),
                        AISuggestion(original: "I'd love to!", translated: "Mi piacerebbe!"),
                        AISuggestion(original: "Can't tonight", translated: "Non posso stasera")
                    ]))
                case .neutral:
                    completion(.success([
                        AISuggestion(original: "Yes, what time?", translated: "Sì, che ora?"),
                        AISuggestion(original: "I'd love to", translated: "Mi piacerebbe"),
                        AISuggestion(original: "I can't tonight", translated: "Non posso stasera")
                    ]))
                case .formal:
                    completion(.success([
                        AISuggestion(original: "Yes, what time would suit you?", translated: "Sì, a quale orario Le farebbe comodo?"),
                        AISuggestion(original: "I would be delighted", translated: "Ne sarei lieto/a"),
                        AISuggestion(original: "I am unavailable this evening", translated: "Stasera non sono disponibile")
                    ]))
                }
            }
            return
        }
        struct Payload: Encodable { let conversationId: String; let tone: String; let lastN: Int }
        postJSON(path: "/generateSmartReplies", body: Payload(conversationId: conversationId, tone: tone.rawValue, lastN: lastN)) { result in
            switch result {
            case .failure(let e): completion(.failure(e))
            case .success(let data):
                do {
                    if let dict = try JSONSerialization.jsonObject(with: data) as? [String: Any], let arr = dict["suggestions"] as? [[String: Any]] {
                        let mapped = arr.compactMap { item -> AISuggestion? in
                            guard let o = item["original"] as? String, let t = item["translated"] as? String else { return nil }
                            return AISuggestion(original: o, translated: t)
                        }
                        completion(.success(mapped))
                    } else { completion(.failure(NSError(domain: "AIService", code: -4, userInfo: [NSLocalizedDescriptionKey: "Parse error"]))) }
                } catch { completion(.failure(error)) }
            }
        }
    }
}


