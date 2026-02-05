//
//  InstagramSharer.swift
//  WomensQurans
//
//  Created for Instagram Stories sharing functionality
//

import UIKit
import Foundation

class InstagramSharer {

    /// Share an image to Instagram Stories
    /// - Parameters:
    ///   - imageBase64: Base64 encoded image string (data URL format)
    ///   - topColor: Hex color string for background top (e.g., "#FCE4EC")
    ///   - bottomColor: Hex color string for background bottom (e.g., "#F8BBD0")
    /// - Returns: Boolean indicating if Instagram was opened successfully
    @discardableResult
    static func shareToStories(imageBase64: String, topColor: String, bottomColor: String) -> Bool {
        // Check if Instagram is installed
        guard let instagramURL = URL(string: "instagram-stories://share"),
              UIApplication.shared.canOpenURL(instagramURL) else {
            showAlert(message: "Instagram is not installed on this device")
            return false
        }

        // Extract base64 data (remove data:image/png;base64, prefix if present)
        let base64String = imageBase64.components(separatedBy: ",").last ?? imageBase64

        // Convert base64 to image data
        guard let imageData = Data(base64Encoded: base64String, options: .ignoreUnknownCharacters) else {
            showAlert(message: "Failed to process image")
            return false
        }

        // Prepare pasteboard items for Instagram
        let pasteboardItems: [[String: Any]] = [
            [
                "com.instagram.sharedSticker.backgroundImage": imageData,
                "com.instagram.sharedSticker.backgroundTopColor": topColor,
                "com.instagram.sharedSticker.backgroundBottomColor": bottomColor
            ]
        ]

        // Set expiration date (5 minutes from now)
        let pasteboardOptions: [UIPasteboard.OptionsKey: Any] = [
            .expirationDate: Date(timeIntervalSinceNow: 60 * 5)
        ]

        // Set items on pasteboard
        UIPasteboard.general.setItems(pasteboardItems, options: pasteboardOptions)

        // Open Instagram
        UIApplication.shared.open(instagramURL, options: [:]) { success in
            if !success {
                showAlert(message: "Failed to open Instagram")
            }
        }

        return true
    }

    /// Show an alert to the user
    private static func showAlert(message: String) {
        DispatchQueue.main.async {
            guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                  let rootViewController = windowScene.windows.first?.rootViewController else {
                print("Instagram Share Error: \(message)")
                return
            }

            let alert = UIAlertController(
                title: "Share to Instagram",
                message: message,
                preferredStyle: .alert
            )

            alert.addAction(UIAlertAction(title: "OK", style: .default))

            rootViewController.present(alert, animated: true)
        }
    }
}
