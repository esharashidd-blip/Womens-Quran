//
//  AudioSessionManager.swift
//  WomensQurans
//
//  Background audio support for Quran recitation
//

import AVFoundation
import MediaPlayer

class AudioSessionManager {

    static let shared = AudioSessionManager()

    private init() {}

    /// Configure audio session for background playback
    func configureAudioSession() {
        do {
            let audioSession = AVAudioSession.sharedInstance()

            // Set category to playback to enable background audio
            try audioSession.setCategory(.playback, mode: .default, options: [])

            // Activate the audio session
            try audioSession.setActive(true)

            print("✅ Audio session configured for background playback")
        } catch {
            print("❌ Failed to configure audio session: \(error)")
        }
    }

    /// Update now playing info for Control Center and Lock Screen
    func updateNowPlayingInfo(title: String, artist: String, duration: Double, currentTime: Double) {
        var nowPlayingInfo = [String: Any]()

        nowPlayingInfo[MPMediaItemPropertyTitle] = title
        nowPlayingInfo[MPMediaItemPropertyArtist] = artist
        nowPlayingInfo[MPMediaItemPropertyPlaybackDuration] = duration
        nowPlayingInfo[MPNowPlayingInfoPropertyElapsedPlaybackTime] = currentTime
        nowPlayingInfo[MPNowPlayingInfoPropertyPlaybackRate] = 1.0

        MPNowPlayingInfoCenter.default().nowPlayingInfo = nowPlayingInfo
    }

    /// Setup remote command center controls (play/pause/skip)
    func setupRemoteCommandCenter(
        onPlay: @escaping () -> Void,
        onPause: @escaping () -> Void,
        onNext: (() -> Void)? = nil,
        onPrevious: (() -> Void)? = nil
    ) {
        let commandCenter = MPRemoteCommandCenter.shared()

        // Play command
        commandCenter.playCommand.isEnabled = true
        commandCenter.playCommand.addTarget { _ in
            onPlay()
            return .success
        }

        // Pause command
        commandCenter.pauseCommand.isEnabled = true
        commandCenter.pauseCommand.addTarget { _ in
            onPause()
            return .success
        }

        // Next track command (optional)
        if let onNext = onNext {
            commandCenter.nextTrackCommand.isEnabled = true
            commandCenter.nextTrackCommand.addTarget { _ in
                onNext()
                return .success
            }
        } else {
            commandCenter.nextTrackCommand.isEnabled = false
        }

        // Previous track command (optional)
        if let onPrevious = onPrevious {
            commandCenter.previousTrackCommand.isEnabled = true
            commandCenter.previousTrackCommand.addTarget { _ in
                onPrevious()
                return .success
            }
        } else {
            commandCenter.previousTrackCommand.isEnabled = false
        }

        print("✅ Remote command center configured")
    }

    /// Deactivate audio session when done
    func deactivateAudioSession() {
        do {
            try AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
            print("✅ Audio session deactivated")
        } catch {
            print("❌ Failed to deactivate audio session: \(error)")
        }
    }
}
