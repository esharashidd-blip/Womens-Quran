//
//  WebView.swift
//  WomensQurans
//
//  Created by Esha Rashid on 02/02/2026.
import SwiftUI
import WebKit

struct WebView: UIViewRepresentable {
    let url: URL

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true

        // Enable safe area handling
        if #available(iOS 11.0, *) {
            config.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        }

        // Add JavaScript message handlers for sharing and audio
        let contentController = WKUserContentController()
        contentController.add(context.coordinator, name: "shareToInstagramStories")
        contentController.add(context.coordinator, name: "shareToSocial")
        contentController.add(context.coordinator, name: "shareWithNativeSheet")
        contentController.add(context.coordinator, name: "configureBackgroundAudio")
        contentController.add(context.coordinator, name: "updateNowPlaying")
        contentController.add(context.coordinator, name: "setupAudioControls")
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

        // Enable safe area layout
        if #available(iOS 11.0, *) {
            webView.scrollView.contentInsetAdjustmentBehavior = .never
        }

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

            // Instagram Stories sharing
            if message.name == "shareToInstagramStories" {
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

        // Optional: Handle navigation for external links
        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            decisionHandler(.allow)
        }
    }
}
