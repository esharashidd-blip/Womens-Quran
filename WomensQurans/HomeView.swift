//
//
//  HomeView.swift
//  WomensQurans
//
//  Created by Esha Rashid on 02/02/2026.
//

import SwiftUI

struct HomeView: View {
    @State private var showPaywall = false

    var body: some View {
        WebView(
            url: URL(string: "https://womens-quran-production.up.railway.app")!,
            onShowPaywall: {
                showPaywall = true
            }
        )
        .edgesIgnoringSafeArea(.all)
        .sheet(isPresented: $showPaywall) {
            PaywallView()
        }
    }
}

#Preview {
    HomeView()
}
