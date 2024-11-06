import React from 'react';
import { Tabs } from 'expo-router';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

import NewsDetailScreen from '@/app/(tabs)/NewsDetailScreen'; // Import NewsDetailScreen
import HomeScreen from '@/app/(tabs)/index';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const NewsStack = createNativeStackNavigator();

  // Define the News stack navigator with both HomeScreen and NewsDetailScreen
  function NewsStackScreen() {
    return (
      <NewsStack.Navigator>
        <NewsStack.Screen
          name="Home"
          component={index}
          options={{ headerShown: false }}
        />
        <NewsStack.Screen
          name="NewsDetail"
          component={NewsDetailScreen}
          options={{
            title: 'News Detail',
            headerBackTitle: 'Back',
          }}
        />
      </NewsStack.Navigator>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index" // The News tab
        options={{
          title: 'News',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name="newspaper-variant-outline"
              size={24}
              color="white"
            />
          ),
        }}
        component={NewsStackScreen} // Set the News stack navigator as the component
      />
      <Tabs.Screen
        name="explore" // The Standings tab
        options={{
          title: 'Standings',
          tabBarIcon: ({ color, focused }) => (
            <AntDesign name="barschart" size={24} color="white" />
          ),
        }}
      />
    </Tabs>
  );
}
