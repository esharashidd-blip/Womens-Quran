//
//  SocialMediaSharer.swift
//  WomensQurans
//
//  Simple native iOS share sheet for sharing images with preview
//

import UIKit
import Foundation

class SocialMediaSharer {

    /// Open native iOS share sheet with image preview
    /// - Parameter imageBase64: Base64 encoded image string
    static func shareImage(imageBase64: String) {
        guard let imageData = getImageData(from: imageBase64),
              let image = UIImage(data: imageData) else {
            showAlert(message: "Failed to process image")
            return
        }

        // Save image to temporary file for better preview support
        guard let pngData = image.pngData() else {
            showAlert(message: "Failed to convert image")
            return
        }

        let tempDir = FileManager.default.temporaryDirectory
        let fileName = "womens-quran-\(UUID().uuidString).png"
        let fileURL = tempDir.appendingPathComponent(fileName)

        do {
            try pngData.write(to: fileURL)

            DispatchQueue.main.async {
                guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                      let rootViewController = windowScene.windows.first?.rootViewController else {
                    return
                }

                // Share the file URL for better preview support
                let activityVC = UIActivityViewController(
                    activityItems: [fileURL],
                    applicationActivities: nil
                )

                // For iPad support
                if let popoverController = activityVC.popoverPresentationController {
                    popoverController.sourceView = rootViewController.view
                    popoverController.sourceRect = CGRect(
                        x: rootViewController.view.bounds.midX,
                        y: rootViewController.view.bounds.midY,
                        width: 0,
                        height: 0
                    )
                    popoverController.permittedArrowDirections = []
                }

                // Clean up temp file after sharing
                activityVC.completionWithItemsHandler = { _, _, _, _ in
                    try? FileManager.default.removeItem(at: fileURL)
                }

                rootViewController.present(activityVC, animated: true)
            }
        } catch {
            showAlert(message: "Failed to save image for sharing")
        }
    }

    // MARK: - Helper Methods

    private static func getImageData(from base64String: String) -> Data? {
        // Remove data URL prefix if present
        let cleanBase64 = base64String.components(separatedBy: ",").last ?? base64String
        return Data(base64Encoded: cleanBase64, options: .ignoreUnknownCharacters)
    }

    private static func showAlert(message: String) {
        DispatchQueue.main.async {
            guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                  let rootViewController = windowScene.windows.first?.rootViewController else {
                print("Share Error: \(message)")
                return
            }

            let alert = UIAlertController(
                title: "Share",
                message: message,
                preferredStyle: .alert
            )

            alert.addAction(UIAlertAction(title: "OK", style: .default))
            rootViewController.present(alert, animated: true)
        }
    }
}
