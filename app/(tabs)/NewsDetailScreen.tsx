import React from 'react';
import { View, ImageBackground, Text, StyleSheet } from 'react-native';

const NewsDetailScreen = () => {
  return (
    <View style={styles.container}>
      <ImageBackground source={{ uri: 'your-image-url' }} style={styles.image}>
        <Text style={styles.title}>News Title</Text>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 24,
    color: 'white',
    padding: 10,
  },
});

export default NewsDetailScreen;
