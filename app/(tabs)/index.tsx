import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { firestore } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import NewsContainer from '../../components/NewsContainer';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { NewsItem } from '../../types'


const IndexScreen = () => {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const navigation = useNavigation<NavigationProp<RootStackParamList, 'Index'>>();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsCollection = collection(firestore, 'news');
        const newsSnapshot = await getDocs(newsCollection);
        const newsList = newsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<NewsItem, "id">),
        })) as NewsItem[];

        newsList.sort((a, b) => b.number - a.number);

        setNewsData(newsList);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchNews();
  }, []);

  const handlePress = (item: NewsItem) => {
    navigation.navigate('NewsDetail', {
      title: item.title,
      content: item.content,
      imageURL: item.imageURL,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={newsData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NewsContainer
            title={item.title}
            content={item.content}
            imageURL={item.imageURL}
            number={item.number}
            onPress={() => handlePress(item)}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default IndexScreen;
