//
//  WomensQuransWidget.swift
//  Women's Quran App Widget
//
//  Created for Women's Quran App
//

import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> WidgetEntry {
        WidgetEntry(date: Date(), nextPrayer: "Dhuhr", nextPrayerTime: "12:30 PM", quranMinutes: 5, quranGoal: 10)
    }

    func getSnapshot(in context: Context, completion: @escaping (WidgetEntry) -> ()) {
        let entry = WidgetEntry(date: Date(), nextPrayer: "Asr", nextPrayerTime: "3:45 PM", quranMinutes: 7, quranGoal: 10)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        // Fetch data from UserDefaults (shared between app and widget)
        let sharedDefaults = UserDefaults(suiteName: "group.com.womensquran.app")

        let nextPrayer = sharedDefaults?.string(forKey: "nextPrayer") ?? "Maghrib"
        let nextPrayerTime = sharedDefaults?.string(forKey: "nextPrayerTime") ?? "6:30 PM"
        let quranMinutes = sharedDefaults?.integer(forKey: "quranMinutesToday") ?? 0
        let quranGoal = sharedDefaults?.integer(forKey: "quranGoal") ?? 10

        let entry = WidgetEntry(
            date: Date(),
            nextPrayer: nextPrayer,
            nextPrayerTime: nextPrayerTime,
            quranMinutes: quranMinutes,
            quranGoal: quranGoal
        )

        // Refresh every 15 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))

        completion(timeline)
    }
}

struct WidgetEntry: TimelineEntry {
    let date: Date
    let nextPrayer: String
    let nextPrayerTime: String
    let quranMinutes: Int
    let quranGoal: Int
}

struct WomensQuransWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        default:
            SmallWidgetView(entry: entry)
        }
    }
}

// MARK: - Small Widget (Prayer Time)
struct SmallWidgetView: View {
    let entry: WidgetEntry

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.98, green: 0.91, blue: 0.93),
                    Color(red: 0.97, green: 0.77, blue: 0.82)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(spacing: 8) {
                // App Icon
                Image(systemName: "moon.stars.fill")
                    .font(.system(size: 24))
                    .foregroundColor(Color(red: 0.82, green: 0.38, blue: 0.55))

                // Next Prayer
                Text(entry.nextPrayer)
                    .font(.system(size: 18, weight: .semibold, design: .serif))
                    .foregroundColor(Color(red: 0.3, green: 0.3, blue: 0.3))

                // Prayer Time
                Text(entry.nextPrayerTime)
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(Color(red: 0.82, green: 0.38, blue: 0.55))

                // Label
                Text("Next Prayer")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(Color.gray.opacity(0.7))
                    .textCase(.uppercase)
                    .tracking(1)
            }
            .padding()
        }
    }
}

// MARK: - Medium Widget (Prayer + Quran Progress)
struct MediumWidgetView: View {
    let entry: WidgetEntry

    var progress: Double {
        return min(1.0, Double(entry.quranMinutes) / Double(entry.quranGoal))
    }

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.98, green: 0.91, blue: 0.93),
                    Color(red: 0.97, green: 0.77, blue: 0.82)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            HStack(spacing: 16) {
                // Prayer Time Section
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Image(systemName: "moon.stars.fill")
                            .font(.system(size: 16))
                            .foregroundColor(Color(red: 0.82, green: 0.38, blue: 0.55))
                        Text("NEXT PRAYER")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(Color.gray.opacity(0.7))
                            .tracking(1)
                    }

                    Spacer().frame(height: 4)

                    Text(entry.nextPrayer)
                        .font(.system(size: 16, weight: .semibold, design: .serif))
                        .foregroundColor(Color(red: 0.3, green: 0.3, blue: 0.3))

                    Text(entry.nextPrayerTime)
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(Color(red: 0.82, green: 0.38, blue: 0.55))
                }

                Divider()
                    .background(Color.white.opacity(0.5))

                // Quran Progress Section
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Image(systemName: "book.fill")
                            .font(.system(size: 16))
                            .foregroundColor(Color(red: 0.82, green: 0.38, blue: 0.55))
                        Text("QURAN TODAY")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(Color.gray.opacity(0.7))
                            .tracking(1)
                    }

                    Spacer().frame(height: 4)

                    HStack(alignment: .firstTextBaseline, spacing: 2) {
                        Text("\(entry.quranMinutes)")
                            .font(.system(size: 20, weight: .bold))
                            .foregroundColor(Color(red: 0.82, green: 0.38, blue: 0.55))
                        Text("/")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(Color.gray)
                        Text("\(entry.quranGoal) min")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(Color.gray)
                    }

                    // Progress bar
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.white.opacity(0.3))
                            .frame(height: 6)

                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color(red: 0.82, green: 0.38, blue: 0.55))
                            .frame(width: 80 * progress, height: 6)
                    }
                    .frame(width: 80)
                }
            }
            .padding()
        }
    }
}

@main
struct WomensQuransWidget: Widget {
    let kind: String = "WomensQuransWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            WomensQuransWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Women's Quran")
        .description("See your next prayer time and Quran reading progress.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct WomensQuransWidget_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            WomensQuransWidgetEntryView(entry: WidgetEntry(
                date: Date(),
                nextPrayer: "Maghrib",
                nextPrayerTime: "6:30 PM",
                quranMinutes: 7,
                quranGoal: 10
            ))
            .previewContext(WidgetPreviewContext(family: .systemSmall))

            WomensQuransWidgetEntryView(entry: WidgetEntry(
                date: Date(),
                nextPrayer: "Isha",
                nextPrayerTime: "8:15 PM",
                quranMinutes: 12,
                quranGoal: 10
            ))
            .previewContext(WidgetPreviewContext(family: .systemMedium))
        }
    }
}
