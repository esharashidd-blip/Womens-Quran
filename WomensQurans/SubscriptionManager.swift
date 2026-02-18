import SwiftUI
import RevenueCat

@Observable
@MainActor
class SubscriptionManager {
    static let shared = SubscriptionManager()

    static let entitlementID = "premium"
    static let groupID = "21925449"

    var packages: [Package] = []
    var isSubscribed: Bool = false
    var isLoading: Bool = true

    init() {
        Task {
            await loadOfferings()
            await updateSubscriptionStatus()
        }
    }

    func loadOfferings() async {
        do {
            let offerings = try await Purchases.shared.offerings()
            if let current = offerings.current {
                packages = current.availablePackages
            }
            isLoading = false
        } catch {
            print("Failed to load offerings: \(error)")
            isLoading = false
        }
    }

    func purchase(_ package: Package) async throws -> Bool {
        let result = try await Purchases.shared.purchase(package: package)
        if result.userCancelled { return false }
        isSubscribed = result.customerInfo.entitlements[SubscriptionManager.entitlementID]?.isActive == true
        return true
    }

    func restore() async {
        do {
            let customerInfo = try await Purchases.shared.restorePurchases()
            isSubscribed = customerInfo.entitlements[SubscriptionManager.entitlementID]?.isActive == true
        } catch {
            print("Failed to restore: \(error)")
        }
    }

    func updateSubscriptionStatus() async {
        do {
            let customerInfo = try await Purchases.shared.customerInfo()
            isSubscribed = customerInfo.entitlements[SubscriptionManager.entitlementID]?.isActive == true
            isLoading = false
        } catch {
            print("Failed to get customer info: \(error)")
            isLoading = false
        }
    }
}

