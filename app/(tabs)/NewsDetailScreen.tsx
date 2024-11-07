import React from 'react';
import { View, Image, Text, StyleSheet, ScrollView } from 'react-native';

const NewsDetailScreen = ({ route }: any) => {
  const { imageSource, title, content } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Image source={imageSource} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.content}>{content}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    padding: 10,
    textAlign: 'center',
  },
  content: {
    fontSize: 16,
    color: 'black',
    paddingHorizontal: 15,
    paddingVertical: 10,
    lineHeight: 24,
  },
});

export default NewsDetailScreen;
