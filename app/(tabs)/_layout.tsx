import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './index';
import NewsDetailScreen from './NewsDetailScreen';
import StandingsScreen from './standings';
import ScheduleScreen from './schedule';
import GameDetailsScreen from './GameDetailScreen';
import StatisticsScreen from './statistics';

import { ThemeProvider, createTheme } from '@rneui/themed';

export type ScheduleStackParamList = {
  ScheduleMain: undefined;
  GameDetails: { gameID: number };
};

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const ScheduleStack = createNativeStackNavigator<ScheduleStackParamList>();

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

function ScheduleStackScreen() {
  return (
    <ScheduleStack.Navigator>
      <ScheduleStack.Screen
        name="ScheduleMain"
        component={ScheduleScreen}
        options={{ headerShown: false }}
      />
      <ScheduleStack.Screen
        name="GameDetails"
        component={GameDetailsScreen}
        options={{ headerShown: false }}
      />
    </ScheduleStack.Navigator>
  );
}

export default function AppTabs() {
  return (
    <NavigationContainer>
      <ThemeProvider theme={theme}>
        <Tab.Navigator initialRouteName="Home">
          <Tab.Screen
            name="ScheduleStack"
            component={ScheduleStackScreen}
            options={{ headerShown: false, title: 'Schedule' }}
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
