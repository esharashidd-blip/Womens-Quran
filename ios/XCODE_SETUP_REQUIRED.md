# CRITICAL: Xcode Setup Required

## You MUST add these files to your Xcode project for the app to work properly!

### Files That Need to Be Added to Xcode:

1. **LocationManager.swift** - For iOS location services (prayer times & Qibla)
2. **SocialMediaSharer.swift** - For Apple's native share sheet

### How to Add These Files:

1. Open your **WomensQurans.xcodeproj** in Xcode
2. In the left sidebar, right-click on the **WomensQurans** folder (yellow folder icon)
3. Select **"Add Files to 'WomensQurans'..."**
4. Navigate to: `/Users/esharashid/Desktop/Womens/Womens-Quran-Latest/ios/WomensQurans/`
5. Select these 2 files:
   - LocationManager.swift
   - SocialMediaSharer.swift
6. Make sure these options are checked:
   - ✅ **Copy items if needed** (can uncheck if files already in folder)
   - ✅ **Create groups**
   - ✅ **Add to targets: WomensQurans** (main app target)
7. Click **Add**

### Verify the Files Are Added:

After adding, you should see both Swift files in your Xcode project navigator under the WomensQurans folder.

### Build the App:

1. Press **Cmd+Shift+K** to clean build folder
2. Press **Cmd+B** to build
3. Fix any build errors if they appear
4. Run the app on your iPhone (Cmd+R)

---

## What These Files Do:

### LocationManager.swift
- Requests iOS location permissions
- Gets user's GPS coordinates for accurate prayer times
- Provides location for Qibla direction
- Falls back to Mecca coordinates if permission denied

### SocialMediaSharer.swift
- Opens Apple's native iOS share sheet
- Shares verse images to any app (WhatsApp, Instagram, Messages, etc.)
- Users choose where to share using familiar iOS interface
- Simple and clean - just the image, no text

---

## Testing After Setup:

### Test Location:
1. Open the app
2. Go to Qibla direction
3. You should see a location permission prompt
4. Grant permission
5. App should show accurate prayer times and Qibla direction

### Test Sharing:
1. Go to any Quran verse
2. Click the Share icon (next to the heart)
3. Customize the quote card
4. Try the **Share** button
5. iOS share sheet should appear showing:
   - Instagram
   - WhatsApp
   - Messages
   - Mail
   - Save to Photos
   - Copy
   - And more!

### Test Favorites:
1. Click the heart icon on any verse
2. Should say "Saved to Favorites"
3. Go to More > Saved Verses
4. Your saved verse should appear there

---

## If You Still Have Issues:

### Sharing Not Working?
- Make sure you added BOTH Swift files to Xcode
- Clean Build Folder (Cmd+Shift+K)
- Rebuild the app (Cmd+B)
- Check Xcode console for error messages when you try to share

### Location Not Working?
- Make sure Info.plist has location permissions (it does)
- Make sure LocationManager.swift is added to Xcode project
- Check iPhone Settings > Privacy > Location Services > WomensQurans

### Favorites Not Working?
- Run the SQL migration in Supabase (see supabase/migrations/ folder)
- Check Supabase dashboard to ensure user_id column was added to qada table

---

## Quick Checklist:

- [ ] Added LocationManager.swift to Xcode
- [ ] Added SocialMediaSharer.swift to Xcode
- [ ] Both files show in Xcode project navigator
- [ ] Cleaned build folder (Cmd+Shift+K)
- [ ] Rebuilt the app (Cmd+B)
- [ ] Ran on iPhone (Cmd+R)
- [ ] Tested location permission prompt
- [ ] Tested iOS native share sheet
- [ ] Tested saving favorites
- [ ] Ran SQL migration in Supabase for Qada

Once you complete this checklist, everything should work perfectly! 🎉
