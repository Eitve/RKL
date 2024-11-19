import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './index'; // Assuming `index.tsx` is your home screen file
import StandingsScreen from './standings';
import NewsDetailScreen from './NewsDetailScreen';
import ScheduleScreen from './schedule';
import StatisticsScreen from './statistics';
import { ThemeProvider, createTheme } from '@rneui/themed';

// Bottom Tab Navigator and Stack Navigator
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

// Define a custom theme using RNE's `createTheme`
const theme = createTheme({
  lightColors: {
    primary: '#6200ea',
  },
  darkColors: {
    primary: '#bb86fc',
  },
});

// Stack Navigator for Home and NewsDetail screens
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

// Main App Component with Bottom Tab Navigator
export default function AppTabs() {
  return (
    <NavigationContainer>
      <ThemeProvider theme={theme}>
        <Tab.Navigator initialRouteName="Home">
          <Tab.Screen
            name="Schedule"
            component={ScheduleScreen}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="Standings"
            component={StandingsScreen}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="Home"
            component={HomeStackScreen}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="Statistics"
            component={StatisticsScreen}
            options={{ headerShown: false }}
          />
        </Tab.Navigator>
      </ThemeProvider>
    </NavigationContainer>
  );
}
