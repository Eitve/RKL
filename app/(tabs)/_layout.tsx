import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './index';          // Your home screen
import NewsDetailScreen from './NewsDetailScreen';
import StandingsScreen from './standings'; // Your standings screen
import ScheduleStackScreen from './ScheduleStack'; 
import StatisticsScreen from './statistics';

import { ThemeProvider, createTheme } from '@rneui/themed';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

/**
 * RNE's `createTheme` example
 */
const theme = createTheme({
  lightColors: {
    primary: '#6200ea',
  },
  darkColors: {
    primary: '#bb86fc',
  },
});

/**
 * A stack for Home + NewsDetail 
 * (so tapping on a news item can go to `NewsDetail`)
 */
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

/**
 * Main App Tabs 
 */
export default function AppTabs() {
  return (
    <NavigationContainer>
      <ThemeProvider theme={theme}>
        <Tab.Navigator initialRouteName="Home">
          {/* 
            1) SCHEDULE STACK 
               (includes the schedule list + game details) 
          */}
          <Tab.Screen
            name="ScheduleStack"
            component={ScheduleStackScreen}
            options={{ headerShown: false, title: 'Schedule' }}
          />

          {/* 2) STANDINGS */}
          <Tab.Screen
            name="Standings"
            component={StandingsScreen}
            options={{ headerShown: false }}
          />

          {/* 3) HOME (with its own stack) */}
          <Tab.Screen
            name="Home"
            component={HomeStackScreen}
            options={{ headerShown: false }}
          />

          {/* 4) STATISTICS */}
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
