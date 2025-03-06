import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import ShowCard from '../../components/ShowCard';

const allShows = {
  weekday: [
    {
      name: 'Nuru 47',
      host: 'Eva Mwalili (Mama wa Taifa)',
      time: '04:00 - 06:00',
      days: 'Monday to Friday',
      image: require('../../assets/images/default.png'),
    },
    {
      name: 'Breakfast 47',
      host: 'Emmanuel Mwashumbe and Mkamburi Chigogo',
      time: '06:00 - 10:00',
      days: 'Monday to Friday',
      image: require('../../assets/images/default.png'),
    },
    {
      name: 'Mchikicho',
      host: 'Mwanaisha Chidzuga',
      time: '10:00 - 13:00',
      days: 'Monday to Friday',
      image: require('../../assets/images/Mchikicho.png'),
    },
    {
      name: 'Baze 47',
      host: 'Manucho The Young Turk',
      time: '13:00 - 15:00',
      days: 'Monday to Friday',
      image: require('../../assets/images/Base-47.png'),
    },
    {
      name: 'Maskani',
      host: 'Billy Miya and Mbaruk Mwalimu',
      time: '15:00 - 19:00',
      days: 'Monday to Friday',
      image: require('../../assets/images/Maskani-47.png'),
    },
    {
      name: 'Kikao Cha Hoja',
      host: 'Elizabeth Mutuku',
      time: '19:00 - 21:00',
      days: 'Wednesday',
      image: require('../../assets/images/default.png'),
    },
    {
      name: 'Chemba',
      host: 'Dr. Ofweneke',
      time: '20:00 - 23:00',
      days: 'Monday to Friday',
      image: require('../../assets/images/Chemba.png'),
    },
  ],
  saturday: [
    {
      name: 'Sabato Yako',
      host: 'Radio 47 DJ',
      time: '04:00 - 06:00',
      days: 'Saturday',
      image: require('../../assets/images/default.png'),
    },
    {
      name: 'Bahari ya Elimu',
      host: 'Ali Hassan Kaluleni',
      time: '07:00 - 11:00',
      days: 'Saturday',
      image: require('../../assets/images/Bahari-Ya-Elimu.png'),
    },
    {
      name: 'Sato Vibe',
      host: 'Mkamburi Chigogo',
      time: '11:00 - 14:00',
      days: 'Saturday',
      image: require('../../assets/images/default.png'),
    },
    {
      name: 'Dread Beat Reloaded',
      host: 'Radio 47 DJ',
      time: '14:00 - 16:00',
      days: 'Saturday',
      image: require('../../assets/images/default.png'),
    },
    {
      name: 'Mikiki ya Spoti',
      host: 'Sports Team',
      time: '16:00 - 20:00',
      days: 'Saturday',
      image: require('../../assets/images/default.png'),
    },
    {
      name: 'Burdan Satoo',
      host: 'Radio 47 DJ',
      time: '20:00 - 00:00',
      days: 'Saturday',
      image: require('../../assets/images/default.png'),
    },
  ],
  sunday: [
    {
      name: 'Radio 47 Jumapili',
      host: 'Eva Mwalili (Mama wa Taifa)',
      time: '05:00 - 10:00',
      days: 'Sunday',
      image: require('../../assets/images/default.png'),
    },
    {
      name: 'Gospel Automation',
      host: 'Radio 47 DJ',
      time: '10:00 - 13:00',
      days: 'Sunday',
      image: require('../../assets/images/default.png'),
    },
    {
      name: 'Dread Beat Reloaded',
      host: 'Radio 47 DJ',
      time: '13:00 - 16:00',
      days: 'Sunday',
      image: require('../../assets/images/default.png'),
    },
    {
      name: 'Mikiki ya Spoti',
      host: 'Sports Team',
      time: '16:00 - 20:00',
      days: 'Sunday',
      image: require('../../assets/images/default.png'),
    },
    {
      name: 'Kali za Kale',
      host: 'Radio 47 DJ',
      time: '20:00 - 22:00',
      days: 'Sunday',
      image: require('../../assets/images/default.png'),
    },
  ],
};

export default function ShowsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedDay, setSelectedDay] = useState('weekday');

  const tabs = [
    { id: 'weekday', label: 'Weekday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' },
  ];

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 80 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Our Shows</Text>
        
        <View style={styles.tabs}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.id}
              style={[
                styles.tab,
                selectedDay === tab.id && styles.selectedTab,
              ]}
              onPress={() => setSelectedDay(tab.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedDay === tab.id && styles.selectedTabText,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.showsGrid}>
          {allShows[selectedDay].map((show, index) => (
            <ShowCard key={index} show={show} />
          ))}
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
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3EA1',
    marginBottom: 20,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  selectedTab: {
    backgroundColor: '#1E3EA1',
  },
  tabText: {
    color: '#666666',
    fontWeight: '600',
  },
  selectedTabText: {
    color: '#FFFFFF',
  },
  showsGrid: {
    gap: 20,
  },
  showCard: {
    height: 200,
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
  showInfo: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  showName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  showHost: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  showTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  showTime: {
    fontSize: 14,
    color: '#FFDE2D',
    fontWeight: 'bold',
  },
  showDays: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
});