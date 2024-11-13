// NewsDetailScreen.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types'; // Adjust the import path as needed

// Define the route prop type for this screen
type NewsDetailScreenRouteProp = RouteProp<RootStackParamList, 'NewsDetail'>;

interface Props {
  route: NewsDetailScreenRouteProp;
}

const NewsDetailScreen: React.FC<Props> = ({ route }) => {
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
    backgroundColor: '#000',
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
    color: '#fff',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#fff',
  },
});

export default NewsDetailScreen;
