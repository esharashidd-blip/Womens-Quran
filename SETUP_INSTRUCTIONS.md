# iOS Setup Instructions

## 1. Background Audio Setup

### Step 1: Enable Background Audio Capability
1. Open Xcode project
2. Select the **WomensQurans** target
3. Go to **Signing & Capabilities** tab
4. Click **+ Capability**
5. Add **Background Modes**
6. Check **Audio, AirPlay, and Picture in Picture**

### Step 2: Update Info.plist
Add these keys to your `Info.plist`:

```xml
<key>UIBackgroundModes</key>
<array>
    <string>audio</string>
</array>
```

### Step 3: Add New Files to Xcode
The following files have been created and need to be added to your Xcode project:
- `AudioSessionManager.swift`
- `AudioBridge.swift`

**How to add:**
1. In Xcode, right-click on the **WomensQurans** folder
2. Select **Add Files to "WomensQurans"...**
3. Navigate to and select both files
4. Make sure **Copy items if needed** is checked
5. Click **Add**

### Step 4: Update WebView.swift
The `WebView.swift` file has been automatically updated with audio bridge integration.

---

## 2. iOS Widget Setup

### Step 1: Create Widget Extension
1. In Xcode, go to **File > New > Target**
2. Choose **Widget Extension**
3. Name it: **WomensQuransWidget**
4. Language: **Swift**
5. **Don't** include configuration intent
6. Click **Finish**
7. Click **Activate** when prompted

### Step 2: Add the Widget Code
1. Delete the default `WomensQuransWidget.swift` file that Xcode created
2. Add the new `WomensQuransWidget.swift` file from:
   `/Users/esharashid/Desktop/Womens/WomensQurans/WomensQuransWidget/WomensQuransWidget.swift`

### Step 3: Configure App Groups
Both the main app and widget need to share data via App Groups:

**For Main App:**
1. Select **WomensQurans** target
2. Go to **Signing & Capabilities**
3. Click **+ Capability**
4. Add **App Groups**
5. Click **+** and add: `group.com.womensquran.app`

**For Widget:**
1. Select **WomensQuransWidget** target
2. Go to **Signing & Capabilities**
3. Click **+ Capability**
4. Add **App Groups**
5. Click **+** and add: `group.com.womensquran.app` (same as above)

### Step 4: Share Data from Web App
To make the widget show live data, you need to save data to UserDefaults from the web app.

Add this to your JavaScript (in the main app):

```javascript
// Save prayer times for widget
function updateWidgetData(nextPrayer, nextPrayerTime, quranMinutes, quranGoal) {
  if (window.webkit?.messageHandlers?.updateWidgetData) {
    window.webkit.messageHandlers.updateWidgetData.postMessage({
      nextPrayer: nextPrayer,
      nextPrayerTime: nextPrayerTime,
      quranMinutesToday: quranMinutes,
      quranGoal: quranGoal
    });
  }
}
```

And add this Swift code to `WebView.swift`:

```swift
// In the message handler section:
else if message.name == "updateWidgetData" {
    handleUpdateWidgetData(message: message)
}

// Add this method to Coordinator class:
private func handleUpdateWidgetData(message: WKScriptMessage) {
    guard let body = message.body as? [String: Any],
          let sharedDefaults = UserDefaults(suiteName: "group.com.womensquran.app") else {
        return
    }

    if let nextPrayer = body["nextPrayer"] as? String {
        sharedDefaults.set(nextPrayer, forKey: "nextPrayer")
    }
    if let nextPrayerTime = body["nextPrayerTime"] as? String {
        sharedDefaults.set(nextPrayerTime, forKey: "nextPrayerTime")
    }
    if let quranMinutes = body["quranMinutesToday"] as? Int {
        sharedDefaults.set(quranMinutes, forKey: "quranMinutesToday")
    }
    if let quranGoal = body["quranGoal"] as? Int {
        sharedDefaults.set(quranGoal, forKey: "quranGoal")
    }

    // Reload widget
    WidgetCenter.shared.reloadAllTimelines()
}
```

---

## 3. Testing

### Background Audio:
1. Build and run the app
2. Play Quran recitation
3. Press home button or lock device
4. Audio should continue playing
5. Swipe down from top-right (or up from bottom on older devices) to see Control Center
6. You should see audio controls with Surah information

### Widget:
1. Build and run the app
2. Go to home screen
3. Long press on empty space
4. Tap **+** button in top-left
5. Search for **Women's Quran**
6. Choose small or medium widget
7. Tap **Add Widget**
8. Widget should show prayer times and Quran progress

---

## 4. Troubleshooting

### Background Audio Not Working:
- Verify **Background Modes** capability is enabled
- Check Info.plist has `UIBackgroundModes` with `audio`
- Make sure AudioSessionManager is properly initialized
- Check console logs for audio session errors

### Widget Not Showing Data:
- Verify App Groups are configured with the **exact same** group ID
- Check that `UserDefaults(suiteName:)` is using correct group name
- Make sure widget data is being saved from the app
- Try force-quitting and reopening the app

### Build Errors:
- Clean build folder (Cmd+Shift+K)
- Delete derived data
- Restart Xcode
- Make sure all new files are added to the correct target

---

## Need Help?

If you encounter issues:
1. Check Xcode console logs for error messages
2. Verify all capabilities are properly configured
3. Make sure bundle identifiers are correct
4. Confirm code signing is working
