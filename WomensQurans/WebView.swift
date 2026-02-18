//
//  WebView.swift
//  WomensQurans
//
//  Created by Esha Rashid on 02/02/2026.
import SwiftUI
import WebKit
import CoreLocation

struct WebView: UIViewRepresentable {
    let url: URL
    var onShowPaywall: (() -> Void)?

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true

        // Use persistent data store for localStorage, cookies, and IndexedDB
        config.websiteDataStore = WKWebsiteDataStore.default()

        // Enable JavaScript and storage APIs
        config.defaultWebpagePreferences.allowsContentJavaScript = true
        config.preferences.javaScriptCanOpenWindowsAutomatically = false

        // Enable safe area handling
        if #available(iOS 11.0, *) {
            config.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        }

        // Add JavaScript message handlers
        let contentController = WKUserContentController()
        contentController.add(context.coordinator, name: "shareImage")
        contentController.add(context.coordinator, name: "shareToInstagramStories")
        contentController.add(context.coordinator, name: "shareToSocial")
        contentController.add(context.coordinator, name: "shareWithNativeSheet")
        contentController.add(context.coordinator, name: "configureBackgroundAudio")
        contentController.add(context.coordinator, name: "updateNowPlaying")
        contentController.add(context.coordinator, name: "setupAudioControls")
        contentController.add(context.coordinator, name: "getLocation")
        contentController.add(context.coordinator, name: "checkSubscription")
        contentController.add(context.coordinator, name: "showPaywall")
        contentController.add(context.coordinator, name: "restorePurchases")
        config.userContentController = contentController

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator

        // Set webView reference for audio bridge
        context.coordinator.audioBridge.webView = webView

        // Make background transparent so web content shows through
        webView.isOpaque = false
        webView.backgroundColor = .clear
        webView.scrollView.backgroundColor = .clear

        // Disable bouncing but allow safe area insets to work
        webView.scrollView.bounces = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never

        let request = URLRequest(url: url)
        webView.load(request)
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {
        // Nothing needed here
    }

    // MARK: - Coordinator

    class Coordinator: NSObject, WKScriptMessageHandler, WKNavigationDelegate {
        var parent: WebView
        let audioBridge = AudioBridge()

        init(_ parent: WebView) {
            self.parent = parent
        }

        // Handle messages from JavaScript
        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {

            // Native iOS share sheet (image only)
            if message.name == "shareImage" {
                handleShareImage(message: message)
            }

            // Instagram Stories sharing
            else if message.name == "shareToInstagramStories" {
                handleInstagramShare(message: message)
            }

            // Native iOS share sheet
            else if message.name == "shareWithNativeSheet" {
                handleNativeShare(message: message)
            }

            // General social media sharing
            else if message.name == "shareToSocial" {
                handleSocialShare(message: message)
            }

            // Background audio messages
            else if message.name == "configureBackgroundAudio" ||
                    message.name == "updateNowPlaying" ||
                    message.name == "setupAudioControls" {
                audioBridge.userContentController(userContentController, didReceive: message)
            }

            // Location request
            else if message.name == "getLocation" {
                handleGetLocation(message: message)
            }

            // Subscription messages
            else if message.name == "checkSubscription" {
                print("📱 checkSubscription called from web")
                handleCheckSubscription(message: message)
            }
            else if message.name == "showPaywall" {
                print("📱 showPaywall called from web")
                DispatchQueue.main.async {
                    self.parent.onShowPaywall?()
                }
            }
            else if message.name == "restorePurchases" {
                print("📱 restorePurchases called from web")
                handleRestorePurchases(message: message)
            }
        }

        private func handleShareImage(message: WKScriptMessage) {
            guard let body = message.body as? [String: Any],
                  let base64Image = body["image"] as? String else {
                print("Invalid share data")
                return
            }

            SocialMediaSharer.shareWithNativeSheet(imageBase64: base64Image)
        }

        private func handleInstagramShare(message: WKScriptMessage) {
            guard let body = message.body as? [String: Any],
                  let base64Image = body["image"] as? String,
                  let topColor = body["backgroundTopColor"] as? String,
                  let bottomColor = body["backgroundBottomColor"] as? String else {
                print("Invalid Instagram share data")
                return
            }

            InstagramSharer.shareToStories(
                imageBase64: base64Image,
                topColor: topColor,
                bottomColor: bottomColor
            )
        }

        private func handleNativeShare(message: WKScriptMessage) {
            guard let body = message.body as? [String: Any],
                  let base64Image = body["image"] as? String else {
                print("Invalid native share data")
                return
            }

            SocialMediaSharer.shareWithNativeSheet(
                imageBase64: base64Image,
                text: body["text"] as? String
            )
        }

        private func handleSocialShare(message: WKScriptMessage) {
            guard let body = message.body as? [String: Any],
                  let platform = body["platform"] as? String,
                  let base64Image = body["image"] as? String else {
                print("Invalid social share data")
                return
            }

            SocialMediaSharer.share(
                platform: platform,
                imageBase64: base64Image,
                text: body["text"] as? String
            )
        }

        private func handleGetLocation(message: WKScriptMessage) {
            LocationManager.shared.requestLocation { latitude, longitude in
                guard let webView = message.webView else { return }

                let script = """
                window.dispatchEvent(new CustomEvent('nativeLocation', {
                    detail: {
                        latitude: \(latitude),
                        longitude: \(longitude)
                    }
                }));
                """

                Task { @MainActor in
                    _ = try? await webView.evaluateJavaScript(script)
                }
            }
        }

        private func handleCheckSubscription(message: WKScriptMessage) {
            guard let webView = message.webView else {
                print("📱 checkSubscription: webView is nil!")
                return
            }

            Task { @MainActor in
                await SubscriptionManager.shared.updateSubscriptionStatus()
                let isSubscribed = SubscriptionManager.shared.isSubscribed
                print("📱 checkSubscription result: isSubscribed = \(isSubscribed)")

                let script = """
                window.dispatchEvent(new CustomEvent('nativeSubscriptionStatus', {
                    detail: { isSubscribed: \(isSubscribed) }
                }));
                """
                _ = try? await webView.evaluateJavaScript(script)
            }
        }

        private func handleRestorePurchases(message: WKScriptMessage) {
            guard let webView = message.webView else { return }

            Task { @MainActor in
                await SubscriptionManager.shared.restore()
                let isSubscribed = SubscriptionManager.shared.isSubscribed

                let script = """
                window.dispatchEvent(new CustomEvent('nativeSubscriptionStatus', {
                    detail: { isSubscribed: \(isSubscribed) }
                }));
                """
                _ = try? await webView.evaluateJavaScript(script)
            }
        }

        // Optional: Handle navigation for external links
        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            decisionHandler(.allow)
        }
    }
}
