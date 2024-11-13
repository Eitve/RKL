// index.tsx
import React, { useEffect, useState } from 'react';
import { View, FlatList } from 'react-native';
import { firestore } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import NewsContainer from '../../components/NewsContainer';
import { useNavigation } from '@react-navigation/native';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  imageURL: string;
}

const IndexScreen = () => {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsCollection = collection(firestore, 'news');
        const newsSnapshot = await getDocs(newsCollection);
        const newsList = newsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<NewsItem, "id">),
        })) as NewsItem[];

        setNewsData(newsList);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchNews();
  }, []);

  // Navigate to NewsDetailScreen and pass the news item data
  const handlePress = (item: NewsItem) => {
    navigation.navigate('NewsDetail', {
      title: item.title,
      content: item.content,
      imageURL: item.imageURL,
    });
  };

  return (
    <View>
      <FlatList
        data={newsData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NewsContainer
            title={item.title}
            content={item.content}
            imageURL={item.imageURL}
            onPress={() => handlePress(item)}
          />
        )}
      />
    </View>
  );
};

export default IndexScreen;
