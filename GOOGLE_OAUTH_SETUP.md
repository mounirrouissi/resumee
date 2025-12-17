# Google OAuth Setup Guide (Optional)

## Overview
Google Sign-In is **OPTIONAL** for this app. Users can always "Continue as Guest" without any Google configuration.

## Current Status
✅ **App works without Google OAuth** - Users can continue as guest
⚠️ **Google Sign-In disabled** - No client IDs configured

---

## Quick Fix (No Google OAuth)

The app is now configured to work without Google OAuth. Users will see:

**When Google OAuth is NOT configured:**
```
┌─────────────────────────────────┐
│    Resumax              │
│                                 │
│    [Get Started]                │
│                                 │
└─────────────────────────────────┘
```

**When Google OAuth IS configured:**
```
┌─────────────────────────────────┐
│    Resumax              │
│                                 │
│    [Continue with Google]       │
│    Continue as guest            │
│                                 │
└─────────────────────────────────┘
```

---

## How to Enable Google Sign-In (Optional)

If you want to enable Google authentication, follow these steps:

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API** or **Google Identity Services**

### Step 2: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Configure OAuth consent screen if prompted

### Step 3: Create Client IDs for Each Platform

#### For Web:
1. Application type: **Web application**
2. Authorized JavaScript origins: `http://localhost:19006`
3. Authorized redirect URIs: `http://localhost:19006`
4. Copy the **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)

#### For Android:
1. Application type: **Android**
2. Package name: Get from `app.json` → `android.package`
3. SHA-1 certificate fingerprint:
   ```bash
   # For development
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
4. Copy the **Client ID**

#### For iOS:
1. Application type: **iOS**
2. Bundle ID: Get from `app.json` → `ios.bundleIdentifier`
3. Copy the **Client ID**

### Step 4: Update .env File

Add the client IDs to your `.env` file:

```env
# Google OAuth Configuration
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
```

### Step 5: Restart App

```bash
# Stop the app (Ctrl+C)
# Clear cache and restart
npx expo start --clear
```

---

## Current Configuration

### .env File
```env
GEMINI_API_KEY=AIzaSyC7X0ZefoAWtY8eR-fKP0sX3Cbi2XBgwhI
LLM_MODEL=gemini-2.5-flash

# Google OAuth Configuration (Optional)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
```

### LoginScreen Behavior

The app now:
- ✅ Checks if Google OAuth is configured
- ✅ Hides Google button if not configured
- ✅ Shows "Get Started" button instead
- ✅ Falls back to guest mode on any error
- ✅ Never crashes due to missing OAuth config

---

## Testing

### Without Google OAuth (Current):
1. Open app
2. See "Get Started" button
3. Tap button → Continue as guest
4. ✅ App works normally

### With Google OAuth (After setup):
1. Open app
2. See "Continue with Google" button
3. Tap button → Google sign-in flow
4. Sign in with Google account
5. ✅ User authenticated

---

## Troubleshooting

### Error: "webClientId must be defined"
**Cause:** Google OAuth client IDs are missing
**Fix:** Already fixed! App now handles this gracefully

### Google Sign-In Button Not Showing
**Expected:** This is correct if OAuth is not configured
**Users can:** Continue as guest (full functionality)

### Want to Enable Google Sign-In
**Follow:** Steps above to create OAuth credentials
**Add:** Client IDs to `.env` file
**Restart:** App to see Google button

---

## Benefits of Each Approach

### Without Google OAuth (Current):
- ✅ No setup required
- ✅ Works immediately
- ✅ No external dependencies
- ✅ Privacy-friendly (no Google tracking)
- ✅ Simpler for users
- ⚠️ No user accounts
- ⚠️ No cloud sync

### With Google OAuth:
- ✅ User accounts
- ✅ Cloud sync (future feature)
- ✅ Cross-device access
- ✅ Professional appearance
- ⚠️ Requires Google Cloud setup
- ⚠️ More complex configuration
- ⚠️ Google terms apply

---

## Recommendation

**For Development/Testing:**
- ✅ Use guest mode (current setup)
- ✅ No configuration needed
- ✅ Full app functionality

**For Production:**
- Consider adding Google OAuth
- Provides better user experience
- Enables future features (cloud sync, history)

---

## Summary

✅ **Fixed:** App no longer crashes without Google OAuth
✅ **Working:** Guest mode provides full functionality
⚠️ **Optional:** Google Sign-In can be added later

**Current Status:** App is ready to use without any Google configuration!
