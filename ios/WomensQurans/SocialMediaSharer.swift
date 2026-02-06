//
//  SocialMediaSharer.swift
//  WomensQurans
//
//  Simple native iOS share sheet for sharing images
//

import UIKit
import Foundation

class SocialMediaSharer {

    /// Open native iOS share sheet with image only (no text)
    /// - Parameter imageBase64: Base64 encoded image string
    static func shareImage(imageBase64: String) {
        guard let imageData = getImageData(from: imageBase64),
              let image = UIImage(data: imageData) else {
            showAlert(message: "Failed to process image")
            return
        }

        DispatchQueue.main.async {
            guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                  let rootViewController = windowScene.windows.first?.rootViewController else {
                return
            }

            // Share only the image (no text)
            let activityVC = UIActivityViewController(
                activityItems: [image],
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

            rootViewController.present(activityVC, animated: true)
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
