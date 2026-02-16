import SwiftUI
import StoreKit

struct PaywallView: View {
    @ObservedObject var subscriptionManager = SubscriptionManager.shared
    @Environment(\.dismiss) var dismiss

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [
                    Color(red: 0.95, green: 0.93, blue: 0.98),
                    Color(red: 0.98, green: 0.96, blue: 0.99),
                    Color(red: 0.95, green: 0.93, blue: 0.98)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 24) {
                    // Close button
                    HStack {
                        Spacer()
                        Button(action: { dismiss() }) {
                            Image(systemName: "xmark.circle.fill")
                                .font(.title2)
                                .foregroundColor(.gray.opacity(0.5))
                        }
                    }
                    .padding(.top, 8)

                    // Header
                    VStack(spacing: 12) {
                        Image(systemName: "moon.stars.fill")
                            .font(.system(size: 48))
                            .foregroundStyle(
                                LinearGradient(
                                    colors: [.purple, .pink.opacity(0.8)],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )

                        Text("Unlock Premium")
                            .font(.system(size: 28, weight: .bold, design: .serif))

                        Text("Get full access to all features designed to strengthen your faith journey")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 20)
                    }

                    // Features list
                    VStack(alignment: .leading, spacing: 16) {
                        FeatureRow(
                            icon: "heart.text.square.fill",
                            title: "Islamic Life Coach",
                            description: "Personalised faith-based guidance and spiritual support"
                        )
                        FeatureRow(
                            icon: "book.closed.fill",
                            title: "Guided Programmes",
                            description: "7-day guided programmes for anxiety, patience, gratitude and more"
                        )
                        FeatureRow(
                            icon: "sparkles",
                            title: "Daily Reflections",
                            description: "Journaling prompts, action steps and emotional check-ins"
                        )
                    }
                    .padding(20)
                    .background(
                        RoundedRectangle(cornerRadius: 20)
                            .fill(.white.opacity(0.8))
                    )

                    // Apple's SubscriptionStoreView - handles all compliance automatically
                    if #available(iOS 17.0, *) {
                        SubscriptionStoreView(groupID: SubscriptionManager.groupID) {
                            // Marketing content shown above the subscription options
                            VStack(spacing: 8) {
                                Text("Noor Premium")
                                    .font(.headline)
                                Text("Unlock Islamic Life Coach & Guided Programmes")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                        .subscriptionStoreControlStyle(.prominentPicker)
                        .storeButton(.visible, for: .restorePurchase)
                        .onInAppPurchaseCompletion { _, result in
                            if case .success(.success(_)) = result {
                                Task {
                                    await subscriptionManager.updateSubscriptionStatus()
                                    dismiss()
                                }
                            }
                        }
                        .frame(minHeight: 300)
                    } else {
                        // Fallback for iOS 16 and below
                        FallbackSubscriptionView(subscriptionManager: subscriptionManager, dismiss: dismiss)
                    }

                    // Legal links
                    HStack(spacing: 16) {
                        Link("Privacy Policy", destination: URL(string: "https://womens-quran-production.up.railway.app/privacy")!)
                        Text("|").foregroundColor(.secondary)
                        Link("Terms of Use", destination: URL(string: "https://womens-quran-production.up.railway.app/terms")!)
                    }
                    .font(.caption2)
                    .foregroundColor(.secondary)
                    .padding(.bottom, 20)
                }
                .padding(.horizontal, 20)
            }
        }
        .onChange(of: subscriptionManager.isSubscribed) { _, isSubscribed in
            if isSubscribed {
                dismiss()
            }
        }
    }
}

// Fallback for iOS < 17
struct FallbackSubscriptionView: View {
    @ObservedObject var subscriptionManager: SubscriptionManager
    var dismiss: DismissAction
    @State private var isPurchasing = false
    @State private var errorMessage: String?
    @State private var selectedProduct: Product?

    var body: some View {
        VStack(spacing: 12) {
            if subscriptionManager.isLoading {
                ProgressView()
                    .padding()
            } else if subscriptionManager.products.isEmpty {
                Text("Unable to load subscription options. Please try again later.")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding()
            } else {
                ForEach(subscriptionManager.products, id: \.id) { product in
                    SubscriptionOption(
                        product: product,
                        isSelected: selectedProduct?.id == product.id,
                        isYearly: product.id == SubscriptionManager.yearlyID
                    ) {
                        selectedProduct = product
                    }
                }

                if let product = selectedProduct {
                    Button(action: {
                        Task { await purchaseProduct(product) }
                    }) {
                        HStack {
                            if isPurchasing {
                                ProgressView().tint(.white)
                            } else {
                                Text("Subscribe Now").font(.headline)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 54)
                        .background(
                            LinearGradient(
                                colors: [.purple, .pink.opacity(0.8)],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .foregroundColor(.white)
                        .cornerRadius(16)
                    }
                    .disabled(isPurchasing)
                }

                if let error = errorMessage {
                    Text(error).font(.caption).foregroundColor(.red)
                }

                Button("Restore Purchases") {
                    Task {
                        await subscriptionManager.restore()
                        if subscriptionManager.isSubscribed {
                            dismiss()
                        }
                    }
                }
                .font(.caption)
                .foregroundColor(.secondary)
            }

            Text("Payment will be charged to your Apple ID account at the confirmation of purchase. Subscription automatically renews unless it is cancelled at least 24 hours before the end of the current period. You can manage and cancel your subscriptions in your App Store account settings.")
                .font(.system(size: 9))
                .foregroundColor(.secondary.opacity(0.7))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 20)
        }
        .onAppear {
            if selectedProduct == nil {
                selectedProduct = subscriptionManager.products.first(where: {
                    $0.id == SubscriptionManager.yearlyID
                }) ?? subscriptionManager.products.first
            }
        }
    }

    private func purchaseProduct(_ product: Product) async {
        isPurchasing = true
        errorMessage = nil
        do {
            let success = try await subscriptionManager.purchase(product)
            if success { dismiss() }
        } catch {
            errorMessage = "Purchase failed. Please try again."
        }
        isPurchasing = false
    }
}

struct FeatureRow: View {
    let icon: String
    let title: String
    let description: String

    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(
                    LinearGradient(
                        colors: [.purple, .pink.opacity(0.8)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 32)

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline.weight(.semibold))
                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }
}

struct SubscriptionOption: View {
    let product: Product
    let isSelected: Bool
    let isYearly: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    HStack {
                        Text(product.displayName)
                            .font(.subheadline.weight(.semibold))
                        if isYearly {
                            Text("BEST VALUE")
                                .font(.system(size: 9, weight: .bold))
                                .foregroundColor(.white)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(
                                    LinearGradient(
                                        colors: [.purple, .pink.opacity(0.8)],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .cornerRadius(4)
                        }
                    }
                    Text(product.description)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                Text(product.displayPrice)
                    .font(.subheadline.weight(.bold))
            }
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: 14)
                    .fill(.white)
                    .overlay(
                        RoundedRectangle(cornerRadius: 14)
                            .stroke(isSelected ? Color.purple : Color.gray.opacity(0.2), lineWidth: isSelected ? 2 : 1)
                    )
            )
        }
        .buttonStyle(.plain)
    }
}
