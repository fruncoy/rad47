import { StyleSheet, View, Text, ScrollView, Image, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef } from 'react';

type Show = {
  name: string;
  host: string;
  time: string;
  days: string;
  image: any;
};

interface ShowsCarouselProps {
  shows: Show[];
}

const { width: screenWidth } = Dimensions.get('window');
const CARD_SIZE = Math.min(200, screenWidth - 80);
const CARD_GAP = 15;
const CARD_WIDTH = Platform.OS === 'web' ? CARD_SIZE : CARD_SIZE + CARD_GAP;

function formatShowTime(show: Show): { time: string; label: string } {
  const now = new Date();
  const [startTime] = show.time.split(' - ');
  const [hours, minutes] = startTime.split(':').map(Number);
  
  const showTime = new Date(now);
  showTime.setHours(hours, minutes, 0);

  if (showTime < now) {
    showTime.setDate(showTime.getDate() + 1);
  }

  const isToday = showTime.getDate() === now.getDate();
  const isTomorrow = showTime.getDate() === now.getDate() + 1;

  return {
    time: show.time,
    label: isToday ? 'Today' : isTomorrow ? 'Tomorrow' : 'Upcoming'
  };
}

export default function ShowsCarousel({ shows }: ShowsCarouselProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  // Add "Off Studio" as a show if there are no upcoming shows
  const displayShows = shows.length > 0 ? shows : [{
    name: "Off Studio",
    host: "With our Amazing DJs",
    time: "24/7",
    days: "All Days",
    image: require('../assets/images/default.png')
  }];

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH}
        snapToAlignment="start"
        pagingEnabled={false}
        scrollEventThrottle={16}
      >
        {displayShows.map((show, index) => {
          const { time, label } = show.name === "Off Studio" 
            ? { time: "24/7", label: "Currently Playing" }
            : formatShowTime(show);

          return (
            <View 
              key={`${show.name}-${index}`} 
              style={[
                styles.showCard, 
                { 
                  width: CARD_SIZE,
                  marginRight: index === displayShows.length - 1 ? 20 : CARD_GAP 
                }
              ]}
            >
              <Image 
                source={show.image} 
                style={styles.showImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.95)']}
                style={[StyleSheet.absoluteFill, styles.gradient]}
              >
                <View style={styles.showInfo}>
                  <Text style={styles.showName} numberOfLines={2}>{show.name}</Text>
                  {show.host && (
                    <Text style={styles.showHost} numberOfLines={1}>{show.host}</Text>
                  )}
                  <View style={styles.timeContainer}>
                    <View style={styles.timeBadge}>
                      <Text style={styles.timeBadgeText}>{label}</Text>
                    </View>
                    <Text style={styles.showTime}>{time}</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: CARD_SIZE + 20,
  },
  scrollContent: {
    paddingLeft: 20,
    paddingBottom: 20,
  },
  showCard: {
    height: CARD_SIZE,
    backgroundColor: '#1E3EA1',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  showImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    height: '100%',
  },
  showInfo: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  showName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  showHost: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  timeContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  timeBadge: {
    backgroundColor: '#FFDE2D',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  timeBadgeText: {
    color: '#1E3EA1',
    fontSize: 12,
    fontWeight: 'bold',
  },
  showTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});