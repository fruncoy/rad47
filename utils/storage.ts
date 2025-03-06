import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LikedShow {
  id: string;
  name: string;
  host: string;
  time: string;
  days: string;
  image: any;
  likedAt: number;
  notificationsEnabled?: boolean;
}

const LIKED_SHOWS_KEY = '@radio47:liked_shows';
const NOTIFICATION_SETTINGS_KEY = '@radio47:notification_settings';

export async function getLikedShows(): Promise<LikedShow[]> {
  try {
    if (Platform.OS === 'web') {
      const data = localStorage.getItem(LIKED_SHOWS_KEY);
      return data ? JSON.parse(data) : [];
    } else {
      const data = await AsyncStorage.getItem(LIKED_SHOWS_KEY);
      return data ? JSON.parse(data) : [];
    }
  } catch (error) {
    console.error('Error getting liked shows:', error);
    return [];
  }
}

export async function toggleLikeShow(show: Omit<LikedShow, 'likedAt' | 'id'> & { id?: string, likedAt?: number }): Promise<boolean> {
  try {
    const likedShows = await getLikedShows();
    const showId = show.id || `${show.name}-${show.time}`;
    const isLiked = likedShows.some(s => s.id === showId);
    
    let newLikedShows;
    if (isLiked) {
      newLikedShows = likedShows.filter(s => s.id !== showId);
    } else {
      newLikedShows = [...likedShows, {
        ...show,
        id: showId,
        likedAt: show.likedAt || Date.now(),
        notificationsEnabled: true // Enable notifications by default for new liked shows
      }];
    }
    
    if (Platform.OS === 'web') {
      localStorage.setItem(LIKED_SHOWS_KEY, JSON.stringify(newLikedShows));
    } else {
      await AsyncStorage.setItem(LIKED_SHOWS_KEY, JSON.stringify(newLikedShows));
    }
    return !isLiked;
  } catch (error) {
    console.error('Error toggling show like:', error);
    return false;
  }
}

export async function isShowLiked(showName: string, showTime: string): Promise<boolean> {
  try {
    const likedShows = await getLikedShows();
    return likedShows.some(show => show.id === `${showName}-${showTime}`);
  } catch (error) {
    console.error('Error checking if show is liked:', error);
    return false;
  }
}

export async function toggleShowNotifications(showId: string): Promise<boolean> {
  try {
    const likedShows = await getLikedShows();
    const showIndex = likedShows.findIndex(s => s.id === showId);
    
    if (showIndex === -1) return false;
    
    const updatedShows = [...likedShows];
    updatedShows[showIndex] = {
      ...updatedShows[showIndex],
      notificationsEnabled: !updatedShows[showIndex].notificationsEnabled
    };
    
    if (Platform.OS === 'web') {
      localStorage.setItem(LIKED_SHOWS_KEY, JSON.stringify(updatedShows));
    } else {
      await AsyncStorage.setItem(LIKED_SHOWS_KEY, JSON.stringify(updatedShows));
    }
    
    return updatedShows[showIndex].notificationsEnabled;
  } catch (error) {
    console.error('Error toggling show notifications:', error);
    return false;
  }
}

// Get global notification settings
export async function getNotificationSettings(): Promise<{
  upcomingShows: boolean;
  newContent: boolean;
  specialEvents: boolean;
}> {
  try {
    const defaultSettings = {
      upcomingShows: true,
      newContent: true,
      specialEvents: true
    };
    
    if (Platform.OS === 'web') {
      const data = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      return data ? JSON.parse(data) : defaultSettings;
    } else {
      const data = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      return data ? JSON.parse(data) : defaultSettings;
    }
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return {
      upcomingShows: true,
      newContent: true,
      specialEvents: true
    };
  }
}

// Update global notification settings
export async function updateNotificationSettings(settings: {
  upcomingShows?: boolean;
  newContent?: boolean;
  specialEvents?: boolean;
}): Promise<boolean> {
  try {
    const currentSettings = await getNotificationSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    
    if (Platform.OS === 'web') {
      localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(updatedSettings));
    } else {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(updatedSettings));
    }
    
    return true;
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return false;
  }
}