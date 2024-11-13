import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './index';  // Assuming `index.tsx` is your home screen file
import StandingsScreen from './standings';
import NewsDetailScreen from './NewsDetailScreen';
import { ThemeProvider, createTheme } from '@rneui/themed';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

const theme = createTheme({
  lightColors: {
    primary: '#6200ea',
  },
  darkColors: {
    primary: '#bb86fc',
  },
});

function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="NewsDetail"
        component={NewsDetailScreen}
        options={{ headerShown: false }}
      />
    </HomeStack.Navigator>
  );
}

export default function AppTabs() {
  return (
    <ThemeProvider theme={theme}>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeStackScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Standings" component={StandingsScreen} options={{ headerShown: false }} />
      </Tab.Navigator>
    </ThemeProvider>
  );
}
