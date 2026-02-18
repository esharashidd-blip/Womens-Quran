//
//  WomensQuransApp.swift
//  WomensQurans
//
//  Created by Esha Rashid on 02/02/2026.
//

import SwiftUI
import RevenueCat

@main
struct WomensQuransApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    init() {
        Purchases.configure(withAPIKey: "appl_hfglRDbdxUCAYEwkOiVBKyvmyfP")
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
