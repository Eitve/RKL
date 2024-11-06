import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import NewsContainer from '@/components/NewsContainer'; // Assuming NewsContainer is set up correctly
import { ThemedView } from '@/components/ThemedView'; 

export default function Index() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <NewsContainer
          imageSource={require('@/assets/images/exampleNews.jpg')}
          title="Taškų lenktynėse – VDU pergalė prieš jaunuosius vilniečius"
          onPress={() => console.log("News item pressed")} // Placeholder for press handling
        />
        {/* Add more NewsContainer components here */}
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
