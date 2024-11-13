// NewsDetailScreen.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NewsDetailScreen = ({ route }) => {
  const { title, content, imageURL } = route.params;

  return (
    <SafeAreaView>
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: imageURL }} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.content}>{content}</Text>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#000', // Set background color to black for contrast
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#fff', // Set title text color to white
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#fff', // Set content text color to white
  },
});

export default NewsDetailScreen;
