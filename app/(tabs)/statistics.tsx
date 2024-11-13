// statistics.tsx
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { firestore } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const StatisticsScreen = () => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace 'testCollection' with your actual collection name in Firestore
        const querySnapshot = await getDocs(collection(firestore, 'testCollection'));
        querySnapshot.forEach(doc => {
          console.log(`${doc.id} =>`, doc.data());
        });
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  return (
    <View>
      <Text>Statistics Screen</Text>
    </View>
  );
};

export default StatisticsScreen;
