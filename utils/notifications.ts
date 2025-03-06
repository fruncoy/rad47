import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import { getLikedShows } from './storage';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register for push notifications
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'web') return null;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    try {
      token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PROJECT_ID || '6cb116fb-31f3-4c24-87dd-dcb150f077c4'
      });
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  // Create notification channels for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1E3EA1',
      sound: true,
    });

    await Notifications.setNotificationChannelAsync('upcoming-shows', {
      name: 'Upcoming Shows',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFDE2D',
      sound: true,
    });

    await Notifications.setNotificationChannelAsync('playback', {
      name: 'Playback Controls',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1E3EA1',
      sound: false,
    });
  }

  return token;
}

// Schedule notifications for upcoming shows
export async function scheduleShowNotifications() {
  if (Platform.OS === 'web') return;

  try {
    // Cancel all existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Get user's liked shows
    const likedShows = await getLikedShows();
    
    if (likedShows.length === 0) return;
    
    const now = new Date();
    
    for (const show of likedShows) {
      // Parse show time
      const [startTime] = show.time.split(' - ');
      const [startHour, startMinute] = startTime.split(':').map(Number);
      
      // Create notification time (15 minutes before show starts)
      const notificationTime = new Date(now);
      notificationTime.setHours(startHour, startMinute - 15, 0);
      
      // If time has already passed today, schedule for tomorrow
      if (notificationTime < now) {
        notificationTime.setDate(notificationTime.getDate() + 1);
      }
      
      // Calculate seconds until notification
      const secondsUntilNotification = Math.floor((notificationTime.getTime() - now.getTime()) / 1000);
      
      // Schedule notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${show.name} starts soon!`,
          body: `Tune in to Radio 47 in 15 minutes for ${show.name} with ${show.host}`,
          data: { showId: show.id },
          sound: true,
          badge: 1,
          categoryIdentifier: 'upcoming-shows',
        },
        trigger: { 
          seconds: secondsUntilNotification,
          repeats: false,
        },
      });
      
      // Also send an immediate notification for testing purposes
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Coming up next: ${show.name}`,
          body: `Get ready for ${show.name} with ${show.host}`,
          data: { showId: show.id },
          sound: true,
          badge: 1,
          categoryIdentifier: 'upcoming-shows',
        },
        trigger: null, // Send immediately
      });
    }
  } catch (error) {
    console.error('Error scheduling notifications:', error);
  }
}

// Create or update playback notification
export async function updatePlaybackNotification(
  isPlaying: boolean, 
  showName: string, 
  hostName: string,
  isMuted: boolean
) {
  if (Platform.OS === 'web') return;

  try {
    // First dismiss any existing notifications to avoid duplicates
    await Notifications.dismissAllNotificationsAsync();

    // Only create notification if audio is playing
    if (!isPlaying) return;

    // Define notification actions
    const actions = [
      {
        identifier: 'play',
        buttonTitle: isPlaying ? '⏸️ Pause' : '▶️ Play',
        options: {
          isDestructive: false,
          isAuthenticationRequired: false,
        },
      },
      {
        identifier: 'mute',
        buttonTitle: isMuted ? '🔊 Unmute' : '🔇 Mute',
        options: {
          isDestructive: false,
          isAuthenticationRequired: false,
        },
      },
    ];

    // Set up notification category with actions
    await Notifications.setNotificationCategoryAsync('playback', {
      name: 'Playback Controls',
      actions,
    });

    // Schedule the notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Radio 47',
        body: `🎵 Now Playing: ${showName}\n👤 ${hostName}`,
        data: { isPlaying, isMuted },
        categoryIdentifier: 'playback',
        sound: false,
        badge: 1,
        sticky: true, // Make notification persistent
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Error updating playback notification:', error);
  }
}