import React from 'react';
import { ScrollView } from 'react-native';
import NewsContainer from '../../components/NewsContainer'; // Import the NewsContainer

const HomeScreen = ({ navigation }: any) => {
  const newsData = [
    { title: 'News Title 1', imageSource: require('../../assets/images/exampleNews.jpg') },
  ];

  const handlePress = (imageSource: any, title: string) => {
    navigation.navigate('NewsDetail', { imageSource, title });
  };

  return (
    <ScrollView>
      {newsData.map((news, index) => (
        <NewsContainer
          key={index}
          imageSource={news.imageSource}
          title={news.title}
          onPress={() => handlePress(news.imageSource, news.title)}
        />
      ))}
    </ScrollView>
  );
};

export default HomeScreen;
