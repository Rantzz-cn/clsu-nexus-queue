# Push Notifications Setup Guide

## Current Implementation: Local Notifications

We're using **local notifications** which work when:
- ✅ App is in foreground
- ✅ App is in background
- ❌ App is completely closed (for this, you need push notifications)

## How It Works

1. **App requests notification permissions** when it starts
2. **WebSocket events trigger notifications** when queue is called/completed
3. **Notifications appear** even when app is in background

---

## Setup Instructions

### Step 1: Install Dependencies

```bash
cd mobile
npx expo install expo-notifications
```

### Step 2: Test Notifications

1. **Restart Expo** (stop and start again):
   ```bash
   npm start
   ```

2. **When app loads**, it will ask for notification permissions - **Allow it**

3. **Test the flow**:
   - Request a queue on your phone
   - Put app in background (press home button)
   - Call the queue from Counter Dashboard
   - **Notification should appear** even with app in background!

---

## What You'll See

### When Queue is Called:
- **Title**: "Queue Called! 🎉"
- **Message**: "Your queue REG-003 has been called to Counter 1! Please proceed to the counter."
- **Sound**: Notification sound plays
- **Vibration**: Phone vibrates

### When Queue is Completed:
- **Title**: "Thank You! ✅"
- **Message**: "Thank you for waiting! Your service for queue REG-003 has been completed."
- **Sound**: Notification sound plays

---

## For True Push Notifications (App Closed)

To get notifications when app is **completely closed**, you need:

1. **Expo Push Notifications Service** (easier, but requires Expo account)
   - Or use **Firebase Cloud Messaging (FCM)** for Android
   - Or use **Apple Push Notification Service (APNs)** for iOS

2. **Backend integration** to send push notifications via Expo/FCM/APNs

This is more complex and requires:
- Expo account and project setup
- Backend service to send push notifications
- Device token management

**For now, local notifications work great for background notifications!**

---

## Troubleshooting

### Notifications Not Showing?

1. **Check permissions**: Go to phone Settings → Apps → CLSU NEXUS → Notifications → Make sure enabled
2. **Restart app**: Close and reopen the app
3. **Check Expo logs**: Look for permission errors

### Android Specific

- Make sure notification channel is created (handled automatically)
- Check phone's Do Not Disturb settings

### iOS Specific

- Make sure notifications are enabled in Settings
- First time, iOS will ask for permission

---

## Current Status

✅ **Local Notifications**: Working (foreground & background)  
⏳ **Push Notifications**: Not yet implemented (requires additional setup)

Local notifications should work perfectly for your use case!

