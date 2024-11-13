// NewsContainer.tsx
import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NewsContainerProps {
  title: string;
  content: string;
  imageURL: string;
  onPress: () => void; // Add a prop to handle press events
}

const NewsContainer: React.FC<NewsContainerProps> = ({ title, content, imageURL, onPress }) => {
  return (
    <SafeAreaView>
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <ImageBackground
        source={{ uri: imageURL }}
        style={styles.imageBackground}
        resizeMode="cover"
      >
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  imageBackground: {
    width: '100%',
    height: 200, // Set your preferred height
    justifyContent: 'flex-end', // Align text at the bottom of the image
  },
  textContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Add a semi-transparent overlay for readability
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff', // Make text white for contrast
  },
  content: {
    color: '#fff',
  },
});

export default NewsContainer;
