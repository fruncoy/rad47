import { StyleSheet, View } from 'react-native';
import Header from '../../components/Header';
import AudioPlayer from '../../components/AudioPlayer';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Header />
      <AudioPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});