// Background Audio Utilities
// Enables audio playback to continue when app is in background

interface NowPlayingInfo {
  title: string;
  artist: string;
  duration: number;
  currentTime: number;
}

class BackgroundAudioManager {
  private isConfigured = false;
  private isNative = false;

  constructor() {
    // Check if running in native iOS app
    this.isNative = !!(window as any).webkit?.messageHandlers?.configureBackgroundAudio;

    // Listen for native audio control events
    if (this.isNative) {
      window.addEventListener('nativeAudioControl', this.handleNativeControl as EventListener);
    }
  }

  /**
   * Configure background audio session (iOS only)
   */
  configure() {
    if (this.isConfigured) return;

    if (this.isNative) {
      try {
        (window as any).webkit.messageHandlers.configureBackgroundAudio.postMessage({});
        (window as any).webkit.messageHandlers.setupAudioControls.postMessage({});
        this.isConfigured = true;
        console.log('✅ Background audio configured');
      } catch (error) {
        console.error('Failed to configure background audio:', error);
      }
    } else {
      // Web fallback: Use Media Session API
      if ('mediaSession' in navigator) {
        this.isConfigured = true;
        console.log('✅ Media Session API available');
      }
    }
  }

  /**
   * Update Now Playing info in Control Center / Lock Screen
   */
  updateNowPlaying(info: NowPlayingInfo) {
    if (this.isNative) {
      try {
        (window as any).webkit.messageHandlers.updateNowPlaying.postMessage(info);
      } catch (error) {
        console.error('Failed to update now playing:', error);
      }
    } else if ('mediaSession' in navigator) {
      // Web fallback: Use Media Session API
      navigator.mediaSession.metadata = new MediaMetadata({
        title: info.title,
        artist: info.artist,
        album: "Women's Quran App",
      });
    }
  }

  /**
   * Set up media controls handlers
   */
  setHandlers(handlers: {
    onPlay?: () => void;
    onPause?: () => void;
    onNext?: () => void;
    onPrevious?: () => void;
    onSeek?: (time: number) => void;
  }) {
    if (!('mediaSession' in navigator)) return;

    if (handlers.onPlay) {
      navigator.mediaSession.setActionHandler('play', handlers.onPlay);
    }
    if (handlers.onPause) {
      navigator.mediaSession.setActionHandler('pause', handlers.onPause);
    }
    if (handlers.onNext) {
      navigator.mediaSession.setActionHandler('nexttrack', handlers.onNext);
    }
    if (handlers.onPrevious) {
      navigator.mediaSession.setActionHandler('previoustrack', handlers.onPrevious);
    }
    if (handlers.onSeek) {
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          handlers.onSeek!(details.seekTime);
        }
      });
    }
  }

  /**
   * Handle native audio control events from iOS
   */
  private handleNativeControl(event: CustomEvent) {
    const { action } = event.detail;

    // Dispatch custom events that audio components can listen to
    window.dispatchEvent(new CustomEvent('audioControl', { detail: { action } }));
  }

  /**
   * Clear handlers and deactivate
   */
  cleanup() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('seekto', null);
    }
  }
}

// Singleton instance
export const backgroundAudio = new BackgroundAudioManager();
