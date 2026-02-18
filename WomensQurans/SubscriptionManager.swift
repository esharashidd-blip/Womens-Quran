import Foundation
import RevenueCat

@MainActor
class SubscriptionManager: NSObject, ObservableObject, PurchasesDelegate {
    static let shared = SubscriptionManager()

    static let entitlementID = "premium"
    static let groupID = "21925449"

    @Published var packages: [Package] = []
    @Published var isSubscribed: Bool = false
    @Published var isLoading: Bool = true

    override init() {
        super.init()
        Purchases.shared.delegate = self
        Task {
            await loadOfferings()
            await updateSubscriptionStatus()
        }
    }

    // MARK: - Load Offerings

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

    // MARK: - Purchase

    func purchase(_ package: Package) async throws -> Bool {
        let result = try await Purchases.shared.purchase(package: package)
        if result.userCancelled { return false }
        isSubscribed = result.customerInfo.entitlements[SubscriptionManager.entitlementID]?.isActive == true
        return true
    }

    // MARK: - Restore

    func restore() async {
        do {
            let customerInfo = try await Purchases.shared.restorePurchases()
            isSubscribed = customerInfo.entitlements[SubscriptionManager.entitlementID]?.isActive == true
        } catch {
            print("Failed to restore: \(error)")
        }
    }

    // MARK: - Check Subscription Status

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

    // MARK: - PurchasesDelegate

    nonisolated func purchases(_ purchases: Purchases, receivedUpdated customerInfo: CustomerInfo) {
        Task { @MainActor in
            self.isSubscribed = customerInfo.entitlements[SubscriptionManager.entitlementID]?.isActive == true
        }
    }
}
