import { StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NewsContainer from '@/components/NewsContainer';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const navigation = useNavigation();

  // Function to handle press on a NewsContainer
  const handlePress = (imageSource, title) => {
    navigation.navigate('NewsDetail', {
      imageSource,
      title,
      content: 'This is a large block of scrollable text that represents the news article content...'
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <NewsContainer
          imageSource={require('@/assets/images/exampleNews.jpg')}
          title="Taškų lenktynėse – VDU pergalė prieš jaunuosius vilniečius"
          onPress={() => handlePress(require('@/assets/images/exampleNews.jpg'), 'Taškų lenktynėse – VDU pergalė prieš jaunuosius vilniečius')}
        />
        {/* Add more NewsContainer components as needed */}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    paddingVertical: 16,
  },
});
