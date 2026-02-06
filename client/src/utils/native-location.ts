// Native iOS Location Integration
// Gets user's location from native iOS location services

interface LocationResult {
  latitude: number;
  longitude: number;
}

class NativeLocationManager {
  private isNative = false;
  private listeners: ((location: LocationResult) => void)[] = [];

  constructor() {
    // Check if running in native iOS app
    this.isNative = !!(window as any).webkit?.messageHandlers?.getLocation;

    // Listen for location events from native iOS
    if (this.isNative) {
      window.addEventListener('nativeLocation', this.handleNativeLocation as EventListener);
    }
  }

  /**
   * Request user's location
   * Returns coordinates from iOS location services on iOS,
   * or falls back to browser geolocation API on web
   */
  async requestLocation(): Promise<LocationResult> {
    return new Promise((resolve, reject) => {
      if (this.isNative) {
        // Request from native iOS
        const timeout = setTimeout(() => {
          reject(new Error('Location request timed out'));
        }, 10000);

        this.listeners.push((location) => {
          clearTimeout(timeout);
          resolve(location);
        });

        try {
          (window as any).webkit.messageHandlers.getLocation.postMessage({});
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      } else {
        // Fall back to browser geolocation
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            (error) => {
              reject(error);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000, // 5 minutes
            }
          );
        } else {
          reject(new Error('Geolocation not supported'));
        }
      }
    });
  }

  /**
   * Handle location event from native iOS
   */
  private handleNativeLocation(event: CustomEvent) {
    const { latitude, longitude } = event.detail;

    // Notify all listeners
    this.listeners.forEach(listener => {
      listener({ latitude, longitude });
    });

    // Clear listeners
    this.listeners = [];
  }

  /**
   * Check if running in native iOS app
   */
  isNativeApp(): boolean {
    return this.isNative;
  }
}

// Singleton instance
export const nativeLocation = new NativeLocationManager();
