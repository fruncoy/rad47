import { BlurView } from 'expo-blur';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Header() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View style={styles.radioIcon}>
            <Ionicons name="radio" size={24} color="white" />
            <View style={styles.activeIndicator} />
          </View>
          <Text style={styles.nowPlayingText}>Now Playing</Text>
        </View>
        <Pressable style={styles.profileButton}>
          <Ionicons name="person" size={24} color="#1E3EA1" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E3EA1',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  nowPlayingText: {
    color: '#1E3EA1',
    fontSize: 16,
    fontWeight: '600',
  },
  profileButton: {
    padding: 4,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#1E3EA1',
    alignItems: 'center',
    justifyContent: 'center',
  },
});