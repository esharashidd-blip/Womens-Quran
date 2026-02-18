import SwiftUI
import StoreKit
import RevenueCat

struct PaywallView: View {
    var subscriptionManager = SubscriptionManager.shared
    @Environment(\.dismiss) var dismiss
    @State private var isPurchasing = false
    @State private var selectedPackage: Package?
    @State private var errorMessage: String?

    // App primary: HSL(350, 70%, 60%) ≈ rose pink
    static let accentPink = Color(hue: 350/360, saturation: 0.70, brightness: 0.85)
    static let accentPinkLight = Color(hue: 350/360, saturation: 0.30, brightness: 0.95)
    static let accentPinkDeep = Color(hue: 350/360, saturation: 0.65, brightness: 0.55)

    var body: some View {
        ZStack {
            // Soft pink gradient background
            LinearGradient(
                colors: [
                    Color(red: 0.99, green: 0.94, blue: 0.95),
                    Color(red: 1.0, green: 0.97, blue: 0.97),
                    Color(red: 0.98, green: 0.93, blue: 0.95)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 28) {
                    // Close button
                    HStack {
                        Spacer()
                        Button(action: { dismiss() }) {
                            Image(systemName: "xmark.circle.fill")
                                .font(.title2)
                                .symbolRenderingMode(.hierarchical)
                                .foregroundColor(.gray.opacity(0.4))
                        }
                    }
                    .padding(.top, 12)

                    // Icon and header
                    VStack(spacing: 16) {
                        ZStack {
                            Circle()
                                .fill(
                                    LinearGradient(
                                        colors: [
                                            PaywallView.accentPink.opacity(0.15),
                                            Color.pink.opacity(0.1)
                                        ],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                                .frame(width: 88, height: 88)

                            Image(systemName: "crown.fill")
                                .font(.system(size: 38))
                                .foregroundStyle(
                                    LinearGradient(
                                        colors: [PaywallView.accentPink, .pink.opacity(0.7)],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                        }

                        Text("Women's Quran Premium")
                            .font(.system(size: 26, weight: .bold, design: .serif))
                            .foregroundColor(Color(red: 0.15, green: 0.15, blue: 0.15))

                        Text("Unlock the full experience with\npremium features and personalised content")
                            .font(.subheadline)
                            .foregroundColor(Color(red: 0.4, green: 0.4, blue: 0.4))
                            .multilineTextAlignment(.center)
                            .lineSpacing(4)
                    }

                    // Features
                    VStack(spacing: 0) {
                        PaywallFeatureRow(
                            icon: "sparkles",
                            title: "Personalised For You",
                            description: "Daily content tailored to your interests and journey",
                            isLast: false
                        )
                        PaywallFeatureRow(
                            icon: "message.fill",
                            title: "Islamic Life Coach",
                            description: "Faith-based guidance and spiritual support, anytime",
                            isLast: false
                        )
                        PaywallFeatureRow(
                            icon: "heart.fill",
                            title: "Full Premium Access",
                            description: "Unlock all current and future premium features",
                            isLast: true
                        )
                    }
                    .padding(20)
                    .background(
                        RoundedRectangle(cornerRadius: 24)
                            .fill(.white.opacity(0.85))
                            .shadow(color: Color.pink.opacity(0.06), radius: 20, y: 10)
                    )

                    // Subscription options
                    VStack(spacing: 12) {
                        if subscriptionManager.isLoading {
                            ProgressView()
                                .padding(40)
                        } else if subscriptionManager.packages.isEmpty {
                            if #available(iOS 17.0, *) {
                                SubscriptionStoreView(groupID: SubscriptionManager.groupID)
                                    .subscriptionStoreControlStyle(.prominentPicker)
                                    .onInAppPurchaseCompletion { _, result in
                                        if case .success(.success(_)) = result {
                                            Task {
                                                await subscriptionManager.updateSubscriptionStatus()
                                                dismiss()
                                            }
                                        }
                                    }
                                    .frame(minHeight: 200)
                            }
                        } else {
                            ForEach(subscriptionManager.packages, id: \.identifier) { package in
                                PaywallPackageCard(
                                    package: package,
                                    isSelected: selectedPackage?.identifier == package.identifier
                                ) {
                                    selectedPackage = package
                                }
                            }
                        }
                    }

                    // Subscribe button
                    if let package = selectedPackage {
                        Button(action: {
                            Task { await purchasePackage(package) }
                        }) {
                            HStack(spacing: 8) {
                                if isPurchasing {
                                    ProgressView().tint(.white)
                                } else {
                                    Text("Continue")
                                        .font(.system(size: 17, weight: .semibold))
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .frame(height: 56)
                            .background(
                                LinearGradient(
                                    colors: [
                                        PaywallView.accentPink,
                                        Color(hue: 340/360, saturation: 0.60, brightness: 0.80)
                                    ],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .foregroundColor(.white)
                            .clipShape(RoundedRectangle(cornerRadius: 16))
                            .shadow(color: Color.pink.opacity(0.3), radius: 12, y: 6)
                        }
                        .disabled(isPurchasing)
                    }

                    if let error = errorMessage {
                        Text(error)
                            .font(.caption)
                            .foregroundColor(.red)
                    }

                    // Restore + Legal
                    VStack(spacing: 12) {
                        Button("Restore Purchases") {
                            Task {
                                await subscriptionManager.restore()
                                if subscriptionManager.isSubscribed {
                                    dismiss()
                                }
                            }
                        }
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(PaywallView.accentPink.opacity(0.8))

                        HStack(spacing: 12) {
                            Link("Privacy Policy", destination: URL(string: "https://womens-quran-production.up.railway.app/privacy")!)
                            Text("·").foregroundColor(Color(red: 0.5, green: 0.5, blue: 0.5))
                            Link("Terms of Use", destination: URL(string: "https://womens-quran-production.up.railway.app/terms")!)
                        }
                        .font(.system(size: 11))
                        .foregroundColor(Color(red: 0.5, green: 0.5, blue: 0.5))

                        Text("Payment will be charged to your Apple ID account at confirmation of purchase. Subscription automatically renews unless cancelled at least 24 hours before the end of the current period.")
                            .font(.system(size: 9))
                            .foregroundColor(Color(red: 0.55, green: 0.55, blue: 0.55))
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 8)
                    }
                    .padding(.bottom, 20)
                }
                .padding(.horizontal, 24)
            }
        }
        .onAppear {
            if selectedPackage == nil {
                selectedPackage = subscriptionManager.packages.first
            }
        }
        .onChange(of: subscriptionManager.isSubscribed) { _, isSubscribed in
            if isSubscribed { dismiss() }
        }
        .presentationDetents([.large])
    }

    private func purchasePackage(_ package: Package) async {
        isPurchasing = true
        errorMessage = nil
        do {
            let success = try await subscriptionManager.purchase(package)
            if success { dismiss() }
        } catch {
            errorMessage = "Purchase failed. Please try again."
        }
        isPurchasing = false
    }
}

// MARK: - Feature Row

struct PaywallFeatureRow: View {
    let icon: String
    let title: String
    let description: String
    let isLast: Bool

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 14) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 22))
                    .foregroundColor(PaywallView.accentPink)
                    .frame(width: 28, alignment: .center)

                VStack(alignment: .leading, spacing: 3) {
                    Text(title)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(Color(red: 0.15, green: 0.15, blue: 0.15))
                    Text(description)
                        .font(.system(size: 13))
                        .foregroundColor(Color(red: 0.45, green: 0.45, blue: 0.45))
                        .lineSpacing(2)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.vertical, 14)

            if !isLast {
                Rectangle()
                    .fill(Color.gray.opacity(0.15))
                    .frame(maxWidth: .infinity)
                    .frame(height: 0.5)
            }
        }
    }
}

// MARK: - Package Card

struct PaywallPackageCard: View {
    let package: Package
    let isSelected: Bool
    let onTap: () -> Void

