import Foundation
import UIKit

enum ImageProcessingError: Error {
    case decodeFailed
    case encodeFailed
}

final class ImageProcessingService {
    // Resize to 256x256 and compress to JPEG with target <= 256KB, starting at quality 0.7
    func processAvatar(_ data: Data, targetSize: CGSize = CGSize(width: 256, height: 256), maxBytes: Int = 256 * 1024, initialQuality: CGFloat = 0.7) throws -> Data {
        guard let image = UIImage(data: data) else { throw ImageProcessingError.decodeFailed }
        let resized = resize(image: image, to: targetSize)
        // Try multiple quality levels until under maxBytes
        for q in stride(from: initialQuality, through: 0.3, by: -0.1) {
            if let jpeg = resized.jpegData(compressionQuality: q), jpeg.count <= maxBytes {
                return jpeg
            }
        }
        // Fallback to lowest quality
        guard let fallback = resized.jpegData(compressionQuality: 0.3) else { throw ImageProcessingError.encodeFailed }
        return fallback
    }

    private func resize(image: UIImage, to target: CGSize) -> UIImage {
        let format = UIGraphicsImageRendererFormat.default()
        format.scale = 1
        let renderer = UIGraphicsImageRenderer(size: target, format: format)
        return renderer.image { _ in
            image.draw(in: CGRect(origin: .zero, size: target))
        }
    }
}


