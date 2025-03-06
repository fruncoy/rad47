import { StyleSheet, View, Text, ScrollView, Image, Pressable, Switch } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../../components/Header';
import { getLikedShows, LikedShow, toggleShowNotifications, getNotificationSettings, updateNotificationSettings } from '../../utils/storage';
import { scheduleShowNotifications } from '../../utils/notifications';

const motivationalMessages = [
  "Tune in to Radio 47 for the latest news and entertainment! 🎵",
  "Your favorite shows are coming up! Don't miss out! 🎧",
  "Stay connected with Radio 47 - Hapa Ndipo! 🌟",
  "Get ready for an amazing lineup of shows today! 📻",
  "Your daily dose of entertainment is waiting for you! ✨"
];

function getNextShowTime(show: LikedShow): string {
  const now = new Date();
  const [startHour, startMinute] = show.time.split(' - ')[0].split(':').map(Number);
  let nextShow = new Date(now);
  nextShow.setHours(startHour, startMinute, 0);

  if (nextShow < now) {
    nextShow.setDate(nextShow.getDate() + 1);
  }

  const timeUntil = nextShow.getTime() - now.getTime();
  const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
  const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));

  if (hoursUntil > 24) {
    return `in ${Math.floor(hoursUntil / 24)} days`;
  } else if (hoursUntil > 0) {
    return `in ${hoursUntil}h ${minutesUntil}m`;
  } else {
    return `in ${minutesUntil} minutes`;
  }
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [likedShows, setLikedShows] = useState<LikedShow[]>([]);
  const [motivationalIndex, setMotivationalIndex] = useState(0);
  const [notificationSettings, setNotificationSettings] = useState({
    upcomingShows: true,
    newContent: true,
    specialEvents: true
  });

  useEffect(() => {
    loadLikedShows();
    loadNotificationSettings();
    const interval = setInterval(() => {
      setMotivationalIndex(i => (i + 1) % motivationalMessages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadLikedShows();
      loadNotificationSettings();
      return () => {};
    }, [])
  );

  const loadLikedShows = async () => {
    const shows = await getLikedShows();
    setLikedShows(shows.sort((a, b) => b.likedAt - a.likedAt));
  };

  const loadNotificationSettings = async () => {
    const settings = await getNotificationSettings();
    setNotificationSettings(settings);
  };

  const handleToggleShowNotification = async (showId: string) => {
    const isEnabled = await toggleShowNotifications(showId);
    await loadLikedShows();
    
    // Reschedule notifications after toggling
    await scheduleShowNotifications();
  };

  const handleToggleGlobalSetting = async (setting: keyof typeof notificationSettings) => {
    const newValue = !notificationSettings[setting];
    await updateNotificationSettings({ [setting]: newValue });
    setNotificationSettings(prev => ({ ...prev, [setting]: newValue }));
    
    // Reschedule notifications after changing settings
    if (setting === 'upcomingShows') {
      await scheduleShowNotifications();
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.motivationalCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="notifications" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.motivationalText}>
            {motivationalMessages[motivationalIndex]}
          </Text>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>Upcoming Shows</Text>
                <Text style={styles.settingDescription}>Get notified 15 minutes before your favorite shows start</Text>
              </View>
              <Switch
                value={notificationSettings.upcomingShows}
                onValueChange={() => handleToggleGlobalSetting('upcomingShows')}
                trackColor={{ false: '#D1D1D6', true: '#1E3EA1' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>New Content</Text>
                <Text style={styles.settingDescription}>Get notified when new shows or episodes are added</Text>
              </View>
              <Switch
                value={notificationSettings.newContent}
                onValueChange={() => handleToggleGlobalSetting('newContent')}
                trackColor={{ false: '#D1D1D6', true: '#1E3EA1' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>Special Events</Text>
                <Text style={styles.settingDescription}>Get notified about special broadcasts and events</Text>
              </View>
              <Switch
                value={notificationSettings.specialEvents}
                onValueChange={() => handleToggleGlobalSetting('specialEvents')}
                trackColor={{ false: '#D1D1D6', true: '#1E3EA1' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your Favorite Shows</Text>
        
        {likedShows.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={48} color="#1E3EA1" />
            <Text style={styles.emptyStateText}>
              You haven't liked any shows yet.{'\n'}
              Like shows to get notifications about upcoming episodes!
            </Text>
          </View>
        ) : (
          <View style={styles.showsGrid}>
            {likedShows.map((show) => (
              <View key={show.id} style={styles.notificationCard}>
                <Image source={show.image} style={styles.showImage} />
                <View style={styles.showInfo}>
                  <View style={styles.showHeader}>
                    <Text style={styles.showName}>{show.name}</Text>
                    <Switch
                      value={show.notificationsEnabled !== false}
                      onValueChange={() => handleToggleShowNotification(show.id)}
                      trackColor={{ false: '#D1D1D6', true: '#1E3EA1' }}
                      thumbColor="#FFFFFF"
                      style={styles.notificationSwitch}
                    />
                  </View>
                  <Text style={styles.showHost}>{show.host}</Text>
                  <View style={styles.timeInfo}>
                    <Text style={styles.nextShow}>
                      Next show {getNextShowTime(show)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  motivationalCard: {
    backgroundColor: '#1E3EA1',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  motivationalText: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
    fontWeight: '600',
  },
  settingsSection: {
    marginBottom: 30,
  },
  settingsCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3EA1',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3EA1',
    marginBottom: 20,
  },
  showsGrid: {
    gap: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    overflow: 'hidden',
    height: 100,
  },
  showImage: {
    width: 100,
    height: '100%',
  },
  showInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  showHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  showName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3EA1',
    flex: 1,
    marginRight: 8,
  },
  notificationSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  showHost: {
    fontSize: 14,
    color: '#666666',
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextShow: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    textAlign: 'center',
    color: '#666666',
    marginTop: 16,
    lineHeight: 24,
  },
});