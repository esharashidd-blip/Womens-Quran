//
//  LocationManager.swift
//  WomensQurans
//
//  Location manager for iOS to get user's coordinates for prayer times
//

import Foundation
import CoreLocation

class LocationManager: NSObject, CLLocationManagerDelegate {
    static let shared = LocationManager()

    private let locationManager = CLLocationManager()
    private var locationCallback: ((Double, Double) -> Void)?

    private override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
    }

    /// Request user's location
    func requestLocation(completion: @escaping (Double, Double) -> Void) {
        self.locationCallback = completion

        // Check authorization status
        let authStatus: CLAuthorizationStatus
        if #available(iOS 14.0, *) {
            authStatus = locationManager.authorizationStatus
        } else {
            authStatus = CLLocationManager.authorizationStatus()
        }

        switch authStatus {
        case .notDetermined:
            // Request permission
            locationManager.requestWhenInUseAuthorization()

        case .restricted, .denied:
            // Permission denied - return default location (Mecca)
            print("⚠️ Location permission denied")
            completion(21.4225, 39.8262) // Mecca coordinates

        case .authorizedWhenInUse, .authorizedAlways:
            // Permission granted - get location
            locationManager.requestLocation()

        @unknown default:
            completion(21.4225, 39.8262) // Default to Mecca
        }
    }

    // MARK: - CLLocationManagerDelegate

    func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        if status == .authorizedWhenInUse || status == .authorizedAlways {
            locationManager.requestLocation()
        } else if status == .denied || status == .restricted {
            // Return default location
            locationCallback?(21.4225, 39.8262)
            locationCallback = nil
        }
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }

        let latitude = location.coordinate.latitude
        let longitude = location.coordinate.longitude

        print("✅ Location obtained: \(latitude), \(longitude)")

        locationCallback?(latitude, longitude)
        locationCallback = nil
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("❌ Location error: \(error.localizedDescription)")

        // Return default location (Mecca) on error
        locationCallback?(21.4225, 39.8262)
        locationCallback = nil
    }
}
