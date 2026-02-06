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

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true

        // CRITICAL FIX: Use persistent data store for localStorage, cookies, and IndexedDB
        // This fixes Qada counter resetting and ensures Supabase auth persists correctly
        config.websiteDataStore = WKWebsiteDataStore.default()

        // Enable JavaScript and storage APIs
        config.preferences.javaScriptEnabled = true
        config.preferences.javaScriptCanOpenWindowsAutomatically = false

        // Enable safe area handling
        if #available(iOS 11.0, *) {
            config.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        }

        // Add JavaScript message handlers for sharing, audio, and location
        let contentController = WKUserContentController()
        contentController.add(context.coordinator, name: "shareImage")
        contentController.add(context.coordinator, name: "configureBackgroundAudio")
        contentController.add(context.coordinator, name: "updateNowPlaying")
        contentController.add(context.coordinator, name: "setupAudioControls")
        contentController.add(context.coordinator, name: "getLocation")
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

            // Native iOS share sheet (image only)
            if message.name == "shareImage" {
                handleShareImage(message: message)
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
        }

        private func handleShareImage(message: WKScriptMessage) {
            guard let body = message.body as? [String: Any],
                  let base64Image = body["image"] as? String else {
                print("Invalid share data")
                return
            }

            SocialMediaSharer.shareImage(imageBase64: base64Image)
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

                DispatchQueue.main.async {
                    webView.evaluateJavaScript(script, completionHandler: nil)
                }
            }
        }

        // Optional: Handle navigation for external links
        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            decisionHandler(.allow)
        }
    }
}
