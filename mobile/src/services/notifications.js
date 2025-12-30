import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Notification Service
 * Handles push and local notifications
 */

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 */
export const requestPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push notification permissions!');
      return false;
    }

    // For Android, we need to create a notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Get Expo Push Token (for push notifications - requires Expo account)
 * This is optional, for now we'll use local notifications
 */
export const getPushToken = async () => {
  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-expo-project-id', // You'll need to set this
    });
    return token;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
};

/**
 * Schedule a local notification
 * This works even when app is in background
 */
export const scheduleLocalNotification = async (title, body, data = {}) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: data,
      },
      trigger: null, // null means show immediately
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

/**
 * Show notification for queue called
 */
export const notifyQueueCalled = async (queueNumber, counterNumber, counterName) => {
  await scheduleLocalNotification(
    'Queue Called! 🎉',
    `Your queue ${queueNumber} has been called to Counter ${counterNumber}! Please proceed to ${counterName || 'the counter'}.`,
    {
      type: 'queue_called',
      queueNumber: queueNumber,
      counterNumber: counterNumber,
    }
  );
};

/**
 * Show notification for queue completed
 */
export const notifyQueueCompleted = async (queueNumber) => {
  await scheduleLocalNotification(
    'Thank You! ✅',
    `Thank you for waiting! Your service for queue ${queueNumber} has been completed.`,
    {
      type: 'queue_completed',
      queueNumber: queueNumber,
    }
  );
};

/**
 * Cancel all notifications
 */
export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

/**
 * Get notification listener for handling notification taps
 */
export const addNotificationReceivedListener = (listener) => {
  return Notifications.addNotificationReceivedListener(listener);
};

/**
 * Get notification response listener (when user taps notification)
 */
export const addNotificationResponseReceivedListener = (listener) => {
  return Notifications.addNotificationResponseReceivedListener(listener);
};

