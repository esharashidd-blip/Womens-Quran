# CRITICAL: Xcode Setup Required

## You MUST add these files to your Xcode project for the app to work properly!

### Files That Need to Be Added to Xcode:

1. **LocationManager.swift** - For iOS location services (prayer times)
2. **InstagramSharer.swift** - For Instagram Stories sharing
3. **SocialMediaSharer.swift** - For WhatsApp, iMessage, Snapchat sharing

### How to Add These Files:

1. Open your **WomensQurans.xcodeproj** in Xcode
2. In the left sidebar, right-click on the **WomensQurans** folder (yellow folder icon)
3. Select **"Add Files to 'WomensQurans'..."**
4. Navigate to: `/Users/esharashid/Desktop/Womens/Womens-Quran-Latest/ios/WomensQurans/`
5. Select these 3 files:
   - LocationManager.swift
   - InstagramSharer.swift
   - SocialMediaSharer.swift
6. Make sure these options are checked:
   - ✅ **Copy items if needed**
   - ✅ **Create groups**
   - ✅ **Add to targets: WomensQurans** (main app target)
7. Click **Add**

### Verify the Files Are Added:

After adding, you should see all three Swift files in your Xcode project navigator under the WomensQurans folder.

### Build the App:

1. Press **Cmd+B** to build
2. Fix any build errors if they appear
3. Run the app on your iPhone (Cmd+R)

---

## What These Files Do:

### LocationManager.swift
- Requests iOS location permissions
- Gets user's GPS coordinates
- Provides accurate location for prayer times
- Falls back to Mecca coordinates if permission denied

### InstagramSharer.swift
- Shares verse images directly to Instagram Stories
- Uses Instagram's native API
- Adds custom background gradients
- Shows alert if Instagram not installed

### SocialMediaSharer.swift
- Opens iOS native share sheet
- Supports WhatsApp, iMessage, Snapchat
- Handles image conversion and sharing
- Manages app URLs and pasteboard

---

## Testing After Setup:

### Test Location:
1. Open the app
2. Go to Qibla direction
3. You should see a location permission prompt
4. Grant permission
5. App should show accurate prayer times for your area

### Test Social Sharing:
1. Go to any Quran verse
2. Click the Share icon (next to the heart)
3. Customize the quote card
4. Try these buttons:
   - **Share to Instagram Stories** - Should open Instagram app
   - **Share** - Should open iOS share sheet
   - **Save to Photos** - Should download to camera roll

### Test Favorites:
1. Click the heart icon on any verse
2. Should say "Saved to Favorites"
3. Go to More > Saved Verses
4. Your saved verse should appear there

---

## If You Still Have Issues:

### Favorites Still Not Working?
- Open Safari on your iPhone
- Go to Settings > Safari > Advanced > Web Inspector
- Connect iPhone to Mac
- Open Safari on Mac > Develop > [Your iPhone] > localhost
- Try clicking heart and check console for errors
- Look for messages like "🔵 Attempting to save favorite" and "❌ Failed"

### Sharing Still Not Working?
- Make sure you added ALL THREE Swift files to Xcode
- Clean Build Folder (Cmd+Shift+K)
- Rebuild the app (Cmd+B)
- Check Xcode console for error messages when you try to share

### Location Not Working?
- Make sure Info.plist has location permissions (it does)
- Make sure LocationManager.swift is added to Xcode project
- Check iPhone Settings > Privacy > Location Services > WomensQurans

---

## Quick Checklist:

- [ ] Added LocationManager.swift to Xcode
- [ ] Added InstagramSharer.swift to Xcode
- [ ] Added SocialMediaSharer.swift to Xcode
- [ ] All files show in Xcode project navigator
- [ ] Rebuilt the app (Cmd+B)
- [ ] Ran on iPhone (Cmd+R)
- [ ] Tested location permission prompt
- [ ] Tested sharing to Instagram
- [ ] Tested iOS share sheet
- [ ] Tested saving favorites

Once you complete this checklist, everything should work perfectly! 🎉
