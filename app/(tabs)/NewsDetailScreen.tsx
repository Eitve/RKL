import React from 'react';
import { View, ImageBackground, Text, ScrollView, StyleSheet } from 'react-native';

export default function NewsDetailScreen({ route }) {
  const { imageSource, title, content } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={imageSource} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.content}>{content}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  image: {
    width: '100%',
    height: 200,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});
