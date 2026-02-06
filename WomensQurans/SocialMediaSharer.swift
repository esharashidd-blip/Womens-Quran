//
//  SocialMediaSharer.swift
//  WomensQurans
//
//  Created for multi-platform social media sharing
//

import UIKit
import Foundation

class SocialMediaSharer {

    /// Open native iOS share sheet with image
    /// - Parameters:
    ///   - imageBase64: Base64 encoded image string
    ///   - text: Optional text to share
    static func shareWithNativeSheet(imageBase64: String, text: String? = nil) {
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

            var itemsToShare: [Any] = [image]
            if let text = text {
                itemsToShare.insert(text, at: 0)
            }

            let activityVC = UIActivityViewController(
                activityItems: itemsToShare,
                applicationActivities: nil
            )

            // For iPad
            if let popoverController = activityVC.popoverPresentationController {
                popoverController.sourceView = rootViewController.view
                popoverController.sourceRect = CGRect(x: rootViewController.view.bounds.midX,
                                                      y: rootViewController.view.bounds.midY,
                                                      width: 0, height: 0)
                popoverController.permittedArrowDirections = []
            }

            rootViewController.present(activityVC, animated: true)
        }
    }

    /// Share content to various social media platforms
    /// - Parameters:
    ///   - platform: Platform identifier ("whatsapp", "imessage", "snapchat")
    ///   - imageBase64: Base64 encoded image string
    ///   - text: Optional text to share
    static func share(platform: String, imageBase64: String, text: String? = nil) {
        switch platform.lowercased() {
        case "whatsapp":
            shareToWhatsApp(imageBase64: imageBase64, text: text)
        case "imessage":
            shareToiMessage(imageBase64: imageBase64, text: text)
        case "snapchat":
            shareToSnapchat(imageBase64: imageBase64)
        default:
            print("Unknown platform: \(platform)")
        }
    }

    // MARK: - WhatsApp Sharing

    private static func shareToWhatsApp(imageBase64: String, text: String?) {
        // Convert base64 to image
        guard let imageData = getImageData(from: imageBase64),
              let image = UIImage(data: imageData) else {
            showAlert(message: "Failed to process image for WhatsApp")
            return
        }

        // Save image to temp file
        let tempDir = FileManager.default.temporaryDirectory
        let fileName = "noor-verse-\(UUID().uuidString).jpg"
        let fileURL = tempDir.appendingPathComponent(fileName)

        guard let jpegData = image.jpegData(compressionQuality: 0.9) else {
            showAlert(message: "Failed to convert image")
            return
        }

        do {
            try jpegData.write(to: fileURL)

            // Check if WhatsApp is installed
            if let whatsappURL = URL(string: "whatsapp://"),
               UIApplication.shared.canOpenURL(whatsappURL) {

                // Use UIDocumentInteractionController to share
                DispatchQueue.main.async {
                    guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                          let rootViewController = windowScene.windows.first?.rootViewController else {
                        return
                    }

                    let documentController = UIDocumentInteractionController(url: fileURL)
                    documentController.uti = "net.whatsapp.image"
                    documentController.presentOpenInMenu(from: .zero, in: rootViewController.view, animated: true)
                }
            } else {
                showAlert(message: "WhatsApp is not installed")
            }
        } catch {
            showAlert(message: "Failed to save image for WhatsApp")
        }
    }

    // MARK: - iMessage Sharing

    private static func shareToiMessage(imageBase64: String, text: String?) {
        guard let imageData = getImageData(from: imageBase64),
              let image = UIImage(data: imageData) else {
            showAlert(message: "Failed to process image for iMessage")
            return
        }

        DispatchQueue.main.async {
            guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                  let rootViewController = windowScene.windows.first?.rootViewController else {
                return
            }

            // Use UIActivityViewController for iMessage
            var itemsToShare: [Any] = [image]
            if let text = text {
                itemsToShare.insert(text, at: 0)
            }

            let activityVC = UIActivityViewController(
                activityItems: itemsToShare,
                applicationActivities: nil
            )

            // Exclude some activities to focus on messaging
            activityVC.excludedActivityTypes = [
                .addToReadingList,
                .assignToContact,
                .print
            ]

            // For iPad
            if let popoverController = activityVC.popoverPresentationController {
                popoverController.sourceView = rootViewController.view
                popoverController.sourceRect = CGRect(x: rootViewController.view.bounds.midX,
                                                      y: rootViewController.view.bounds.midY,
                                                      width: 0, height: 0)
                popoverController.permittedArrowDirections = []
            }

            rootViewController.present(activityVC, animated: true)
        }
    }

    // MARK: - Snapchat Sharing

    private static func shareToSnapchat(imageBase64: String) {
        guard let imageData = getImageData(from: imageBase64),
              let image = UIImage(data: imageData) else {
            showAlert(message: "Failed to process image for Snapchat")
            return
        }

        // Check if Snapchat is installed
        guard let snapchatURL = URL(string: "snapchat://"),
              UIApplication.shared.canOpenURL(snapchatURL) else {
            showAlert(message: "Snapchat is not installed")
            return
        }

        // Save to pasteboard for Snapchat
        UIPasteboard.general.image = image

        // Snapchat URL scheme
        if let snapURL = URL(string: "snapchat://creativeKitSticker") {
            UIApplication.shared.open(snapURL, options: [:]) { success in
                if !success {
                    // Fallback to regular Snapchat URL
                    if let fallbackURL = URL(string: "snapchat://") {
                        UIApplication.shared.open(fallbackURL, options: [:])
                    }
                }
            }
        }
    }

    // MARK: - Helper Methods

    private static func getImageData(from base64String: String) -> Data? {
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