    private var periodLabel: String {
        guard let period = package.storeProduct.subscriptionPeriod else {
            return ""
        }
        switch period.unit {
        case .day: return period.value == 7 ? "per week" : "per day"
        case .week: return "per week"
        case .month: return period.value == 1 ? "per month" : "every \(period.value) months"
        case .year: return "per year"
        @unknown default: return ""
        }
    }

    var body: some View {
        Button(action: onTap) {
            HStack {
                VStack(alignment: .leading, spacing: 3) {
                    Text(package.storeProduct.localizedTitle)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(Color(red: 0.15, green: 0.15, blue: 0.15))
                    Text(package.storeProduct.localizedDescription)
                        .font(.system(size: 12))
                        .foregroundColor(Color(red: 0.45, green: 0.45, blue: 0.45))
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 2) {
                    Text(package.localizedPriceString)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(isSelected ? PaywallView.accentPink : Color(red: 0.15, green: 0.15, blue: 0.15))
                    Text(periodLabel)
                        .font(.system(size: 11))
                        .foregroundColor(Color(red: 0.5, green: 0.5, blue: 0.5))
                }
            }
            .padding(18)
            .frame(maxWidth: .infinity)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(isSelected ? PaywallView.accentPink.opacity(0.06) : .white)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .strokeBorder(
                        isSelected
                            ? AnyShapeStyle(LinearGradient(colors: [PaywallView.accentPink, .pink.opacity(0.5)], startPoint: .leading, endPoint: .trailing))
                            : AnyShapeStyle(Color.gray.opacity(0.15)),
                        lineWidth: 2
                    )
            )
        }
        .buttonStyle(.plain)
    }
}

