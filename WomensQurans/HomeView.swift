//
//
//  HomeView.swift
//  WomensQurans
//
//  Created by Esha Rashid on 02/02/2026.
//

import SwiftUI

struct HomeView: View {
    var body: some View {
        WebView(
            url: URL(string: "https://womens-quran-production.up.railway.app")!
        )
        .ignoresSafeArea()
    }
}

#Preview {
    HomeView()
}

