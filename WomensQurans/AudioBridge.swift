//
//  AudioBridge.swift
//  WomensQurans
//
//  JavaScript bridge for audio control
//

import Foundation
import WebKit

class AudioBridge: NSObject, WKScriptMessageHandler {

    weak var webView: WKWebView?

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {

        guard let body = message.body as? [String: Any] else { return }

        switch message.name {
        case "configureBackgroundAudio":
            handleConfigureAudio()

        case "updateNowPlaying":
            handleUpdateNowPlaying(body: body)

        case "setupAudioControls":
            handleSetupControls()

        default:
            break
        }
    }

    private func handleConfigureAudio() {
        AudioSessionManager.shared.configureAudioSession()
    }

    private func handleUpdateNowPlaying(body: [String: Any]) {
        guard let title = body["title"] as? String,
              let artist = body["artist"] as? String,
              let duration = body["duration"] as? Double,
              let currentTime = body["currentTime"] as? Double else {
            return
        }

        AudioSessionManager.shared.updateNowPlayingInfo(
            title: title,
            artist: artist,
            duration: duration,
            currentTime: currentTime
        )
    }

    private func handleSetupControls() {
        AudioSessionManager.shared.setupRemoteCommandCenter(
            onPlay: { [weak self] in
                self?.sendMessageToWeb(action: "play")
            },
            onPause: { [weak self] in
                self?.sendMessageToWeb(action: "pause")
            },
            onNext: { [weak self] in
                self?.sendMessageToWeb(action: "next")
            },
            onPrevious: { [weak self] in
                self?.sendMessageToWeb(action: "previous")
            }
        )
    }

    private func sendMessageToWeb(action: String) {
        let script = "window.dispatchEvent(new CustomEvent('nativeAudioControl', { detail: { action: '\(action)' } }));"
        webView?.evaluateJavaScript(script, completionHandler: nil)
    }
}
