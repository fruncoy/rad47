import { StyleSheet, View, Text, Pressable, ScrollView, Image, Platform, useWindowDimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useEffect, useState, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Animated, { 
  useAnimatedStyle, 
  withTiming,
  withRepeat,
  withSequence,
  useSharedValue,
  cancelAnimation,
} from 'react-native-reanimated';
import ShowsCarousel from './ShowsCarousel';
import { toggleLikeShow, isShowLiked } from '../utils/storage';
import { registerForPushNotificationsAsync, updatePlaybackNotification, scheduleShowNotifications } from '../utils/notifications';

// Configure audio for background playback
Audio.setAudioModeAsync({
  staysActiveInBackground: true,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
  allowsRecordingIOS: false,
  playsInSilentModeIOS: true,
});

let audioInstance: Audio.Sound | null = null;

const shows = [
  {
    name: 'Nuru 47',
    host: 'Eva Mwalili (Mama wa Taifa)',
    time: '04:00 - 06:00',
    days: 'Weekdays',
    image: require('../assets/images/default.png'),
  },
  {
    name: 'Breakfast 47',
    host: 'Emmanuel Mwashumbe and Mkamburi Chigogo',
    time: '06:00 - 10:00',
    days: 'Weekdays',
    image: require('../assets/images/default.png'),
  },
  {
    name: 'Mchikicho',
    host: 'Mwanaisha Chidzuga',
    time: '10:00 - 13:00',
    days: 'Weekdays',
    image: require('../assets/images/Mchikicho.png'),
  },
  {
    name: 'Baze 47',
    host: 'Manucho The Young Turk',
    time: '13:00 - 15:00',
    days: 'Weekdays',
    image: require('../assets/images/Base-47.png'),
  },
  {
    name: 'Maskani',
    host: 'Billy Miya and Mbaruk Mwalimu',
    time: '15:00 - 19:00',
    days: 'Weekdays',
    image: require('../assets/images/Maskani-47.png'),
  },
  {
    name: 'Chemba',
    host: 'Dr. Ofweneke',
    time: '20:00 - 23:00',
    days: 'Weekdays',
    image: require('../assets/images/Chemba.png'),
  },
];

function getCurrentShow() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  const currentShow = shows.find(show => {
    const [startTime, endTime] = show.time.split(' - ');
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    let showStartTime = startHour * 60 + startMinute;
    let showEndTime = endHour * 60 + endMinute;
    
    // Handle shows that cross midnight
    if (endHour < startHour) {
      showEndTime += 24 * 60;
      if (currentHour < endHour) {
        showStartTime -= 24 * 60;
      }
    }
    
    return currentTime >= showStartTime && currentTime < showEndTime;
  });

  return currentShow || {
    name: "Off Studio",
    host: "With our Amazing DJs",
    time: "24/7",
    days: "All Days",
    image: require('../assets/images/default.png')
  };
}

function getUpcomingShows() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  // Create a list of all possible shows for the next 48 hours
  const upcomingShows = [];
  for (let dayOffset = 0; dayOffset < 2; dayOffset++) {
    shows.forEach(show => {
      const [startTime] = show.time.split(' - ');
      const [startHour, startMinute] = startTime.split(':').map(Number);
      let showStartTime = startHour * 60 + startMinute + (dayOffset * 24 * 60);
      
      if (showStartTime > currentTime) {
        upcomingShows.push({
          ...show,
          actualStartTime: showStartTime,
          displayTime: dayOffset === 0 ? show.time : `Tomorrow ${show.time}`
        });
      }
    });
  }

  // Sort by start time and take the first 5
  return upcomingShows
    .sort((a, b) => a.actualStartTime - b.actualStartTime)
    .slice(0, 5)
    .map(({ actualStartTime, displayTime, ...show }) => ({
      ...show,
      time: displayTime
    }));
}

// Global variable to track if audio is playing
export let isAudioPlaying = false;

// Function to pause audio from other components
export const pauseAudio = async () => {
  if (audioInstance && isAudioPlaying) {
    await audioInstance.pauseAsync();
    isAudioPlaying = false;
    return true;
  }
  return false;
};

