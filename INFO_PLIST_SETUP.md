# Info.plist Setup for Social Media Sharing

## Adding URL Schemes to Your iOS Project

To enable sharing to Instagram, WhatsApp, and Snapchat, you need to add their URL schemes to your project's Info.plist file.

## Option 1: Through Xcode (Recommended)

1. Open your project in Xcode
2. Select the **WomensQurans** target
3. Go to the **Info** tab
4. Find **LSApplicationQueriesSchemes** (or create it if it doesn't exist)
5. Add the following URL schemes as Array items:

### URL Schemes to Add:

```
instagram
instagram-stories
whatsapp
snapchat
```

## Option 2: Direct XML Editing

If you prefer to edit the Info.plist as XML:

1. Right-click on `Info.plist` in Xcode
2. Select **Open As** → **Source Code**
3. Add this block inside the `<dict>` tag:

```xml
<key>LSApplicationQueriesSchemes</key>
<array>
    <string>instagram</string>
    <string>instagram-stories</string>
    <string>whatsapp</string>
    <string>snapchat</string>
</array>
```

## Complete Info.plist Example

Your Info.plist should look something like this (in XML format):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>$(DEVELOPMENT_LANGUAGE)</string>

    <key>LSApplicationQueriesSchemes</key>
    <array>
        <string>instagram</string>
        <string>instagram-stories</string>
        <string>whatsapp</string>
        <string>snapchat</string>
    </array>

    <!-- Other keys... -->
</dict>
</plist>
```

## What These URL Schemes Do

- **instagram**: Allows checking if Instagram app is installed
- **instagram-stories**: Required for sharing directly to Instagram Stories
- **whatsapp**: Allows sharing images to WhatsApp
- **snapchat**: Allows sharing to Snapchat

## Testing

After adding these URL schemes:

1. Clean build folder: **Product** → **Clean Build Folder** (⇧⌘K)
2. Rebuild the app
3. Run on a physical device (simulators may not have these apps installed)
4. Test sharing to each platform from the Quran verse cards

## Troubleshooting

**Problem**: "This app is not allowed to query for scheme instagram"
- **Solution**: Make sure you added the URL scheme to LSApplicationQueriesSchemes

**Problem**: Share doesn't open the app
- **Solution**: Make sure the app (Instagram/WhatsApp/Snapchat) is actually installed on the device

**Problem**: Changes not taking effect
- **Solution**: Clean build folder and rebuild the app

## Important Notes

- These URL schemes must be declared in your Info.plist for iOS 9.0+
- Without these declarations, `canOpenURL()` will always return false
- This is an iOS security requirement to prevent apps from detecting what other apps are installed
