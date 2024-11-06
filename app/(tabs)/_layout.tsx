import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

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
