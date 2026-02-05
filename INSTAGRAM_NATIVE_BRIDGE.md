# Instagram Stories Native Bridge Implementation

## Overview
To enable direct sharing to Instagram Stories from the iOS app, you need to add a native bridge in your Swift code that the web view can communicate with.

## Required Changes to iOS App

### 1. Add URL Scheme to Info.plist

Add Instagram's URL scheme to your `Info.plist`:

```xml
<key>LSApplicationQueriesSchemes</key>
<array>
    <string>instagram-stories</string>
    <string>instagram</string>
</array>
```

### 2. Add WKScriptMessageHandler

In your ViewController where you initialize the WKWebView:

```swift
import UIKit
import WebKit

class ViewController: UIViewController, WKScriptMessageHandler {
    var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()

        // Configure WKWebView
        let contentController = WKUserContentController()
        contentController.add(self, name: "shareToInstagramStories")

        let config = WKWebViewConfiguration()
        config.userContentController = contentController

        webView = WKWebView(frame: view.bounds, configuration: config)
        view.addSubview(webView)

        // Load your app URL
        if let url = URL(string: "YOUR_APP_URL") {
            webView.load(URLRequest(url: url))
        }
    }

    // Handle messages from JavaScript
    func userContentController(_ userContentController: WKUserContentController,
                              didReceive message: WKScriptMessage) {
        if message.name == "shareToInstagramStories" {
            if let body = message.body as? [String: Any],
               let base64Image = body["image"] as? String,
               let backgroundTopColor = body["backgroundTopColor"] as? String,
               let backgroundBottomColor = body["backgroundBottomColor"] as? String {
                shareToInstagramStories(
                    imageBase64: base64Image,
                    topColor: backgroundTopColor,
                    bottomColor: backgroundBottomColor
                )
            }
        }
    }

    func shareToInstagramStories(imageBase64: String, topColor: String, bottomColor: String) {
        // Check if Instagram is installed
        guard let instagramURL = URL(string: "instagram-stories://share"),
              UIApplication.shared.canOpenURL(instagramURL) else {
            showAlert(message: "Instagram is not installed")
            return
        }

        // Convert base64 to image data
        guard let imageData = Data(base64Encoded: imageBase64.components(separatedBy: ",").last ?? "") else {
            showAlert(message: "Failed to process image")
            return
        }

        // Share to Instagram Stories using Pasteboard
        let pasteboardItems: [[String: Any]] = [
            [
                "com.instagram.sharedSticker.backgroundImage": imageData,
                "com.instagram.sharedSticker.backgroundTopColor": topColor,
                "com.instagram.sharedSticker.backgroundBottomColor": bottomColor
            ]
        ]

        let pasteboardOptions: [UIPasteboard.OptionsKey: Any] = [
            .expirationDate: Date(timeIntervalSinceNow: 60 * 5) // Expires in 5 minutes
        ]

        UIPasteboard.general.setItems(pasteboardItems, options: pasteboardOptions)

        // Open Instagram
        UIApplication.shared.open(instagramURL, options: [:]) { success in
            if !success {
                self.showAlert(message: "Failed to open Instagram")
            }
        }
    }

    func showAlert(message: String) {
        let alert = UIAlertController(title: "Share Failed",
                                     message: message,
                                     preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
}
```

### 3. Alternative: SwiftUI Implementation

If you're using SwiftUI:

```swift
import SwiftUI
import WebKit

struct WebView: UIViewRepresentable {
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    func makeUIView(context: Context) -> WKWebView {
        let contentController = WKUserContentController()
        contentController.add(context.coordinator, name: "shareToInstagramStories")

        let config = WKWebViewConfiguration()
        config.userContentController = contentController

        let webView = WKWebView(frame: .zero, configuration: config)
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        if let url = URL(string: "YOUR_APP_URL") {
            webView.load(URLRequest(url: url))
        }
    }

    class Coordinator: NSObject, WKScriptMessageHandler {
        var parent: WebView

        init(_ parent: WebView) {
            self.parent = parent
        }

        func userContentController(_ userContentController: WKUserContentController,
                                  didReceive message: WKScriptMessage) {
            if message.name == "shareToInstagramStories" {
                if let body = message.body as? [String: Any],
                   let base64Image = body["image"] as? String,
                   let topColor = body["backgroundTopColor"] as? String,
                   let bottomColor = body["backgroundBottomColor"] as? String {
                    InstagramSharer.share(
                        imageBase64: base64Image,
                        topColor: topColor,
                        bottomColor: bottomColor
                    )
                }
            }
        }
    }
}

// Separate helper class for Instagram sharing
class InstagramSharer {
    static func share(imageBase64: String, topColor: String, bottomColor: String) {
        guard let instagramURL = URL(string: "instagram-stories://share"),
              UIApplication.shared.canOpenURL(instagramURL) else {
            return
        }

        guard let imageData = Data(base64Encoded: imageBase64.components(separatedBy: ",").last ?? "") else {
            return
        }

        let pasteboardItems: [[String: Any]] = [
            [
                "com.instagram.sharedSticker.backgroundImage": imageData,
                "com.instagram.sharedSticker.backgroundTopColor": topColor,
                "com.instagram.sharedSticker.backgroundBottomColor": bottomColor
            ]
        ]

        let pasteboardOptions: [UIPasteboard.OptionsKey: Any] = [
            .expirationDate: Date(timeIntervalSinceNow: 60 * 5)
        ]

        UIPasteboard.general.setItems(pasteboardItems, options: pasteboardOptions)
        UIApplication.shared.open(instagramURL, options: [:])
    }
}
```

## How It Works

1. User clicks "Share to Instagram Stories" button in the web app
2. JavaScript calls the native bridge with the image data
3. Swift code receives the message and image data
4. Image is placed on the UIPasteboard with Instagram-specific keys
5. App opens Instagram using the `instagram-stories://share` URL scheme
6. Instagram reads the image from the pasteboard and opens Story editor

## Testing

To test if the bridge is working:

1. Build and run the iOS app
2. Navigate to a Quran verse
3. Click the share icon
4. Choose a theme
5. Click "Share to Instagram Stories"
6. Instagram should open with the image ready to post

## Fallback Behavior

If the native bridge is not available, the web app will:
1. Try to copy the image to clipboard
2. Download the image to camera roll
3. Show instructions to manually upload to Instagram

## References

- [Instagram URL Scheme Documentation](https://developers.facebook.com/docs/instagram/sharing-to-stories)
- [WKWebView Script Message Handlers](https://developer.apple.com/documentation/webkit/wkscriptmessagehandler)
