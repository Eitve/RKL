import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';

interface NewsContainerProps {
  title: string;
  content: string;
  imageURL: string;
  number: number;
  onPress: () => void;
}

const NewsContainer: React.FC<NewsContainerProps> = ({ title, content, imageURL, number, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <ImageBackground source={{ uri: imageURL }} style={styles.imageBackground} resizeMode="cover">
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  imageBackground: {
    width: '100%',
    height: 200,
    justifyContent: 'flex-end',
  },
  textContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
  },
  number: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    color: '#fff',
  },
});

export default NewsContainer;
