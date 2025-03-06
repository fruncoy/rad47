import { StyleSheet, View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { useState } from 'react';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';

const EQUALIZER_BARS = 10;

function EqualizerBars() {
  const bars = Array.from({ length: EQUALIZER_BARS }, (_, i) => {
    const height = useSharedValue(20 + Math.random() * 40);
    
    useState(() => {
      height.value = withRepeat(
        withSequence(
          withTiming(20 + Math.random() * 40, {
            duration: 500 + Math.random() * 500,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(60 + Math.random() * 20, {
            duration: 500 + Math.random() * 500,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        true
      );
    }, []);

    const style = useAnimatedStyle(() => ({
      height: height.value,
    }));

    return (
      <Animated.View
        key={i}
        style={[styles.equalizerBar, style]}
      />
    );
  });

  return <View style={styles.equalizerContainer}>{bars}</View>;
}

function SettingsSection({ title, icon, children, initiallyExpanded = false }) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const rotation = useSharedValue(initiallyExpanded ? 180 : 0);
  const height = useSharedValue(initiallyExpanded ? 200 : 0);

  const toggleExpand = () => {
    rotation.value = withSpring(isExpanded ? 0 : 180);
    height.value = withSpring(isExpanded ? 0 : 200);
    setIsExpanded(!isExpanded);
  };

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: height.value === 0 ? 0 : 1,
  }));

  return (
    <View style={styles.section}>
      <Pressable style={styles.sectionHeader} onPress={toggleExpand}>
        <View style={styles.sectionHeaderLeft}>
          <Ionicons name={icon} size={24} color="#1E3EA1" />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Animated.View style={iconStyle}>
          <Ionicons name="chevron-down" size={24} color="#1E3EA1" />
        </Animated.View>
      </Pressable>
      <Animated.View style={[styles.sectionContent, contentStyle]}>
        {children}
      </Animated.View>
    </View>
  );
}

export default function SettingsScreen() {
  const openPrivacyPolicy = () => {
    Linking.openURL('https://www.radio47.fm/tc/');
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.equalizerCard}>
          <Text style={styles.equalizerTitle}>Audio Equalizer</Text>
          <EqualizerBars />
        </View>

        <SettingsSection title="Account" icon="person">
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Profile</Text>
            <Text style={styles.settingValue}>Onfrey Tech</Text>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Email</Text>
            <Text style={styles.settingValue}>sos@onfrey.com</Text>
          </View>
        </SettingsSection>

        <SettingsSection title="Preferences" icon="options">
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Theme</Text>
            <Text style={styles.settingValue}>Light</Text>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Language</Text>
            <Text style={styles.settingValue}>English</Text>
          </View>
        </SettingsSection>

        <SettingsSection title="Notifications" icon="notifications">
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingValue}>Enabled</Text>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Email Updates</Text>
            <Text style={styles.settingValue}>Weekly</Text>
          </View>
        </SettingsSection>

        <SettingsSection title="About" icon="information-circle">
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Version</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Build</Text>
            <Text style={styles.settingValue}>2025.1</Text>
          </View>
        </SettingsSection>

        <SettingsSection title="Privacy Policy" icon="shield-checkmark">
          <View style={styles.privacySection}>
            <Text style={styles.privacyText}>
              Radio 47 respects your privacy and only collects minimal data necessary to provide our services. We use the following permissions:
            </Text>
            
            <View style={styles.permissionItem}>
              <Ionicons name="globe-outline" size={20} color="#1E3EA1" />
              <Text style={styles.permissionText}>
                <Text style={styles.bold}>INTERNET:</Text> Required to stream radio content and live broadcasts.
              </Text>
            </View>
            
            <View style={styles.permissionItem}>
              <Ionicons name="notifications-outline" size={20} color="#1E3EA1" />
              <Text style={styles.permissionText}>
                <Text style={styles.bold}>POST_NOTIFICATIONS:</Text> Used to notify you about your favorite shows.
              </Text>
            </View>
            
            <View style={styles.permissionItem}>
              <Ionicons name="power-outline" size={20} color="#1E3EA1" />
              <Text style={styles.permissionText}>
                <Text style={styles.bold}>WAKE_LOCK & FOREGROUND_SERVICE:</Text> Allows audio playback when the app is in the background.
              </Text>
            </View>
            
            <Text style={styles.privacyText}>
              We do not record audio or access your microphone. For our complete privacy policy, please visit our website.
            </Text>
            
            <Pressable style={styles.linkButton} onPress={openPrivacyPolicy}>
              <Text style={styles.linkButtonText}>View Full Privacy Policy</Text>
              <Ionicons name="arrow-forward" size={16} color="#1E3EA1" />
            </Pressable>
          </View>
        </SettingsSection>
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
    paddingTop: 100,
    paddingBottom: 40,
  },
  equalizerCard: {
    backgroundColor: '#1E3EA1',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    marginTop: 20,
  },
  equalizerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  equalizerContainer: {
    flexDirection: 'row',
    height: 80,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  equalizerBar: {
    width: 4,
    backgroundColor: '#FFDE2D',
    borderRadius: 2,
  },
  section: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3EA1',
  },
  sectionContent: {
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  settingLabel: {
    fontSize: 16,
    color: '#666666',
  },
  settingValue: {
    fontSize: 16,
    color: '#1E3EA1',
    fontWeight: '500',
  },
  privacySection: {
    padding: 20,
    paddingTop: 0,
  },
  privacyText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 16,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 10,
    gap: 10,
  },
  permissionText: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
    color: '#333333',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 8,
  },
  linkButtonText: {
    color: '#1E3EA1',
    fontSize: 14,
    fontWeight: '600',
  },
});