export default function AudioPlayer() {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentShow, setCurrentShow] = useState(getCurrentShow());
  const [isLiked, setIsLiked] = useState(false);
  const [upcomingShows, setUpcomingShows] = useState(getUpcomingShows());
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification>();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    const checkLikedStatus = async () => {
      if (currentShow.name !== "Off Studio") {
        const liked = await isShowLiked(currentShow.name, currentShow.time);
        setIsLiked(liked);
      } else {
        setIsLiked(false);
      }
    };
    checkLikedStatus();
  }, [currentShow]);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      // Register for push notifications
      registerForPushNotificationsAsync().then(token => {
        if (token) setExpoPushToken(token.data);
      });

      // Schedule notifications for upcoming shows
      scheduleShowNotifications();

      // Listen for notification received
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification);
      });

      // Listen for notification response
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        const { actionIdentifier } = response;
        
        if (actionIdentifier === 'play') {
          playSound();
        } else if (actionIdentifier === 'mute') {
          toggleMute();
        }
      });

      return () => {
        Notifications.removeNotificationSubscription(notificationListener.current);
        Notifications.removeNotificationSubscription(responseListener.current);
      };
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newCurrentShow = getCurrentShow();
      setCurrentShow(newCurrentShow);
      setUpcomingShows(getUpcomingShows());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (!audioRef.current) {
        const audio = new window.Audio('https://streaming.shoutcast.com/radio-47');
        audio.preload = 'none';
        audioRef.current = audio;

        audio.addEventListener('waiting', () => setIsLoading(true));
        audio.addEventListener('playing', () => setIsLoading(false));
        audio.addEventListener('canplay', () => setIsLoading(false));
        audio.addEventListener('error', () => setIsLoading(false));
      }

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
          audioRef.current.removeEventListener('waiting', () => setIsLoading(true));
          audioRef.current.removeEventListener('playing', () => setIsLoading(false));
          audioRef.current.removeEventListener('canplay', () => setIsLoading(false));
          audioRef.current.removeEventListener('error', () => setIsLoading(false));
        }
      };
    }

    return () => {
      if (audioInstance) {
        audioInstance.unloadAsync();
        audioInstance = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying && !isLoading) {
      rotation.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(360, { duration: 20000 })
        ),
        -1,
        false
      );
    } else {
      cancelAnimation(rotation);
    }
    
    // Update global state
    isAudioPlaying = isPlaying;
    
    // Show persistent notification when audio is playing
    if (Platform.OS !== 'web') {
      updatePlaybackNotification(isPlaying, currentShow.name, currentShow.host, isMuted);
    }
  }, [isPlaying, isLoading, currentShow, isMuted]);

  async function playSound() {
    try {
      if (Platform.OS === 'web') {
        if (audioRef.current) {
          if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
          } else {
            setIsLoading(true);
            await audioRef.current.play();
            setIsPlaying(true);
          }
        }
      } else {
        if (audioInstance) {
          if (isPlaying) {
            await audioInstance.pauseAsync();
            setIsPlaying(false);
          } else {
            setIsLoading(true);
            await audioInstance.playAsync();
            setIsPlaying(true);
          }
        } else {
          setIsLoading(true);
          try {
            const { sound } = await Audio.Sound.createAsync(
              { uri: 'https://streaming.shoutcast.com/radio-47' },
              { 
                shouldPlay: true,
                isLooping: true,
                staysActiveInBackground: true 
              }
            );
            audioInstance = sound;
            setIsPlaying(true);
          } catch (error) {
            console.error('Error creating audio instance:', error);
            // Try alternative stream URL if the first one fails
            try {
              const { sound } = await Audio.Sound.createAsync(
                { uri: 'https://radio47.radioca.st/stream' },
                { 
                  shouldPlay: true,
                  isLooping: true,
                  staysActiveInBackground: true 
                }
              );
              audioInstance = sound;
              setIsPlaying(true);
            } catch (secondError) {
              console.error('Error with backup stream:', secondError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsLoading(false);
    }

    // Update notification with playback controls
    if (Platform.OS !== 'web') {
      await updatePlaybackNotification(isPlaying, currentShow.name, currentShow.host, isMuted);
    }
  }

  async function toggleMute() {
    if (Platform.OS === 'web') {
      if (audioRef.current) {
        audioRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
      }
    } else {
      if (audioInstance) {
        await audioInstance.setIsMutedAsync(!isMuted);
        setIsMuted(!isMuted);
      }
    }

    // Update notification with new mute state
    if (Platform.OS !== 'web') {
      await updatePlaybackNotification(isPlaying, currentShow.name, currentShow.host, !isMuted);
    }
  }

  const handleLike = async () => {
    if (currentShow.name === "Off Studio") return;
    
    scale.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
    const newIsLiked = await toggleLikeShow({
      id: `${currentShow.name}-${currentShow.time}`,
      name: currentShow.name,
      host: currentShow.host,
      time: currentShow.time,
      days: currentShow.days,
      image: currentShow.image,
      likedAt: Date.now()
    });
    
    setIsLiked(newIsLiked);
    
    // If the show was liked, schedule notifications for it
    if (newIsLiked && Platform.OS !== 'web') {
      scheduleShowNotifications();
    }
  };

  const borderRotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const albumSize = Math.min(windowHeight * 0.3, 280);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 80 }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          <Animated.View 
            style={[
              styles.albumContainer,
              borderRotationStyle,
              { width: albumSize, height: albumSize, borderRadius: albumSize / 2 }
            ]}
          >
            <LinearGradient
              colors={['#182d7e', '#1E3EA1']}
              style={[styles.albumGradient, { borderRadius: (albumSize - 30) / 2 }]}
            >
              <View style={[styles.albumInner, { borderRadius: (albumSize - 36) / 2 }]}>
                <Image 
                  source={currentShow.image}
                  style={styles.albumArt}
                  resizeMode="cover"
                />
              </View>
            </LinearGradient>
          </Animated.View>

          <View style={styles.controls}>
            <Pressable style={styles.outlineButton} onPress={toggleMute}>
              <Ionicons 
                name={isMuted ? "volume-mute" : "volume-high"} 
                size={24} 
                color="#1E3EA1" 
              />
            </Pressable>
            <Pressable 
              style={[styles.playButton, isLoading && styles.playButtonLoading]} 
              onPress={playSound}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="large" color="white" />
              ) : (
                <Ionicons 
                  name={isPlaying ? "pause" : "play"} 
                  size={32} 
                  color="white" 
                />
              )}
            </Pressable>
            <Animated.View style={heartStyle}>
              <Pressable 
                style={[
                  styles.outlineButton,
                  currentShow.name === "Off Studio" && styles.outlineButtonDisabled
                ]} 
                onPress={handleLike}
                disabled={currentShow.name === "Off Studio"}
              >
                <Ionicons 
                  name={isLiked ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isLiked ? "#FF3B30" : "#1E3EA1"} 
                />
              </Pressable>
            </Animated.View>
          </View>

          <View style={styles.trackInfo}>
            <Text style={styles.label}>Now Playing</Text>
            <Text style={styles.title}>{currentShow.name}</Text>
            <Text style={styles.host}>{currentShow.host}</Text>
          </View>
        </View>

        <View style={styles.upcomingSection}>
          <View style={styles.upcomingContent}>
            <Text style={styles.sectionTitle}>Coming Up Next</Text>
            <ShowsCarousel shows={upcomingShows} />
          </View>
        </View>
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
  mainContent: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
  },
  albumContainer: {
    padding: 15,
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#FFDE2D',
  },
  albumGradient: {
    flex: 1,
    padding: 3,
  },
  albumInner: {
    flex: 1,
    overflow: 'hidden',
  },
  albumArt: {
    width: '100%',
    height: '100%',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    gap: 30,
  },
  outlineButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#1E3EA1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  outlineButtonDisabled: {
    opacity: 0.5,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1E3EA1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonLoading: {
    opacity: 0.8,
  },
  trackInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  label: {
    color: '#666',
    fontSize: 14,
  },
  title: {
    color: '#1E3EA1',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  host: {
    color: '#999',
    fontSize: 16,
    marginTop: 4,
  },
  upcomingSection: {
    backgroundColor: 'rgba(30, 62, 161, 0.05)',
    borderTopLeftRadius: 40,
    marginTop: 20,
    marginHorizontal: -20,
  },
  upcomingContent: {
    padding: 20,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3EA1',
    marginBottom: 20,
    paddingLeft: 20,
  },
});

export { isAudioPlaying }